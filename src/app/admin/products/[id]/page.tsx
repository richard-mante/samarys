import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { EditProductForm } from "@/features/products/edit-product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  return <div className="mx-auto max-w-2xl">
    <Link href="/admin/products" className="text-sm text-[#66836c] hover:underline">← Back to products</Link>
    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Catalogue</p>
    <h1 className="mt-2 font-serif text-4xl">Edit product</h1>
    <p className="mt-2 text-sm text-[#758078]">Update product information, pricing and storefront visibility.</p>
    <div className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8"><EditProductForm product={product} /></div>
  </div>;
}
