import Link from "next/link";
import { count, eq, sum } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { requireAdmin } from "@/lib/admin";

export default async function AdminOverviewPage() {\n  await requireAdmin();
  const [orderCount, productCount, paidRevenue, recentOrders] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(products),
    db.select({ value: sum(orders.totalMinor) }).from(orders).where(eq(orders.paymentStatus, "PAID")),
    db.query.orders.findMany({ orderBy: (table, { desc }) => [desc(table.createdAt)], limit: 6, with: { customer: true } }),
  ]);

  const stats = [
    { label: "Total orders", value: String(orderCount[0]?.value ?? 0) },
    { label: "Products", value: String(productCount[0]?.value ?? 0) },
    { label: "Verified revenue", value: formatGhsFromPesewas(Number(paidRevenue[0]?.value ?? 0)) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Overview</p><h1 className="mt-2 font-serif text-4xl tracking-tight">Good to see you.</h1><p className="mt-2 text-sm text-[#758078]">Here is what is happening with your store.</p></div>
        <Link href="/admin/products/new" className="rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183a28]">Add product</Link>
      </div>
      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => <section key={stat.label} className="rounded-2xl border border-[#e4e8e1] bg-white p-6"><p className="text-sm text-[#758078]">{stat.label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{stat.value}</p></section>)}
      </div>
      <section className="mt-9 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
        <div className="flex items-center justify-between border-b border-[#edf0ea] px-6 py-5"><h2 className="font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm font-medium text-[#41684d]">View all</Link></div>
        {recentOrders.length === 0 ? <p className="px-6 py-12 text-center text-sm text-[#758078]">No orders yet. New customer orders will appear here.</p> : <div className="divide-y divide-[#edf0ea]">{recentOrders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div><p className="text-sm font-medium">{order.customer.fullName}</p><p className="mt-1 text-xs text-[#849087]">{order.reference}</p></div><div className="text-right"><p className="text-sm font-medium">{formatGhsFromPesewas(order.totalMinor)}</p><p className="mt-1 text-xs text-[#849087]">{order.paymentStatus.toLowerCase().replace("_", " ")}</p></div></div>)}</div>}
      </section>
    </div>
  );
}
