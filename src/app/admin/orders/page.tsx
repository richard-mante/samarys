import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const rows = await db.query.orders.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 100,
    with: { customer: true, items: true },
  });

  return <div>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Sales</p>
    <h1 className="mt-2 font-serif text-4xl">Orders</h1>
    <p className="mt-2 text-sm text-[#758078]">Review customer orders, payment states and fulfilment details.</p>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {rows.length === 0 ? <p className="px-6 py-16 text-center text-sm text-[#758078]">Orders will appear here when customers place them.</p> :
        <div className="divide-y divide-[#edf0ea]">{rows.map(order => <article key={order.id} className="grid gap-3 px-6 py-5 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div><p className="font-medium">{order.customer.fullName}</p><p className="mt-1 text-xs text-[#849087]">{order.reference} · {order.customer.phone}</p><p className="mt-1 text-xs text-[#849087]">{order.items.length} item(s) · {order.channel}</p></div>
          <div className="text-sm"><p>{order.status.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-[#849087]">Payment: {order.paymentStatus}</p></div>
          <p className="font-semibold md:text-right">{formatGhsFromPesewas(order.totalMinor)}</p>
        </article>)}</div>}
    </div>
  </div>;
}
