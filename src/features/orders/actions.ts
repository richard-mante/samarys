"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

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
