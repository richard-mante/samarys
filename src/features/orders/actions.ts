"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, orderItems, orders, products } from "@/db/schema";
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
      const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
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
      const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!current) return { error: "This order could not be found." } as const;
      if (current.channel !== "WHATSAPP") return { error: "Manual payment recording is only available for WhatsApp-assisted orders." } as const;
      if (current.paymentStatus === "PAID") return { error: "This order is already marked as paid." } as const;
      if (current.status === "CANCELLED") return { error: "A cancelled order cannot receive a payment." } as const;

      const totalMinor = current.subtotalMinor + deliveryFeeMinor;
      if (amountReceivedMinor !== totalMinor) {
        return { error: "The amount received must match the items subtotal plus the delivery fee." } as const;
      }

      const [updated] = await tx.update(orders).set({
        deliveryFeeMinor,
        totalMinor,
        paymentStatus: "PAID",
        status: current.status === "PENDING_PAYMENT" ? "CONFIRMED" : current.status,
        updatedAt: new Date(),
      }).where(and(eq(orders.id, orderId), eq(orders.paymentStatus, current.paymentStatus), eq(orders.status, current.status))).returning({ id: orders.id });

      if (!updated) return { error: "This order changed while you were recording payment. Refresh and try again." } as const;

      const purchasedItems = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems).where(eq(orderItems.orderId, orderId));
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
    return result;
  } catch {
    return { error: "Could not record payment. Please try again." };
  }
}
