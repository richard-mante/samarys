import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { EditProductForm } from "@/features/products/edit-product-form";
import { ProductGalleryManager } from "@/features/products/product-gallery-manager";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();
  const images = await db.select().from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));

  return <div className="mx-auto max-w-3xl">
    <Link href="/admin/products" className="text-sm text-[#66836c] transition hover:text-[#244b36]">← Back to products</Link>
    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Catalogue</p>
    <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">Edit product</h1>
    <p className="mt-2 text-sm text-[#758078]">Keep product details, pricing, imagery and storefront availability up to date.</p>
    <div className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8"><EditProductForm product={product} /></div>
    <ProductGalleryManager productId={product.id} images={images} />
  </div>;
}
