import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { normalizePhoneNumber } from "@/lib/phone";

export const runtime = "nodejs";

const lookupSchema = z.object({
  reference: z.string().trim().toUpperCase().regex(/^SAM-[A-F0-9]{12,16}$/, "Enter the order reference shown after checkout."),
  phone: z.string().trim().min(7).max(32).regex(/^\+?[0-9\s()-]+$/, "Enter the phone number used at checkout."),
});

export async function POST(request: Request) {
  const parsed = lookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details and try again." }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const reference = parsed.data.reference;
  const phone = normalizePhoneNumber(parsed.data.phone);
  const order = await db.query.orders.findFirst({
    where: eq(orders.reference, reference),
    with: {
      customer: { columns: { phone: true } },
      items: { columns: { id: true, productNameSnapshot: true, quantity: true, unitPriceMinor: true, lineTotalMinor: true } },
    },
  });

  // A reference alone is never sufficient to reveal order information.
  if (!order || order.customer.phone !== phone) {
    return NextResponse.json({ error: "We couldn't find an order matching those details. Check the reference and phone number and try again." }, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json({
    order: {
      reference: order.reference,
      status: order.status,
      paymentStatus: order.paymentStatus,
      channel: order.channel,
      currency: order.currency,
      subtotalMinor: order.subtotalMinor,
      deliveryFeeMinor: order.deliveryFeeMinor,
      totalMinor: order.totalMinor,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.productNameSnapshot,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        lineTotalMinor: item.lineTotalMinor,
      })),
    },
  }, { headers: { "Cache-Control": "no-store, private" } });
}
