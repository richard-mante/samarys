"use server";

import { createHmac } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auditLogs, products, productImages } from "@/db/schema";
import { db } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { productInputSchema } from "./validation";
import { cedisToPesewas } from "@/lib/money";
import { z } from "zod";

export type ProductActionState = { error?: string; success?: string };

function readProductForm(formData: FormData) {
  return productInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    priceGhs: formData.get("priceGhs"),
    stockQuantity: formData.get("stockQuantity") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

export async function createProduct(_previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const admin = await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details." };
  const data = parsed.data;
  try {
    await db.transaction(async (tx) => {
      const [created] = await tx.insert(products).values({
        name: data.name, slug: data.slug, shortDescription: data.shortDescription || null,
        description: data.description || null, priceMinor: cedisToPesewas(data.priceGhs),
        stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null, isActive: data.isActive,
      }).returning({ id: products.id });
      await tx.insert(auditLogs).values({
        adminId: admin.adminId, action: "PRODUCT_CREATED", entityType: "product", entityId: created.id,
        metadata: { name: data.name, slug: data.slug, priceMinor: cedisToPesewas(data.priceGhs), isActive: data.isActive },
      });
    });
  } catch {
    return { error: "Could not save product. Check that its URL slug is unique and try again." };
  }
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: "Product created." };
}

export async function updateProduct(productId: string, _previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const admin = await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details." };
  const data = parsed.data;
  try {
    const updated = await db.transaction(async (tx) => {
      const [product] = await tx.update(products).set({
        name: data.name, slug: data.slug, shortDescription: data.shortDescription || null,
        description: data.description || null, priceMinor: cedisToPesewas(data.priceGhs),
        stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null,
        isActive: data.isActive, updatedAt: new Date(),
      }).where(eq(products.id, productId)).returning({ slug: products.slug });
      if (product) await tx.insert(auditLogs).values({
        adminId: admin.adminId, action: "PRODUCT_UPDATED", entityType: "product", entityId: productId,
        metadata: { name: data.name, slug: data.slug, priceMinor: cedisToPesewas(data.priceGhs), stockQuantity: data.stockQuantity || null, isActive: data.isActive },
      });
      return product ? [product] : [];
    });
    if (!updated.length) return { error: "This product could not be found." };
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/products/" + updated[0].slug);
    return { success: "Product changes saved." };
  } catch {
    return { error: "Could not update product. Check that its URL slug is unique and try again." };
  }
}

export async function toggleProductVisibility(productId: string, isActive: boolean) {
  const admin = await requireAdmin();
  await db.transaction(async (tx) => {
    const [updated] = await tx.update(products).set({ isActive, updatedAt: new Date() })
      .where(eq(products.id, productId)).returning({ id: products.id });
    if (updated) await tx.insert(auditLogs).values({
      adminId: admin.adminId, action: "PRODUCT_VISIBILITY_UPDATED", entityType: "product", entityId: productId,
      metadata: { isActive },
    });
  });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

const imageInputSchema = z.object({
  imageUrl: z.string().trim().url().max(2000).refine((value) => value.startsWith("https://") || value.startsWith("http://"), "Use a public HTTPS or HTTP image URL."),
  altText: z.string().trim().min(4, "Add a short description for accessibility.").max(240),
});

export async function addProductImage(productId: string, _previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const admin = await requireAdmin();
  const parsed = imageInputSchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    altText: formData.get("altText"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the image details." };

  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "This product could not be found." };

  const existing = await db.select({ sortOrder: productImages.sortOrder }).from(productImages)
    .where(eq(productImages.productId, productId));
  await db.transaction(async (tx) => {
    const [created] = await tx.insert(productImages).values({
      productId,
      imageUrl: parsed.data.imageUrl,
      altText: parsed.data.altText,
      sortOrder: existing.length ? Math.max(...existing.map((image) => image.sortOrder)) + 1 : 0,
    }).returning({ id: productImages.id });
    await tx.insert(auditLogs).values({
      adminId: admin.adminId, action: "PRODUCT_IMAGE_ADDED", entityType: "product", entityId: productId,
      metadata: { imageId: created.id, imageUrl: parsed.data.imageUrl, altText: parsed.data.altText },
    });
  });

  revalidatePath("/admin/products/" + productId);
  revalidatePath("/products/" + product.slug);
  revalidatePath("/");
  return { success: "Image added to the product gallery." };
}

export async function removeProductImage(imageId: string, productId: string) {
  const admin = await requireAdmin();
  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return;

  const [image] = await db.select({ imageUrl: productImages.imageUrl }).from(productImages)
    .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId))).limit(1);
  if (!image) return;

  // Remove managed Cloudinary assets as well as their gallery records.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) {
    try {
      const url = new URL(image.imageUrl);
      const prefix = "/" + cloudName + "/image/upload/";
      if (url.hostname === "res.cloudinary.com" && url.pathname.startsWith(prefix)) {
        const parts = url.pathname.slice(prefix.length).split("/");
        if (parts[0]?.match(/^v\d+$/)) parts.shift();
        const filename = parts.pop() ?? "";
        const publicId = [...parts, filename.replace(/\.[^.]+$/, "")].filter(Boolean).join("/");
        if (publicId.startsWith("samarys/products/" + productId + "/")) {
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = createHmac("sha1", apiSecret)
            .update("public_id=" + publicId + "&timestamp=" + timestamp)
            .digest("hex");
          const payload = new FormData();
          payload.set("public_id", publicId);
          payload.set("timestamp", String(timestamp));
          payload.set("api_key", apiKey);
          payload.set("signature", signature);
          const response = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/image/destroy", {
            method: "POST",
            body: payload,
            cache: "no-store",
          });
          const result = await response.json() as { result?: string };
          if (!response.ok || (result.result !== "ok" && result.result !== "not found")) {
            throw new Error("Cloudinary could not remove the image.");
          }
        }
      }
    } catch {
      // Keep the gallery entry if a managed asset could not be deleted, so the seller can retry.
      return;
    }
  }

  await db.transaction(async (tx) => {
    const [removed] = await tx.delete(productImages)
      .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
      .returning({ id: productImages.id });
    if (removed) await tx.insert(auditLogs).values({
      adminId: admin.adminId, action: "PRODUCT_IMAGE_REMOVED", entityType: "product", entityId: productId,
      metadata: { imageId },
    });
  });
  revalidatePath("/admin/products/" + productId);
  revalidatePath("/products/" + product.slug);
  revalidatePath("/");
}
