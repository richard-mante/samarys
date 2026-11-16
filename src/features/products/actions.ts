"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema";
import { db } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { productInputSchema } from "./validation";
import { cedisToPesewas } from "@/lib/money";

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
