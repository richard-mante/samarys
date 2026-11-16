import Link from "next/link";
import { and, desc, eq, ilike, inArray, or, count } from "drizzle-orm";
import { db } from "@/db";
import { customers, orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";
import { normalizePhoneNumber } from "@/lib/phone";

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

const validStatuses = ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "FULFILLED", "CANCELLED"] as const;
const validPayments = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"] as const;

type SearchParams = Promise<{ q?: string; status?: string; payment?: string; channel?: string }>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 120);
  const phoneSearch = query.replace(/\D/g, "").length >= 7 ? normalizePhoneNumber(query) : query;
  const status = validStatuses.includes(params.status as typeof validStatuses[number]) ? params.status : "";
  const payment = validPayments.includes(params.payment as typeof validPayments[number]) ? params.payment : "";
  const channel = params.channel === "PAYSTACK" || params.channel === "WHATSAPP" ? params.channel : "";

  const filters = [
    query ? or(
      ilike(orders.reference, "%" + query + "%"),
      ilike(customers.fullName, "%" + query + "%"),
      ilike(customers.phone, "%" + phoneSearch + "%"),
    ) : undefined,
    status ? eq(orders.status, status as typeof validStatuses[number]) : undefined,
    payment ? eq(orders.paymentStatus, payment as typeof validPayments[number]) : undefined,
    channel ? eq(orders.channel, channel as "PAYSTACK" | "WHATSAPP") : undefined,
  ];
  const rows = await db.select({
    id: orders.id,
    reference: orders.reference,
    status: orders.status,
    paymentStatus: orders.paymentStatus,
    channel: orders.channel,
    totalMinor: orders.totalMinor,
    createdAt: orders.createdAt,
    customerName: customers.fullName,
    customerPhone: customers.phone,
  }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(and(...filters))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const itemCounts = rows.length ? await db.select({
    orderId: orderItems.orderId,
    total: count(),
  }).from(orderItems).where(inArray(orderItems.orderId, rows.map((row) => row.id))).groupBy(orderItems.orderId) : [];
  const countByOrder = new Map(itemCounts.map((item) => [item.orderId, Number(item.total)]));

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Sales</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">Orders</h1><p className="mt-2 text-sm text-[#758078]">Search customers and references, then narrow orders by fulfilment or payment state.</p></div>
      <p className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#68766c]">{rows.length} matching {rows.length === 1 ? "order" : "orders"} · latest 100</p>
    </div>

    <form method="get" className="mt-7 grid gap-3 rounded-2xl border border-[#e4e8e1] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
      <div><label htmlFor="q" className="mb-2 block text-xs font-semibold text-[#526157]">Search</label><input id="q" name="q" value={query} placeholder="Name, phone or order reference" className="w-full rounded-xl border border-[#dfe5dc] px-3 py-3 text-sm outline-none focus:border-[#66836c]"/></div>
      <div><label htmlFor="status" className="mb-2 block text-xs font-semibold text-[#526157]">Fulfilment</label><select id="status" name="status" defaultValue={status} className="w-full rounded-xl border border-[#dfe5dc] bg-white px-3 py-3 text-sm"><option value="">All statuses</option>{validStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></div>
      <div><label htmlFor="payment" className="mb-2 block text-xs font-semibold text-[#526157]">Payment</label><select id="payment" name="payment" defaultValue={payment} className="w-full rounded-xl border border-[#dfe5dc] bg-white px-3 py-3 text-sm"><option value="">All payments</option>{validPayments.map((value) => <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>)}</select></div>
      <div><label htmlFor="channel" className="mb-2 block text-xs font-semibold text-[#526157]">Channel</label><select id="channel" name="channel" defaultValue={channel} className="w-full rounded-xl border border-[#dfe5dc] bg-white px-3 py-3 text-sm"><option value="">All channels</option><option value="PAYSTACK">Paystack</option><option value="WHATSAPP">WhatsApp</option></select></div>
      <div className="flex gap-2"><button type="submit" className="flex-1 rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white">Filter</button><Link href="/admin/orders" className="rounded-full border border-[#dfe5dc] px-4 py-3 text-sm font-semibold text-[#526157]">Reset</Link></div>
    </form>

    <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {rows.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-serif text-2xl text-[#405447]">No matching orders</p><p className="mt-2 text-sm text-[#758078]">Try another search or clear the filters.</p></div> :
        <div className="divide-y divide-[#edf0ea]">{rows.map((order) => <article key={order.id} className="grid gap-4 px-6 py-5 transition hover:bg-[#fcfdfb] md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="min-w-0"><Link href={"/admin/orders/" + order.id} className="font-medium text-[#304236] hover:text-[#66836c] hover:underline">{order.customerName}</Link><p className="mt-1 text-xs text-[#849087]">{order.reference} · {order.customerPhone}</p><p className="mt-1 text-xs text-[#849087]">{countByOrder.get(order.id) ?? 0} item(s) · {order.channel === "PAYSTACK" ? "Online" : "WhatsApp"}</p></div>
          <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-start"><span className="rounded-full bg-[#f1f4ef] px-3 py-1.5 text-[11px] font-medium text-[#526b56]">{statusLabels[order.status] ?? order.status}</span><span className="text-[11px] text-[#849087]">Payment: {order.paymentStatus.toLowerCase()}</span></div>
          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end"><p className="font-semibold text-[#203a2b]">{formatGhsFromPesewas(order.totalMinor)}</p><Link href={"/admin/orders/" + order.id} className="text-xs font-semibold text-[#41684d] hover:underline">Manage order ↗</Link></div>
        </article>)}</div>}
    </div>
  </div>;
}
