import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export default async function AdminOrdersPage() {
  await requireAdmin();
  const rows = await db.query.orders.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 100,
    with: { customer: true, items: true },
  });

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Sales</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">Orders</h1><p className="mt-2 text-sm text-[#758078]">Review customer orders, payment states and fulfilment details.</p></div>
      <p className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#68766c]">{rows.length} recent orders</p>
    </div>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {rows.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-serif text-2xl text-[#405447]">No orders yet</p><p className="mt-2 text-sm text-[#758078]">New customer orders will appear here when checkout is enabled.</p></div> :
        <div className="divide-y divide-[#edf0ea]">{rows.map(order => <article key={order.id} className="grid gap-4 px-6 py-5 transition hover:bg-[#fcfdfb] md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="min-w-0"><Link href={"/admin/orders/" + order.id} className="font-medium text-[#304236] hover:text-[#66836c] hover:underline">{order.customer.fullName}</Link><p className="mt-1 text-xs text-[#849087]">{order.reference} · {order.customer.phone}</p><p className="mt-1 text-xs text-[#849087]">{order.items.length} item(s) · {order.channel === "PAYSTACK" ? "Online" : "WhatsApp"}</p></div>
          <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-start"><span className="rounded-full bg-[#f1f4ef] px-3 py-1.5 text-[11px] font-medium text-[#526b56]">{statusLabels[order.status] ?? order.status}</span><span className="text-[11px] text-[#849087]">Payment: {order.paymentStatus.toLowerCase()}</span></div>
          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end"><p className="font-semibold text-[#203a2b]">{formatGhsFromPesewas(order.totalMinor)}</p><Link href={"/admin/orders/" + order.id} className="text-xs font-semibold text-[#41684d] hover:underline">Manage order ↗</Link></div>
        </article>)}</div>}
    </div>
  </div>;
}
