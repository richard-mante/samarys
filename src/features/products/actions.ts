"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { products, productImages } from "@/db/schema";
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
  await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details." };
  const data = parsed.data;
  try {
    await db.insert(products).values({
      name: data.name, slug: data.slug, shortDescription: data.shortDescription || null,
      description: data.description || null, priceMinor: cedisToPesewas(data.priceGhs),
      stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null, isActive: data.isActive,
    });
  } catch {
    return { error: "Could not save product. Check that its URL slug is unique and try again." };
  }
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: "Product created." };
}

export async function updateProduct(productId: string, _previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details." };
  const data = parsed.data;
  try {
    const updated = await db.update(products).set({
      name: data.name, slug: data.slug, shortDescription: data.shortDescription || null,
      description: data.description || null, priceMinor: cedisToPesewas(data.priceGhs),
      stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null,
      isActive: data.isActive, updatedAt: new Date(),
    }).where(eq(products.id, productId)).returning({ slug: products.slug });
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
  await requireAdmin();
  await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, productId));
  revalidatePath("/");
  revalidatePath("/admin/products");
}

const imageInputSchema = z.object({
  imageUrl: z.string().trim().url().max(2000).refine((value) => value.startsWith("https://") || value.startsWith("http://"), "Use a public HTTPS or HTTP image URL."),
  altText: z.string().trim().min(4, "Add a short description for accessibility.").max(240),
});

export async function addProductImage(productId: string, _previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = imageInputSchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    altText: formData.get("altText"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the image details." };

  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return { error: "This product could not be found." };

  const existing = await db.select({ sortOrder: productImages.sortOrder }).from(productImages)
    .where(eq(productImages.productId, productId));
  await db.insert(productImages).values({
    productId,
    imageUrl: parsed.data.imageUrl,
    altText: parsed.data.altText,
    sortOrder: existing.length ? Math.max(...existing.map((image) => image.sortOrder)) + 1 : 0,
  });

  revalidatePath("/admin/products/" + productId);
  revalidatePath("/products/" + product.slug);
  revalidatePath("/");
  return { success: "Image added to the product gallery." };
}

export async function removeProductImage(imageId: string, productId: string) {
  await requireAdmin();
  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return;
  await db.delete(productImages).where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
  revalidatePath("/admin/products/" + productId);
  revalidatePath("/products/" + product.slug);
  revalidatePath("/");
}
