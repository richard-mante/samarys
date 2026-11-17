import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { requireAdmin } from "@/lib/admin";
import { ProductCatalogueActions } from "@/features/products/product-catalogue-actions";

export default async function AdminProductsPage() {
  await requireAdmin();
  const rows = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { images: true },
  });

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Catalogue</p><h1 className="mt-2 font-serif text-4xl">Products</h1><p className="mt-2 text-sm text-[#758078]">Manage product information, pricing and availability.</p></div><ProductCatalogueActions /></div>

    {rows.length === 0 ? (
      <div className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white px-6 py-16 text-center"><p className="font-medium">Your catalogue is empty</p><p className="mt-2 text-sm text-[#758078]">Add your first product to begin configuring the storefront.</p></div>
    ) : (
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((product) => {
          const firstImage = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];
          return (
            <Link key={product.id} href={"/admin/products/" + product.id} className="group overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#cbd8c7] hover:shadow-[0_16px_36px_rgba(37,65,45,0.08)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f2f4ef]">
                {firstImage ? (
                  <img src={firstImage.imageUrl} alt={firstImage.altText} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#9aa49a]">No product image</div>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-semibold ${product.isActive ? "bg-[#edf4e9] text-[#41684d]" : "bg-white/90 text-[#758078]"}`}>{product.isActive ? "Active" : "Hidden"}</span>
                {product.images.length > 1 && <span className="absolute bottom-3 right-3 rounded-full bg-[#203a2b]/80 px-2.5 py-1 text-[10px] font-medium text-white">{product.images.length} photos</span>}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="truncate font-semibold text-[#304236] group-hover:text-[#41684d]">{product.name}</h2><p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-[#849087]">{product.shortDescription || product.description || "No product description added yet."}</p></div>
                  <span className="shrink-0 text-sm font-semibold text-[#203a2b]">{formatGhsFromPesewas(product.priceMinor)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#edf0ea] pt-3 text-xs text-[#849087]">
                  <span>{product.stockQuantity === null ? "Stock not tracked" : product.stockQuantity + " in stock"}</span>
                  <span className="font-semibold text-[#41684d]">View details <span aria-hidden="true">→</span></span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </div>;
}
