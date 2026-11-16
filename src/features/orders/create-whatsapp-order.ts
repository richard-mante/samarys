"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { customers, orderItems, orders, products } from "@/db/schema";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";
import { formatGhsFromPesewas } from "@/lib/money";
import { normalizePhoneNumber } from "@/lib/phone";
import { getStoreSettings } from "@/lib/settings";

export type CreateOrderState = {
  error?: string;
  success?: string;
  reference?: string;
  whatsappUrl?: string;
};

const customerSchema = z.object({
  fullName: z.string().trim().min(2).max(180),
  phone: z.string().trim().min(7).max(32).regex(/^\+?[0-9\s()-]+$/, "Enter a valid phone number.").refine((value) => { const digits = value.replace(/\D/g, ""); return digits.length >= 10 && digits.length <= 15; }, "Enter a complete phone number with country code if needed."),
  email: z.union([z.string().trim().email().max(320), z.literal("")]).optional(),
  deliveryAddress: z.string().trim().min(5).max(2000),
  deliveryCity: z.string().trim().min(2).max(120),
  deliveryRegion: z.string().trim().max(120).optional(),
  deliveryNotes: z.string().trim().max(2000).optional(),
});

const cartSchema = z.array(z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
})).min(1).max(30);

export async function createWhatsAppOrder(_previous: CreateOrderState, formData: FormData): Promise<CreateOrderState> {
  const storeSettings = await getStoreSettings();
  if (!storeSettings.orderingEnabled) return { error: "Order requests are not open yet. Please contact the seller for product enquiries." };

  const customerInput = customerSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    deliveryAddress: formData.get("deliveryAddress"),
    deliveryCity: formData.get("deliveryCity"),
    deliveryRegion: formData.get("deliveryRegion") ?? "",
    deliveryNotes: formData.get("deliveryNotes") ?? "",
  });
  if (!customerInput.success) return { error: customerInput.error.issues[0]?.message ?? "Please check your contact and delivery details." };

  let rawCart: unknown;
  try {
    rawCart = JSON.parse(String(formData.get("items") ?? ""));
  } catch {
    return { error: "Your order basket could not be read. Please refresh and try again." };
  }
  const cartInput = cartSchema.safeParse(rawCart);
  if (!cartInput.success) return { error: "Your order basket is empty or contains invalid items." };

  const quantities = new Map<string, number>();
  for (const item of cartInput.data) quantities.set(item.productId, Math.min(99, (quantities.get(item.productId) ?? 0) + item.quantity));
  const productIds = [...quantities.keys()];

  try {
    const productRows = await db.select().from(products)
      .where(and(inArray(products.id, productIds), eq(products.isActive, true)));
    if (productRows.length !== productIds.length) {
      return { error: "One or more products are no longer available. Please refresh your basket." };
    }

    const lines = productRows.map((product) => {
      const quantity = quantities.get(product.id) ?? 0;
      if (product.stockQuantity !== null && quantity > product.stockQuantity) {
        throw new Error("Only " + product.stockQuantity + " unit(s) of " + product.name + " are currently available.");
      }
      return {
        product,
        quantity,
        lineTotalMinor: product.priceMinor * quantity,
      };
    });
    const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
    if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor <= 0) return { error: "The order total could not be calculated." };

    const reference = "SAM-" + randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
    const details = customerInput.data;
    const customerPhone = normalizePhoneNumber(details.phone);

    await db.transaction(async (tx) => {
      const [existingCustomer] = await tx.select().from(customers).where(eq(customers.phone, customerPhone)).limit(1);
      let customerId: string;
      if (existingCustomer) {
        const [updatedCustomer] = await tx.update(customers).set({
          fullName: details.fullName,
          email: details.email || null,
          updatedAt: new Date(),
        }).where(eq(customers.id, existingCustomer.id)).returning({ id: customers.id });
        customerId = updatedCustomer.id;
      } else {
        const [createdCustomer] = await tx.insert(customers).values({
          fullName: details.fullName,
          phone: customerPhone,
          email: details.email || null,
        }).returning({ id: customers.id });
        customerId = createdCustomer.id;
      }

      const [createdOrder] = await tx.insert(orders).values({
        reference,
        customerId,
        channel: "WHATSAPP",
        status: "PENDING_PAYMENT",
        paymentStatus: "UNPAID",
        currency: "GHS",
        subtotalMinor,
        deliveryFeeMinor: 0,
        totalMinor: subtotalMinor,
        deliveryAddress: details.deliveryAddress,
        deliveryCity: details.deliveryCity,
        deliveryRegion: details.deliveryRegion || null,
        deliveryNotes: details.deliveryNotes || null,
      }).returning({ id: orders.id });

      await tx.insert(orderItems).values(lines.map((line) => ({
        orderId: createdOrder.id,
        productId: line.product.id,
        productNameSnapshot: line.product.name,
        unitPriceMinor: line.product.priceMinor,
        quantity: line.quantity,
        lineTotalMinor: line.lineTotalMinor,
      })));
    });

    const itemSummary = lines.map((line) =>
      "- " + line.product.name + " × " + line.quantity + " — " + formatGhsFromPesewas(line.lineTotalMinor)
    ).join("\n");
    const message = [
      "Hello Samary's, I would like to place this order request.",
      "Order reference: " + reference,
      "",
      "Items:",
      itemSummary,
      "",
      "Subtotal (delivery not included): " + formatGhsFromPesewas(subtotalMinor),
      "Customer: " + details.fullName,
      "Phone: " + customerPhone,
      "Delivery address: " + details.deliveryAddress + ", " + details.deliveryCity + (details.deliveryRegion ? ", " + details.deliveryRegion : ""),
      details.deliveryNotes ? "Delivery note: " + details.deliveryNotes : "",
      "",
      "Please confirm availability and delivery cost.",
    ].filter(Boolean).join("\n");

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return {
      success: "Your order request has been saved. Send the prepared message to the seller to confirm the details.",
      reference,
      whatsappUrl: createSellerWhatsAppUrl(message, storeSettings.sellerWhatsAppNumber),
    };
  } catch (error) {
    return { error: error instanceof Error && error.message.startsWith("Only ") ? error.message : "We could not create your order request. Please try again or contact the seller." };
  }
}
