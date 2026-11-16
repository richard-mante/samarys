import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const requestSchema = z.object({ productId: z.string().uuid() });

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product." }, { status: 400 });

  const [product] = await db.select({ id: products.id }).from(products)
    .where(eq(products.id, parsed.data.productId)).limit(1);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Product image uploads are not configured yet. Add the Cloudinary environment variables first." }, { status: 503 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "samarys/products/" + product.id;
  const signature = createHmac("sha1", apiSecret)
    .update("folder=" + folder + "&timestamp=" + timestamp)
    .digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature }, {
    headers: { "Cache-Control": "no-store" },
  });
}
