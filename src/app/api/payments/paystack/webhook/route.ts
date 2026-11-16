import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentEvents, payments } from "@/db/schema";
import { verifyAndSettlePaystackPayment, verifyPaystackSignature } from "@/lib/paystack";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  data?: { reference?: string; status?: string; amount?: number; currency?: string; paid_at?: string | null; [key: string]: unknown };
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
    const [existing] = await db.select().from(paymentEvents)
      .where(eq(paymentEvents.providerEventKey, eventKey)).limit(1);
    let eventId: string;
    if (existing) {
      if (existing.status === "PROCESSED") {
        return NextResponse.json({ received: true, duplicate: true });
      }
      if (existing.status === "FAILED") {
        await db.update(paymentEvents).set({ status: "RECEIVED", processedAt: null })
          .where(eq(paymentEvents.id, existing.id));
      }
      eventId = existing.id;
    } else {
      const [created] = await db.insert(paymentEvents).values({
        providerEventKey: eventKey, eventType: "charge.success", status: "RECEIVED",
      }).onConflictDoNothing().returning({ id: paymentEvents.id });
      if (!created) return NextResponse.json({ received: true, duplicate: true });
      eventId = created.id;
    }

    try {
      const settled = await verifyAndSettlePaystackPayment(reference, payload.data);
      const [payment] = await db.select({ id: payments.id }).from(payments)
        .where(eq(payments.providerReference, reference)).limit(1);
      await db.update(paymentEvents).set({
        paymentId: payment?.id ?? null, status: "PROCESSED", processedAt: new Date(),
      }).where(eq(paymentEvents.id, eventId));
      return NextResponse.json({ received: true, orderId: settled.orderId });
    } catch {
      await db.update(paymentEvents).set({ status: "FAILED", processedAt: new Date() })
        .where(eq(paymentEvents.id, eventId));
      throw new Error("Webhook processing failed.");
    }
  } catch {
    return NextResponse.json({ error: "Webhook processing failed. Paystack may retry this event." }, { status: 500 });
  }
}
