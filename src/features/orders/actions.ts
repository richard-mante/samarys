"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, gt, inArray, sql, sum } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, orderItems, orders, payments, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { cedisToPesewas } from "@/lib/money";

export type OrderActionState = { error?: string; success?: string };

const statusSchema = z.enum(["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "FULFILLED", "CANCELLED"]);

const allowedTransitions: Record<string, string[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["FULFILLED", "CANCELLED"],
  FULFILLED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(orderId: string, _previous: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return { error: "Choose a valid order status." };

  try {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update").limit(1);
      if (!current) return { error: "This order could not be found." } as const;

      const nextStatus = parsed.data;
      if (!allowedTransitions[current.status]?.includes(nextStatus)) {
        return { error: "That status change is not available from the current order state." } as const;
      }
      if (nextStatus === "FULFILLED" && current.paymentStatus !== "PAID") {
        return { error: "An order must have verified payment before it can be marked fulfilled." } as const;
      }

      const [updated] = await tx.update(orders)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(and(eq(orders.id, orderId), eq(orders.status, current.status)))
        .returning({ id: orders.id });

      if (!updated) return { error: "This order changed while you were editing it. Refresh and try again." } as const;

      if (nextStatus === "CANCELLED" && current.paymentStatus === "PAID") {
        const purchasedItems = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
          .from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.productId));
        for (const item of purchasedItems) {
          if (!item.productId) continue;
          const [stock] = await tx.update(products).set({
            stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          }).where(eq(products.id, item.productId)).returning({ stockQuantity: products.stockQuantity });
          if (stock && stock.stockQuantity !== null) {
            await tx.insert(auditLogs).values({
              adminId: admin.adminId,
              action: "PRODUCT_STOCK_RESTOCKED",
              entityType: "product",
              entityId: item.productId,
              metadata: { orderReference: current.reference, quantity: item.quantity, remainingQuantity: stock.stockQuantity },
            });
          }
        }
      }

      await tx.insert(auditLogs).values({
        adminId: admin.adminId,
        action: "ORDER_STATUS_UPDATED",
        entityType: "order",
        entityId: orderId,
        metadata: { from: current.status, to: nextStatus, reference: current.reference },
      });
      return { success: "Order status updated." } as const;
    });

    if ("error" in result) return result;
    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/" + orderId);
    if (parsed.data === "CANCELLED") { revalidatePath("/admin/products"); revalidatePath("/"); }
    return result;
  } catch {
    return { error: "Could not update this order. Please try again." };
  }
}


const manualPaymentSchema = z.object({
  amountReceivedGhs: z.coerce.number().finite().positive().max(1000000),
  deliveryFeeGhs: z.coerce.number().finite().min(0).max(1000000),
  method: z.enum(["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]),
  paymentReference: z.string().trim().max(180).optional(),
});

export async function recordWhatsAppPayment(orderId: string, _previous: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const admin = await requireAdmin();
  const parsed = manualPaymentSchema.safeParse({
    amountReceivedGhs: formData.get("amountReceivedGhs"),
    deliveryFeeGhs: formData.get("deliveryFeeGhs") || "0",
    method: formData.get("method"),
    paymentReference: formData.get("paymentReference") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the payment details." };

  const amountReceivedMinor = cedisToPesewas(parsed.data.amountReceivedGhs);
  const deliveryFeeMinor = cedisToPesewas(parsed.data.deliveryFeeGhs);

  try {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update").limit(1);
      if (!current) return { error: "This order could not be found." } as const;
      if (current.channel !== "WHATSAPP") return { error: "Manual payment recording is only available for WhatsApp-assisted orders." } as const;
      if (current.paymentStatus === "PAID") return { error: "This order is already marked as paid." } as const;
      if (current.status === "CANCELLED") return { error: "A cancelled order cannot receive a payment." } as const;

      const totalMinor = current.subtotalMinor + deliveryFeeMinor;
      if (amountReceivedMinor !== totalMinor) {
        return { error: "The amount received must match the items subtotal plus the delivery fee." } as const;
      }

      const purchasedItems = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.productId));
      const productIds = [...new Set(purchasedItems.map((item) => item.productId).filter((id): id is string => Boolean(id)))];
      const productRows = productIds.length ? await tx.select().from(products)
        .where(inArray(products.id, productIds)).orderBy(asc(products.id)).for("update") : [];
      if (productRows.length !== productIds.length) {
        return { error: "A product in this order is no longer available in the catalogue." } as const;
      }
      const reservationCutoff = new Date(Date.now() - 30 * 60 * 1000);
      const reservationRows = productIds.length ? await tx.select({
        productId: orderItems.productId,
        reservedQuantity: sum(orderItems.quantity),
      }).from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          inArray(orderItems.productId, productIds),
          eq(orders.channel, "PAYSTACK"),
          inArray(orders.status, ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING"]),
          eq(orders.paymentStatus, "PENDING"),
          gt(orders.createdAt, reservationCutoff),
        ))
        .groupBy(orderItems.productId) : [];
      const reservedByProduct = new Map(reservationRows.map((row) => [row.productId, Number(row.reservedQuantity ?? 0)]));
      const productById = new Map(productRows.map((product) => [product.id, product]));
      for (const item of purchasedItems) {
        if (!item.productId) continue;
        const product = productById.get(item.productId);
        if (!product) return { error: "A product in this order is no longer available." } as const;
        const reserved = reservedByProduct.get(item.productId) ?? 0;
        if (product.stockQuantity !== null && product.stockQuantity - reserved < item.quantity) {
          return { error: "This quantity is currently reserved for an online checkout or is no longer available. Resolve availability before confirming this payment." } as const;
        }
      }

      const [updated] = await tx.update(orders).set({
        deliveryFeeMinor,
        totalMinor,
        paymentStatus: "PAID",
        status: current.status === "PENDING_PAYMENT" ? "CONFIRMED" : current.status,
        updatedAt: new Date(),
      }).where(and(eq(orders.id, orderId), eq(orders.paymentStatus, current.paymentStatus), eq(orders.status, current.status))).returning({ id: orders.id });

      if (!updated) return { error: "This order changed while you were recording payment. Refresh and try again." } as const;

      for (const item of purchasedItems) {
        if (!item.productId) continue;
        const [stock] = await tx.update(products).set({
          stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
          updatedAt: new Date(),
        }).where(eq(products.id, item.productId)).returning({ stockQuantity: products.stockQuantity });
        if (stock && stock.stockQuantity !== null) {
          await tx.insert(auditLogs).values({
            adminId: admin.adminId,
            action: "PRODUCT_STOCK_DECREMENTED",
            entityType: "product",
            entityId: item.productId,
            metadata: { orderReference: current.reference, quantity: item.quantity, remainingQuantity: stock.stockQuantity },
          });
        }
      }

      await tx.insert(auditLogs).values({
        adminId: admin.adminId,
        action: "MANUAL_WHATSAPP_PAYMENT_RECORDED",
        entityType: "order",
        entityId: orderId,
        metadata: {
          amountReceivedMinor,
          deliveryFeeMinor,
          method: parsed.data.method,
          paymentReference: parsed.data.paymentReference || null,
          orderReference: current.reference,
        },
      });
      return { success: "Payment recorded. The order is now marked as paid." } as const;
    });

    if ("error" in result) return result;
    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/" + orderId);
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return result;
  } catch {
    return { error: "Could not record payment. Please try again." };
  }
}


const refundSchema = z.object({
  refundReference: z.string().trim().max(120).optional().default(""),
  reason: z.string().trim().min(4, "Add a short reason for the refund.").max(500),
  confirmRefund: z.literal("on"),
});

export async function recordOrderRefund(orderId: string, _previous: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const admin = await requireAdmin();
  const parsed = refundSchema.safeParse({
    refundReference: formData.get("refundReference") ?? "",
    reason: formData.get("reason"),
    confirmRefund: formData.get("confirmRefund"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the refund details." };

  try {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update").limit(1);
      if (!current) return { error: "This order could not be found." } as const;
      if (current.paymentStatus !== "PAID") return { error: "Only a paid order can be marked as refunded." } as const;

      if (current.channel === "PAYSTACK") {
        const [payment] = await tx.select().from(payments)
          .where(and(eq(payments.orderId, orderId), eq(payments.status, "PAID"))).for("update").limit(1);
        if (!payment) return { error: "The verified Paystack payment record could not be found." } as const;
        const originalPayload = payment.providerPayload && typeof payment.providerPayload === "object" && !Array.isArray(payment.providerPayload)
          ? payment.providerPayload as Record<string, unknown>
          : {};
        const [refundedPayment] = await tx.update(payments).set({
          status: "REFUNDED",
          providerPayload: {
            ...originalPayload,
            refund: {
              method: "PAYSTACK_DASHBOARD",
              reference: parsed.data.refundReference || null,
              reason: parsed.data.reason,
              amountMinor: current.totalMinor,
              recordedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date(),
        }).where(and(eq(payments.id, payment.id), eq(payments.status, "PAID"))).returning({ id: payments.id });
        if (!refundedPayment) return { error: "The payment record changed while you were recording the refund." } as const;
      }

      const [updated] = await tx.update(orders).set({
        paymentStatus: "REFUNDED",
        updatedAt: new Date(),
      }).where(and(eq(orders.id, orderId), eq(orders.paymentStatus, "PAID"))).returning({ id: orders.id });
      if (!updated) throw new Error("The order payment status changed while recording the refund.");

      await tx.insert(auditLogs).values({
        adminId: admin.adminId,
        action: "ORDER_REFUND_RECORDED",
        entityType: "order",
        entityId: orderId,
        metadata: {
          orderReference: current.reference,
          amountMinor: current.totalMinor,
          method: current.channel === "PAYSTACK" ? "PAYSTACK_DASHBOARD" : "MANUAL",
          refundReference: parsed.data.refundReference || null,
          reason: parsed.data.reason,
        },
      });
      return { success: "Refund recorded against this order." } as const;
    });

    if ("error" in result) return result;
    revalidatePath("/admin/orders");
    revalidatePath("/admin/orders/" + orderId);
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    return result;
  } catch {
    return { error: "Could not record the refund. Please try again." };
  }
}
