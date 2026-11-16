import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentEvents } from "@/db/schema";
import { verifyAndSettlePaystackPayment, verifyPaystackSignature } from "@/lib/paystack";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  data?: { reference?: string; [key: string]: unknown };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (payload.event !== "charge.success" || !payload.data?.reference) {
    return NextResponse.json({ received: true });
  }

  const reference = payload.data.reference;
  const eventKey = "paystack:charge.success:" + reference;
  try {
    const [existing] = await db.select({ id: paymentEvents.id }).from(paymentEvents)
      .where(eq(paymentEvents.providerEventKey, eventKey)).limit(1);
    if (existing) return NextResponse.json({ received: true, duplicate: true });

    const [event] = await db.insert(paymentEvents).values({
      providerEventKey: eventKey,
      eventType: "charge.success",
      status: "RECEIVED",
    }).onConflictDoNothing().returning({ id: paymentEvents.id });
    if (!event) return NextResponse.json({ received: true, duplicate: true });

    try {
      const settled = await verifyAndSettlePaystackPayment(reference, payload.data);
      await db.update(paymentEvents).set({ paymentId: (await db.query.payments.findFirst({ where: (table, { eq }) => eq(table.providerReference, reference), columns: { id: true } }))?.id ?? null, status: "PROCESSED", processedAt: new Date() }).where(eq(paymentEvents.id, event.id));
      return NextResponse.json({ received: true, orderId: settled.orderId });
    } catch (error) {
      await db.update(paymentEvents).set({ status: "FAILED", processedAt: new Date() }).where(eq(paymentEvents.id, event.id));
      throw error;
    }
  } catch {
    return NextResponse.json({ error: "Webhook processing failed. Paystack may retry this event." }, { status: 500 });
  }
}
