"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { auditLogs, products, productImages } from "@/db/schema";
import { db } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { productInputSchema, productImageDataSchema } from "./validation";
import { cedisToPesewas } from "@/lib/money";
import { z } from "zod";

export type ProductActionState = { error?: string; success?: string };

function readProductForm(formData: FormData) {
  return productInputSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    priceGhs: formData.get("priceGhs"),
    stockQuantity: formData.get("stockQuantity") || undefined,
    isActive: formData.get("isActive") === "on",
  });
}

function slugifyProductName(name: string) {
  const slug = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
  return slug || "product";
}

async function createUniqueSlug(name: string, excludeProductId?: string) {
  const base = slugifyProductName(name);
  let candidate = base;
  let suffix = 2;
  while (true) {
    const [existing] = await db.select({ id: products.id }).from(products)
      .where(excludeProductId
        ? and(eq(products.slug, candidate), ne(products.id, excludeProductId))
        : eq(products.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = base.slice(0, 150) + "-" + suffix++;
  }
}

const optionalImageSchema = z.object({
  imageData: productImageDataSchema.optional().or(z.literal("")),
  imageAltText: z.string().trim().max(240).optional().or(z.literal("")),
});

export async function createProduct(_previous: ProductActionState, formData: FormData): Promise<ProductActionState> {
  const admin = await requireAdmin();
  const parsed = readProductForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the product details." };
  const image = optionalImageSchema.safeParse({
    imageData: formData.get("imageData") ?? "",
    imageAltText: formData.get("imageAltText") ?? "",
  });
  if (!image.success) return { error: image.error.issues[0]?.message ?? "Check the product image." };
  if (image.data.imageData && image.data.imageAltText && image.data.imageAltText.length < 4) return { error: "Add a short description for the product image." };

  const data = parsed.data;
  try {
    const slug = await createUniqueSlug(data.name);
    await db.transaction(async (tx) => {
      const [created] = await tx.insert(products).values({
        name: data.name, slug, shortDescription: data.shortDescription || null,
        description: data.description || null, priceMinor: cedisToPesewas(data.priceGhs),
        stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null, isActive: data.isActive,
      }).returning({ id: products.id });
      if (image.data.imageData) {
        await tx.insert(productImages).values({
          productId: created.id, 
          imageUrl: image.data.imageData, 
          altText: image.data.imageAltText|| "", 
          sortOrder: 0,
          createdAt:  new Date()
        });
      }
      await tx.insert(auditLogs).values({
        adminId: admin.adminId, action: "PRODUCT_CREATED", entityType: "product", entityId: created.id,
        metadata: { name: data.name, slug, priceMinor: cedisToPesewas(data.priceGhs), isActive: data.isActive, hasImage: Boolean(image.data.imageData) },
      });
    });
  } catch {
    return { error: "Could not save this product. Please check the details and try again." };
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
    const [current] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
    if (!current) return { error: "This product could not be found." };
    const slug = await createUniqueSlug(data.name, productId);
    await db.transaction(async (tx) => {
      await tx.update(products).set({
        name: data.name, slug, shortDescription: data.shortDescription || null,
        description: data.description || null, priceMinor: cedisToPesewas(data.priceGhs),
        stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null,
        isActive: data.isActive, updatedAt: new Date(),
      }).where(eq(products.id, productId));
      await tx.insert(auditLogs).values({
        adminId: admin.adminId, action: "PRODUCT_UPDATED", entityType: "product", entityId: productId,
        metadata: { name: data.name, slug, priceMinor: cedisToPesewas(data.priceGhs), stockQuantity: data.stockQuantity || null, isActive: data.isActive },
      });
    });
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/products/" + current.slug);
    revalidatePath("/products/" + slug);
    return { success: "Product changes saved." };
  } catch {
    return { error: "Could not update this product. Please try again." };
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

export async function removeProductImage(imageId: string, productId: string) {
  const admin = await requireAdmin();
  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return;
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
