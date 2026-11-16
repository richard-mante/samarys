import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { requireAdmin } from "@/lib/admin";
import { AppIcon } from "@/components/ui/app-icon";

export default async function AdminProductsPage() {
  await requireAdmin();
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Catalogue</p><h1 className="mt-2 font-serif text-4xl">Products</h1><p className="mt-2 text-sm text-[#758078]">Manage product information, pricing and availability.</p></div><Link href="/admin/products/new" className="rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white"><HugeiconsIcon icon={Add01Icon} size={17} className="mr-2 inline" /><AppIcon name="add" size={17} /> Add product</Link></div>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {rows.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-medium">Your catalogue is empty</p><p className="mt-2 text-sm text-[#758078]">Add your first product to begin configuring the storefront.</p></div> : <div className="divide-y divide-[#edf0ea]">{rows.map((product) => <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"><div><p className="font-medium">{product.name}</p><p className="mt-1 text-xs text-[#849087]">{product.isActive ? "Active" : "Hidden"}</p></div><div className="flex items-center gap-5"><div className="text-right"><p className="font-medium">{formatGhsFromPesewas(product.priceMinor)}</p><p className="mt-1 text-xs text-[#849087]">{product.stockQuantity === null ? "Stock not tracked" : product.stockQuantity + " in stock"}</p></div><Link href={"/admin/products/" + product.id} className="rounded-full border border-[#dfe5dc] px-4 py-2 text-sm font-medium text-[#244b36] hover:bg-[#f5f7f3]"><HugeiconsIcon icon={Edit01Icon} size={15} className="mr-1.5 inline" /><AppIcon name="edit" size={15} /> Edit</Link></div></div>)}</div>}
    </div>
  </div>;
}
