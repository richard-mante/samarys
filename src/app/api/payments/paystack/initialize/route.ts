import { randomUUID } from "node:crypto";
import { and, asc, eq, gt, inArray, sum } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { customers, orderItems, orders, payments, products } from "@/db/schema";
import { normalizePhoneNumber } from "@/lib/phone";
import { getStoreSettings } from "@/lib/settings";

export const runtime = "nodejs";

const RESERVATION_MINUTES = 30;

const requestSchema = z.object({
  fullName: z.string().trim().min(2).max(180),
  phone: z.string().trim().min(7).max(32).regex(/^\+?[0-9\s()-]+$/),
  email: z.string().trim().email().max(320),
  deliveryAddress: z.string().trim().min(5).max(2000),
  deliveryCity: z.string().trim().min(2).max(120),
  deliveryRegion: z.string().trim().max(120).optional().default(""),
  deliveryNotes: z.string().trim().max(2000).optional().default(""),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1).max(30),
});

export async function POST(request: Request) {
  const settings = await getStoreSettings();
  if (!settings.orderingEnabled) {
    return NextResponse.json({ error: "Online ordering is not open yet." }, { status: 403 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Online payment is temporarily unavailable. Please use WhatsApp." }, { status: 503 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your order details." }, { status: 400 });

  try {
    const input = parsed.data;
    const quantities = new Map<string, number>();
    for (const item of input.items) quantities.set(item.productId, Math.min(99, (quantities.get(item.productId) ?? 0) + item.quantity));
    const productIds = [...quantities.keys()];
    const reference = "SAM-" + randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
    const phone = normalizePhoneNumber(input.phone);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");

    // Product row locks serialize concurrent online checkouts. Pending Paystack
    // orders reserve finite stock for 30 minutes; unpaid WhatsApp requests do not.
    const created = await db.transaction(async (tx) => {
      const productRows = await tx.select().from(products)
        .where(and(inArray(products.id, productIds), eq(products.isActive, true)))
        .orderBy(asc(products.id))
        .for("update");
      if (productRows.length !== productIds.length) {
        throw new Error("One or more products are no longer available. Refresh your basket.");
      }

      const reservationCutoff = new Date(Date.now() - RESERVATION_MINUTES * 60 * 1000);
      const reservationRows = await tx.select({
        productId: orderItems.productId,
        reservedQuantity: sum(orderItems.quantity),
      }).from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(
          inArray(orderItems.productId, productIds),
          eq(orders.channel, "PAYSTACK"),
          eq(orders.status, "PENDING_PAYMENT"),
          eq(orders.paymentStatus, "PENDING"),
          gt(orders.createdAt, reservationCutoff),
        ))
        .groupBy(orderItems.productId);
      const reservedByProduct = new Map(reservationRows.map((row) => [row.productId, Number(row.reservedQuantity ?? 0)]));

      const lines = productRows.map((product) => {
        const quantity = quantities.get(product.id) ?? 0;
        const reserved = reservedByProduct.get(product.id) ?? 0;
        if (product.stockQuantity !== null && quantity + reserved > product.stockQuantity) {
          const available = Math.max(0, product.stockQuantity - reserved);
          throw new Error("Only " + available + " unit(s) of " + product.name + " are currently available. Some stock may be held in another online checkout.");
        }
        return { product, quantity, lineTotalMinor: product.priceMinor * quantity };
      });
      const totalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
      if (!Number.isSafeInteger(totalMinor) || totalMinor <= 0) throw new Error("The order total could not be calculated.");

      const [existing] = await tx.select().from(customers).where(eq(customers.phone, phone)).limit(1);
      let customerId: string;
      if (existing) {
        const [updated] = await tx.update(customers).set({
          fullName: input.fullName,
          email: input.email,
          updatedAt: new Date(),
        }).where(eq(customers.id, existing.id)).returning({ id: customers.id });
        customerId = updated.id;
      } else {
        const [customer] = await tx.insert(customers).values({
          fullName: input.fullName,
          phone,
          email: input.email,
        }).returning({ id: customers.id });
        customerId = customer.id;
      }

      const [order] = await tx.insert(orders).values({
        reference,
        customerId,
        channel: "PAYSTACK",
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        currency: "GHS",
        subtotalMinor: totalMinor,
        deliveryFeeMinor: 0,
        totalMinor,
        deliveryAddress: input.deliveryAddress,
        deliveryCity: input.deliveryCity,
        deliveryRegion: input.deliveryRegion || null,
        deliveryNotes: input.deliveryNotes || null,
      }).returning({ id: orders.id });

      await tx.insert(orderItems).values(lines.map((line) => ({
        orderId: order.id,
        productId: line.product.id,
        productNameSnapshot: line.product.name,
        unitPriceMinor: line.product.priceMinor,
        quantity: line.quantity,
        lineTotalMinor: line.lineTotalMinor,
      })));
      await tx.insert(payments).values({
        orderId: order.id,
        provider: "PAYSTACK",
        providerReference: reference,
        amountMinor: totalMinor,
        currency: "GHS",
        status: "PENDING",
      });
      return { orderId: order.id, totalMinor };
    });

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: "Bearer " + secret, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        amount: created.totalMinor,
        currency: "GHS",
        reference,
        callback_url: appUrl + "/api/payments/paystack/callback",
        metadata: { order_id: created.orderId, order_reference: reference },
      }),
      cache: "no-store",
    });
    const result = await response.json() as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
    if (!response.ok || !result.status || !result.data?.authorization_url || result.data.reference !== reference) {
      await db.update(payments).set({ status: "FAILED", updatedAt: new Date() }).where(eq(payments.providerReference, reference));
      await db.update(orders).set({ paymentStatus: "FAILED", updatedAt: new Date() }).where(eq(orders.id, created.orderId));
      return NextResponse.json({ error: result.message || "Could not start the Paystack payment. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ authorizationUrl: result.data.authorization_url, reference });
  } catch (error) {
    const message = error instanceof Error && (error.message.startsWith("Only ") || error.message.startsWith("One or more") || error.message.startsWith("The order total")) ? error.message : "We could not start checkout. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
