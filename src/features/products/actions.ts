"use server";

import { revalidatePath } from "next/cache";
import { products } from "@/db/schema";
import { db } from "@/db";
import { requireAdmin } from "@/lib/admin";
import { productInputSchema } from "./validation";
import { cedisToPesewas } from "@/lib/money";

export type ProductActionState = { error?: string; success?: string };

export async function createProduct(
  _previous: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsed = productInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    priceGhs: formData.get("priceGhs"),
    stockQuantity: formData.get("stockQuantity") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the product details." };
  }

  const data = parsed.data;
  try {
    await db.insert(products).values({
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      priceMinor: cedisToPesewas(data.priceGhs),
      stockQuantity: data.stockQuantity === "" ? null : data.stockQuantity ?? null,
      isActive: data.isActive,
    });
  } catch {
    return { error: "Could not save product. Check that its URL slug is unique and try again." };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: "Product created." };
}
