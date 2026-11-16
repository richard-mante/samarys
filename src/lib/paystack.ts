import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { and, asc, eq, gt, inArray, ne, sql, sum } from "drizzle-orm";
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
  if (knownPayment.status === "PAID" || knownPayment.status === "REFUNDED") return { orderId: knownPayment.orderId, alreadyPaid: true };
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
    // Lock payment, order and product rows so settlement, reservations and seller
    // fulfilment changes cannot consume or restore the same stock twice.
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
    if (lockedPayment.status === "PAID" || lockedPayment.status === "REFUNDED" || lockedOrder.paymentStatus === "PAID" || lockedOrder.paymentStatus === "REFUNDED") {
      return { orderId: lockedOrder.id, alreadyPaid: true };
    }
    if (lockedPayment.status !== "PENDING" || lockedOrder.paymentStatus !== "PENDING") {
      throw new Error("This order is no longer awaiting payment.");
    }

    let purchasedItems: { productId: string | null; quantity: number }[] = [];
    let productRows: Array<typeof products.$inferSelect> = [];
    let reservedByProduct = new Map<string | null, number>();
    let stockUnavailable = false;

    if (lockedOrder.status !== "CANCELLED") {
      purchasedItems = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems).where(eq(orderItems.orderId, lockedOrder.id)).orderBy(asc(orderItems.productId));
      const productIds = [...new Set(purchasedItems.map((item) => item.productId).filter((id): id is string => Boolean(id)))];
      productRows = productIds.length ? await tx.select().from(products)
        .where(inArray(products.id, productIds)).orderBy(asc(products.id)).for("update") : [];
      if (productRows.length !== productIds.length) stockUnavailable = true;

      const reservationCutoff = new Date(Date.now() - 30 * 60 * 1000);
      const reservationRows = productIds.length ? await tx.select({
        productId: orderItems.productId,
        reservedQuantity: sum(orderItems.quantity),
      }).from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          inArray(orderItems.productId, productIds),
          ne(orders.id, lockedOrder.id),
          eq(orders.channel, "PAYSTACK"),
          inArray(orders.status, ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING"]),
          eq(orders.paymentStatus, "PENDING"),
          gt(orders.createdAt, reservationCutoff),
        ))
        .groupBy(orderItems.productId) : [];
      reservedByProduct = new Map(reservationRows.map((row) => [row.productId, Number(row.reservedQuantity ?? 0)]));

      const productById = new Map(productRows.map((product) => [product.id, product]));
      for (const item of purchasedItems) {
        if (!item.productId) continue;
        const product = productById.get(item.productId);
        if (!product || (product.stockQuantity !== null &&
          product.stockQuantity - (reservedByProduct.get(item.productId) ?? 0) < item.quantity)) {
          stockUnavailable = true;
          break;
        }
      }
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

    const cancelled = lockedOrder.status === "CANCELLED" || stockUnavailable;
    const nextStatus = cancelled
      ? "CANCELLED"
      : lockedOrder.status === "PENDING_PAYMENT" ? "CONFIRMED" : lockedOrder.status;
    const [paidOrder] = await tx.update(orders).set({
      paymentStatus: "PAID",
      status: nextStatus,
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
    } else if (stockUnavailable) {
      await tx.insert(auditLogs).values({
        action: "PAYMENT_VERIFIED_STOCK_UNAVAILABLE",
        entityType: "order",
        entityId: lockedOrder.id,
        metadata: { orderReference: lockedOrder.reference, note: "Payment received but finite stock was no longer available. Seller review and refund may be required." },
      });
    } else {
      for (const item of purchasedItems) {
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
