import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";

type PaystackTransaction = {
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  paid_at?: string | null;
  gateway_response?: string;
  [key: string]: unknown;
};

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack is not configured.");
  return key;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", getSecretKey()).update(rawBody).digest("hex");
  const receivedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function verifyAndSettlePaystackPayment(reference: string, payload?: PaystackTransaction) {
  const secret = getSecretKey();
  let transaction = payload;

  if (!transaction) {
    const response = await fetch("https://api.paystack.co/transaction/verify/" + encodeURIComponent(reference), {
      headers: { Authorization: "Bearer " + secret },
      cache: "no-store",
    });
    const result = await response.json() as { status?: boolean; message?: string; data?: PaystackTransaction };
    if (!response.ok || !result.status || !result.data) {
      throw new Error(result.message || "Paystack could not verify this transaction.");
    }
    transaction = result.data;
  }

  if (transaction.status !== "success" || transaction.reference !== reference) {
    throw new Error("This Paystack transaction has not been completed successfully.");
  }

  return db.transaction(async (tx) => {
    const [payment] = await tx.select().from(payments)
      .where(eq(payments.providerReference, reference)).limit(1);
    if (!payment) throw new Error("No matching order was found for this payment reference.");

    if (transaction!.amount !== payment.amountMinor || transaction!.currency !== payment.currency) {
      throw new Error("The verified payment amount or currency does not match this order.");
    }

    if (payment.status === "PAID") {
      return { orderId: payment.orderId, alreadyPaid: true };
    }

    const [order] = await tx.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
    if (!order) throw new Error("The order linked to this payment no longer exists.");
    if (order.totalMinor !== payment.amountMinor || order.currency !== payment.currency) {
      throw new Error("The order total has changed and this payment cannot be applied.");
    }

    const paidAt = transaction!.paid_at ? new Date(transaction!.paid_at) : new Date();
    await tx.update(payments).set({
      status: "PAID",
      paidAt,
      verifiedAt: new Date(),
      providerPayload: transaction,
      updatedAt: new Date(),
    }).where(and(eq(payments.id, payment.id), eq(payments.status, "PENDING")));

    await tx.update(orders).set({
      paymentStatus: "PAID",
      status: order.status === "PENDING_PAYMENT" ? "CONFIRMED" : order.status,
      updatedAt: new Date(),
    }).where(and(eq(orders.id, order.id), eq(orders.paymentStatus, "PENDING")));

    return { orderId: order.id, alreadyPaid: false };
  });
}
