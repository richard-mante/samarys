"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

const uploadedImageSchema = z.object({
  imageUrl: z.string().url().max(2000),
  altText: z.string().trim().min(4, "Add a short description for accessibility.").max(240),
});

export async function saveUploadedProductImage(productId: string, imageUrl: string, altText: string) {
  await requireAdmin();
  const parsed = uploadedImageSchema.safeParse({ imageUrl, altText });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the image details." };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let url: URL;
  try {
    url = new URL(parsed.data.imageUrl);
  } catch {
    return { error: "The uploaded image URL is invalid." };
  }
  if (!cloudName || url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith("/" + cloudName + "/image/upload/")) {
    return { error: "Only images uploaded to the configured Samary's Cloudinary account can be saved here." };
  }

  const [product] = await db.select({ slug: products.slug }).from(products)
    .where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "This product could not be found." };

  try {
    const existing = await db.select({ sortOrder: productImages.sortOrder }).from(productImages)
      .where(eq(productImages.productId, productId));
    await db.insert(productImages).values({
      productId,
      imageUrl: parsed.data.imageUrl,
      altText: parsed.data.altText,
      sortOrder: existing.length ? Math.max(...existing.map((image) => image.sortOrder)) + 1 : 0,
    });
  } catch {
    return { error: "The image uploaded, but could not be added to this product. Please try again." };
  }

  revalidatePath("/admin/products/" + productId);
  revalidatePath("/products/" + product.slug);
  revalidatePath("/");
  return { success: "Product image uploaded and added to the gallery." };
}
