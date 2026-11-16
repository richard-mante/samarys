"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { productImageDataSchema } from "./validation";

const uploadedImageSchema = z.object({
  imageData: productImageDataSchema,
  altText: z.string().trim().min(4, "Add a short description for accessibility.").max(240),
});

export async function saveUploadedProductImage(productId: string, imageData: string, altText: string) {
  const admin = await requireAdmin();
  const parsed = uploadedImageSchema.safeParse({ imageData, altText });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the image details." };

  const [product] = await db.select({ slug: products.slug }).from(products)
    .where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "This product could not be found." };

  try {
    const existing = await db.select({ sortOrder: productImages.sortOrder }).from(productImages)
      .where(eq(productImages.productId, productId));
    await db.transaction(async (tx) => {
      const [created] = await tx.insert(productImages).values({
        productId,
        imageUrl: parsed.data.imageData,
        altText: parsed.data.altText,
        sortOrder: existing.length ? Math.max(...existing.map((image) => image.sortOrder)) + 1 : 0,
      }).returning({ id: productImages.id });
      await tx.insert(auditLogs).values({
        adminId: admin.adminId, action: "PRODUCT_IMAGE_UPLOADED", entityType: "product", entityId: productId,
        metadata: { imageId: created.id, altText: parsed.data.altText, storage: "database_base64" },
      });
    });
  } catch {
    return { error: "The image could not be saved. Choose a smaller image and try again." };
  }

  revalidatePath("/admin/products/" + productId);
  revalidatePath("/products/" + product.slug);
  revalidatePath("/");
  return { success: "Product image added." };
}
