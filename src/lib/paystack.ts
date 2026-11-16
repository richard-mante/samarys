import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, orderItems, orders, payments, products } from "@/db/schema";

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
  const [knownPayment] = await db.select({ id: payments.id, orderId: payments.orderId, status: payments.status })
    .from(payments).where(eq(payments.providerReference, reference)).limit(1);
  if (!knownPayment) throw new Error("No matching order was found for this payment reference.");
  if (knownPayment.status === "PAID") return { orderId: knownPayment.orderId, alreadyPaid: true };
  if (knownPayment.status !== "PENDING") throw new Error("This payment is no longer pending.");

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
    // Lock both records so seller cancellation and payment settlement cannot overwrite one another.
    const [lockedPayment] = await tx.select().from(payments)
      .where(eq(payments.providerReference, reference)).for("update").limit(1);
    if (!lockedPayment) throw new Error("No matching order was found for this payment reference.");

    const [lockedOrder] = await tx.select().from(orders)
      .where(eq(orders.id, lockedPayment.orderId)).for("update").limit(1);
    if (!lockedOrder) throw new Error("The order linked to this payment no longer exists.");

    if (transaction!.amount !== lockedPayment.amountMinor || transaction!.currency !== lockedPayment.currency) {
      throw new Error("The verified payment amount or currency does not match this order.");
    }
    if (lockedOrder.totalMinor !== lockedPayment.amountMinor || lockedOrder.currency !== lockedPayment.currency) {
      throw new Error("The order total has changed and this payment cannot be applied.");
    }
    if (lockedPayment.status === "PAID" || lockedOrder.paymentStatus === "PAID") {
      return { orderId: lockedOrder.id, alreadyPaid: true };
    }
    if (lockedPayment.status !== "PENDING" || lockedOrder.paymentStatus !== "PENDING") {
      throw new Error("This order is no longer awaiting payment.");
    }

    const paidAt = transaction!.paid_at ? new Date(transaction!.paid_at) : new Date();
    const [paidPayment] = await tx.update(payments).set({
      status: "PAID",
      paidAt,
      verifiedAt: new Date(),
      providerPayload: transaction,
      updatedAt: new Date(),
    }).where(and(eq(payments.id, lockedPayment.id), eq(payments.status, "PENDING")))
      .returning({ id: payments.id });
    if (!paidPayment) return { orderId: lockedOrder.id, alreadyPaid: true };

    const [paidOrder] = await tx.update(orders).set({
      paymentStatus: "PAID",
      status: lockedOrder.status === "PENDING_PAYMENT" ? "CONFIRMED" : lockedOrder.status,
      updatedAt: new Date(),
    }).where(and(
      eq(orders.id, lockedOrder.id),
      eq(orders.paymentStatus, "PENDING"),
      eq(orders.status, lockedOrder.status),
    )).returning({ id: orders.id });
    if (!paidOrder) throw new Error("The order payment state changed while settling this transaction.");

    if (lockedOrder.status === "CANCELLED") {
      await tx.insert(auditLogs).values({
        action: "PAYMENT_VERIFIED_FOR_CANCELLED_ORDER",
        entityType: "order",
        entityId: lockedOrder.id,
        metadata: { orderReference: lockedOrder.reference, note: "Seller review and refund may be required." },
      });
    } else {
      // Finite stock is reduced only once payment is verified. Null stock means untracked stock.
      const items = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems).where(eq(orderItems.orderId, lockedOrder.id));
      for (const item of items) {
        if (!item.productId) continue;
        const [stock] = await tx.update(products).set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
          updatedAt: new Date(),
        }).where(eq(products.id, item.productId)).returning({ stockQuantity: products.stockQuantity });
        if (stock && stock.stockQuantity !== null) {
          await tx.insert(auditLogs).values({
            action: "PRODUCT_STOCK_DECREMENTED",
            entityType: "product",
            entityId: item.productId,
            metadata: { orderReference: lockedOrder.reference, quantity: item.quantity, remainingQuantity: stock.stockQuantity },
          });
        }
      }
    }

    return { orderId: lockedOrder.id, alreadyPaid: false };
  });
}
