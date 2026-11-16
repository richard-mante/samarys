import { NextResponse } from "next/server";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { paymentEvents, payments } from "@/db/schema";
import { verifyAndSettlePaystackPayment, verifyPaystackSignature } from "@/lib/paystack";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  data?: { reference?: string; status?: string; amount?: number; currency?: string; paid_at?: string | null; [key: string]: unknown };
};

function duplicateResponse() {
  return NextResponse.json({ received: true, duplicate: true });
}

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
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 5 * 60 * 1000);

  try {
    const [existing] = await db.select().from(paymentEvents)
      .where(eq(paymentEvents.providerEventKey, eventKey)).limit(1);
    let eventId: string;

    if (existing?.status === "PROCESSED") return duplicateResponse();

    if (existing?.status === "RECEIVED") {
      // Treat a recent RECEIVED row as an in-flight claim. Reclaim only after
      // five minutes so a concurrent delivery cannot process the same event.
      if (existing.receivedAt >= staleBefore) return duplicateResponse();
      const [reclaimed] = await db.update(paymentEvents).set({
        receivedAt: now,
        processedAt: null,
      }).where(and(
        eq(paymentEvents.id, existing.id),
        eq(paymentEvents.status, "RECEIVED"),
        lt(paymentEvents.receivedAt, staleBefore),
      )).returning({ id: paymentEvents.id });
      if (!reclaimed) return duplicateResponse();
      eventId = reclaimed.id;
    } else if (existing?.status === "FAILED") {
      const [reclaimed] = await db.update(paymentEvents).set({
        status: "RECEIVED",
        receivedAt: now,
        processedAt: null,
      }).where(and(
        eq(paymentEvents.id, existing.id),
        eq(paymentEvents.status, "FAILED"),
      )).returning({ id: paymentEvents.id });
      if (!reclaimed) return duplicateResponse();
      eventId = reclaimed.id;
    } else {
      const [created] = await db.insert(paymentEvents).values({
        providerEventKey: eventKey,
        eventType: "charge.success",
        status: "RECEIVED",
        receivedAt: now,
      }).onConflictDoNothing().returning({ id: paymentEvents.id });
      if (!created) return duplicateResponse();
      eventId = created.id;
    }

    try {
      const settled = await verifyAndSettlePaystackPayment(reference, payload.data);
      const [payment] = await db.select({ id: payments.id }).from(payments)
        .where(eq(payments.providerReference, reference)).limit(1);
      await db.update(paymentEvents).set({
        paymentId: payment?.id ?? null,
        status: "PROCESSED",
        processedAt: new Date(),
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
