import { desc } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const rows = await db.query.payments.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 100,
    with: { order: true },
  });
  return <div>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Finance</p>
    <h1 className="mt-2 font-serif text-4xl">Payments</h1>
    <p className="mt-2 text-sm text-[#758078]">Paystack transactions and payment reconciliation.</p>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {rows.length === 0 ? <p className="px-6 py-16 text-center text-sm text-[#758078]">No payment transactions have been recorded.</p> :
        <div className="divide-y divide-[#edf0ea]">{rows.map(payment => <article key={payment.id} className="grid gap-2 px-6 py-5 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div><p className="font-medium">{payment.order.reference}</p><p className="mt-1 break-all text-xs text-[#849087]">{payment.providerReference}</p></div>
          <p className="text-sm">{payment.status}</p>
          <p className="font-semibold md:text-right">{formatGhsFromPesewas(payment.amountMinor)}</p>
        </article>)}</div>}
    </div>
  </div>;
}
