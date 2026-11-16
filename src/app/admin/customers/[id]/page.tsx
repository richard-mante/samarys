import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, UserGroupIcon, WhatsappIcon, ShoppingBag01Icon, CreditCardIcon } from "@hugeicons/core-free-icons";
import { notFound } from "next/navigation";
import { count, eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!customer) notFound();

  const history = await db.query.orders.findMany({
    where: eq(orders.customerId, id),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    with: { items: true },
    limit: 100,
  });
  const [metrics] = await db.select({
    orderCount: count(orders.id),
    verifiedSpend: sum(sql<number>`case when ${orders.paymentStatus} = 'PAID' then ${orders.totalMinor} else 0 end`),
  }).from(orders).where(eq(orders.customerId, id));
  const verifiedSpend = Number(metrics?.verifiedSpend ?? 0);

  return <div className="mx-auto max-w-5xl">
    <Link href="/admin/customers" className="text-sm text-[#66836c] hover:text-[#244b36]"><HugeiconsIcon icon={ArrowLeft01Icon} size={15} className="mr-1.5 inline" />Back to customers</Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
      <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66836c]"<span className="inline-flex items-center gap-2"><HugeiconsIcon icon={UserGroupIcon} size={16} />Customer profile</span></p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">{customer.fullName}</h1><p className="mt-2 text-sm text-[#758078]">Customer since {new Intl.DateTimeFormat("en-GH", { dateStyle: "long" }).format(customer.createdAt)}</p></div>
      <a href={"https://wa.me/" + customer.phone} target="_blank" rel="noreferrer" className="rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white"><HugeiconsIcon icon={WhatsappIcon} size={17} className="mr-2 inline" />Message customer</a>
    </div>
    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-[#e4e8e1] bg-white p-5"><p className="text-xs text-[#849087]">Orders</p><p className="mt-3 text-3xl font-semibold text-[#203a2b]">{Number(metrics?.orderCount ?? 0)}</p></div>
      <div className="rounded-2xl border border-[#e4e8e1] bg-white p-5"><p className="text-xs text-[#849087]">Verified spend</p><p className="mt-3 text-2xl font-semibold text-[#203a2b]">{formatGhsFromPesewas(verifiedSpend)}</p></div>
      <div className="rounded-2xl border border-[#e4e8e1] bg-white p-5"><p className="text-xs text-[#849087]">Last order</p><p className="mt-3 text-sm font-semibold text-[#203a2b]">{history[0] ? new Intl.DateTimeFormat("en-GH", { dateStyle: "medium" }).format(history[0].createdAt) : "No orders yet"}</p></div>
    </section>
    <section className="mt-6 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl text-[#203a2b]">Contact information</h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-[#849087]">Phone</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{customer.phone}</dd></div><div><dt className="text-xs text-[#849087]">Email</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{customer.email || "Not provided"}</dd></div></dl>
    </section>
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      <div className="border-b border-[#edf0ea] px-6 py-5"><h2 className="font-serif text-2xl text-[#203a2b]"<span className="inline-flex items-center gap-2"><HugeiconsIcon icon={ShoppingBag01Icon} size={19} />Order history</span></h2><p className="mt-1 text-xs text-[#849087]">Latest 100 orders associated with this customer record.</p></div>
      {history.length === 0 ? <p className="px-6 py-12 text-sm text-[#849087]">No orders recorded for this customer.</p> : <div className="divide-y divide-[#edf0ea]">{history.map((order) => <Link key={order.id} href={"/admin/orders/" + order.id} className="grid gap-3 px-6 py-5 transition hover:bg-[#fbfcf9] sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <div><p className="text-sm font-semibold text-[#304236]">{order.reference}</p><p className="mt-1 text-xs text-[#849087]">{order.items.length} item(s) · {order.channel === "PAYSTACK" ? "Paystack" : "WhatsApp"}</p><p className="mt-1 text-[11px] text-[#9aa49a]">{new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}</p></div>
        <div><p className="text-xs font-medium text-[#526157]">{statusLabels[order.status] ?? order.status}</p><p className="mt-1 text-[11px] text-[#849087]">Payment: {order.paymentStatus.toLowerCase()}</p></div>
        <p className="text-sm font-semibold text-[#203a2b] sm:text-right">{formatGhsFromPesewas(order.totalMinor)}</p>
      </Link>)}</div>}
    </section>
  </div>;
}
