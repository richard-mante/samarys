import Link from "next/link";
import { count, desc, ilike, max, or, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";
import { normalizePhoneNumber } from "@/lib/phone";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 120);
  const phoneSearch = query.replace(/\D/g, "").length >= 7 ? normalizePhoneNumber(query) : query;

  const rows = await db.select({
    id: customers.id,
    fullName: customers.fullName,
    phone: customers.phone,
    email: customers.email,
    orderCount: count(orders.id),
    paidTotal: sum(sql<number>`case when ${orders.paymentStatus} = 'PAID' then ${orders.totalMinor} else 0 end`),
    lastOrderAt: max(orders.createdAt),
  }).from(customers)
    .leftJoin(orders, sql`${orders.customerId} = ${customers.id}`)
    .where(query ? or(
      ilike(customers.fullName, "%" + query + "%"),
      ilike(customers.phone, "%" + phoneSearch + "%"),
      ilike(customers.email, "%" + query + "%"),
    ) : undefined)
    .groupBy(customers.id)
    .orderBy(desc(max(orders.createdAt)))
    .limit(100);

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Relationships</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">Customers</h1><p className="mt-2 text-sm text-[#758078]">Customer contact details, order history and verified spend.</p></div>
      <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-[#68766c]">{rows.length} customers · latest 100</span>
    </div>
    <form method="get" className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#e4e8e1] bg-white p-4 sm:flex-row">
      <label htmlFor="q" className="sr-only">Search customers</label>
      <input id="q" name="q" value={query} placeholder="Search name, phone or email" className="min-w-0 flex-1 rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c]"/>
      <div className="flex gap-2"><button type="submit" className="flex-1 rounded-full bg-[#244b36] px-6 py-3 text-sm font-semibold text-white">Search</button><Link href="/admin/customers" className="rounded-full border border-[#dfe5dc] px-5 py-3 text-sm font-semibold text-[#526157]">Reset</Link></div>
    </form>
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {rows.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-serif text-2xl text-[#405447]">No customers found</p><p className="mt-2 text-sm text-[#758078]">Customers will appear here after an order request is created.</p></div> :
        <div className="divide-y divide-[#edf0ea]">{rows.map((customer) => <Link key={customer.id} href={"/admin/customers/" + customer.id} className="grid gap-3 px-6 py-5 transition hover:bg-[#fbfcf9] sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#304236]">{customer.fullName}</p><p className="mt-1 text-xs text-[#849087]">{customer.phone}{customer.email ? " · " + customer.email : ""}</p></div>
          <div className="text-xs text-[#758078]">{Number(customer.orderCount)} {Number(customer.orderCount) === 1 ? "order" : "orders"}<p className="mt-1 text-[10px] text-[#9aa49a]">{customer.lastOrderAt ? "Last order " + new Intl.DateTimeFormat("en-GH", { dateStyle: "medium" }).format(customer.lastOrderAt) : "No orders yet"}</p></div>
          <div className="sm:text-right"><p className="text-sm font-semibold text-[#203a2b]">{formatGhsFromPesewas(Number(customer.paidTotal ?? 0))}</p><p className="mt-1 text-[10px] text-[#9aa49a]">Verified spend</p></div>
        </Link>)}</div>}
    </section>
  </div>;
}
