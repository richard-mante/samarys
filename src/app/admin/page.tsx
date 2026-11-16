import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingBag01Icon, Package01Icon, CreditCardIcon, Clock01Icon, Add01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { and, count, desc, eq, isNotNull, lte, sum } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { requireAdmin } from "@/lib/admin";

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [orderCount, productCount, paidRevenue, pendingCount, recentOrders, lowStockProducts] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ value: sum(orders.totalMinor) }).from(orders).where(eq(orders.paymentStatus, "PAID")),
    db.select({ value: count() }).from(orders).where(and(eq(orders.paymentStatus, "UNPAID"), eq(orders.status, "PENDING_PAYMENT"))),
    db.query.orders.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 6,
      with: { customer: true, items: true },
    }),
    db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      stockQuantity: products.stockQuantity,
    }).from(products)
      .where(and(eq(products.isActive, true), isNotNull(products.stockQuantity), lte(products.stockQuantity, 5)))
      .orderBy(products.stockQuantity)
      .limit(6),
  ]);

  const stats = [
    { label: "Total orders", value: String(orderCount[0]?.value ?? 0), note: "All order requests", href: "/admin/orders", icon: ShoppingBag01Icon },
    { label: "Live products", value: String(productCount[0]?.value ?? 0), note: "Visible in the collection", href: "/admin/products", icon: Package01Icon },
    { label: "Verified revenue", value: formatGhsFromPesewas(Number(paidRevenue[0]?.value ?? 0)), note: "Payments marked as received", href: "/admin/payments", icon: CreditCardIcon },
    { label: "Awaiting payment", value: String(pendingCount[0]?.value ?? 0), note: "Requests needing attention", href: "/admin/orders", icon: Clock01Icon },
  ];

  return (
    <div className="space-y-9">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-[#203a2b] px-7 py-9 text-[#f8f7f2] sm:px-10 sm:py-11">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-14 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#b3c5ac]">Seller workspace · Samary&apos;s</p>
            <h1 className="mt-4 font-serif text-4xl tracking-[-0.04em] sm:text-5xl">A clearer view of your store.</h1>
            <p className="mt-3 max-w-lg text-sm leading-7 text-[#c2cec0]">Your orders, products and customer activity, gathered in one place.</p>
          </div>
          <Link href="/admin/products/new" className="inline-flex items-center gap-3 rounded-full bg-[#f8f7f2] px-6 py-3.5 text-sm font-semibold text-[#244b36] transition hover:-translate-y-0.5 hover:bg-white"><HugeiconsIcon icon={Add01Icon} size={17} />Add a product</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href} className="group rounded-2xl border border-[#e4e8e1] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#cbd8c7] hover:shadow-[0_12px_30px_rgba(37,65,45,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#758078]">{stat.label}</p>
              <HugeiconsIcon icon={stat.icon} size={20} className="text-[#86a082]" />
            </div>
            <p className="mt-5 break-words text-3xl font-semibold tracking-[-0.04em] text-[#203a2b]">{stat.value}</p>
            <p className="mt-2 text-xs text-[#9aa49a]">{stat.note}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ea] px-6 py-5 sm:px-7">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789173]">Customer activity</p><h2 className="mt-1 font-serif text-2xl text-[#203a2b]">Recent orders</h2></div>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#41684d] transition hover:text-[#203a2b]">All orders <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="inline" /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center"><p className="font-serif text-2xl text-[#405447]">Your first order is on its way.</p><p className="mt-2 text-sm text-[#849087]">Customer requests will appear here once ordering is enabled.</p></div>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
              {recentOrders.map((order) => (
                <Link key={order.id} href={"/admin/orders/" + order.id} className="grid gap-3 px-6 py-4 transition hover:bg-[#fbfcf9] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-7">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#304236]">{order.customer.fullName}</p><p className="mt-1 truncate text-xs text-[#849087]">{order.reference} · {order.items.length} item(s)</p></div>
                  <span className="w-fit rounded-full bg-[#f1f4ef] px-3 py-1.5 text-[10px] font-medium text-[#526b56]">{statusLabels[order.status] ?? order.status}</span>
                  <div className="sm:text-right"><p className="text-sm font-semibold text-[#203a2b]">{formatGhsFromPesewas(order.totalMinor)}</p><p className="mt-1 text-[10px] text-[#9aa49a]">{order.paymentStatus.toLowerCase().replace("_", " ")}</p></div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0ea] px-6 py-5">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789173]">Inventory</p><h2 className="mt-1 font-serif text-2xl text-[#203a2b]">Stock watch</h2></div>
            <span className="rounded-full bg-[#f7f1e8] px-3 py-1.5 text-[10px] font-medium text-[#8b6b3f]">{lowStockProducts.length} low</span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="px-6 py-12 text-center"><p className="font-serif text-xl text-[#405447]">All clear for now.</p><p className="mt-2 text-xs leading-6 text-[#849087]">Products with five or fewer units will be highlighted here.</p></div>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
              {lowStockProducts.map((product) => (
                <Link key={product.id} href={"/admin/products/" + product.id} className="flex items-center justify-between gap-3 px-6 py-4 transition hover:bg-[#fbfcf9]">
                  <span className="min-w-0 truncate text-sm font-medium text-[#405447]">{product.name}</span>
                  <span className="shrink-0 rounded-full bg-[#fbf2e8] px-3 py-1.5 text-[11px] font-semibold text-[#916c3e]">{product.stockQuantity} left</span>
                </Link>
              ))}
            </div>
          )}
          <div className="border-t border-[#edf0ea] px-6 py-4"><Link href="/admin/products" className="text-xs font-semibold text-[#41684d] hover:underline">Manage catalogue <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="inline" /></Link></div>
        </section>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5d8] bg-[#f0f4ed] px-6 py-5 sm:px-7">
        <div><p className="text-sm font-semibold text-[#304236]">Keep your store information current</p><p className="mt-1 text-xs leading-5 text-[#758078]">Review seller contact details and launch readiness before accepting orders.</p></div>
        <Link href="/admin/settings" className="rounded-full border border-[#cbd8c7] bg-white px-5 py-2.5 text-xs font-semibold text-[#41684d] transition hover:bg-[#f8faf6]">Review settings <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="inline" /></Link>
      </section>
    </div>
  );
}
