import { desc, eq, inArray } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon } from "@hugeicons/core-free-icons";
import { db } from "@/db";
import { auditLogs, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const [onlinePayments, manualPayments] = await Promise.all([
    db.query.payments.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 100,
      with: { order: true },
    }),
    db.select().from(auditLogs)
      .where(eq(auditLogs.action, "MANUAL_WHATSAPP_PAYMENT_RECORDED"))
      .orderBy(desc(auditLogs.createdAt)).limit(100),
  ]);

  const manualOrderIds = [...new Set(manualPayments.map((payment) => payment.entityId).filter((id): id is string => Boolean(id)))];
  const relatedOrders = manualOrderIds.length
    ? await db.select({ id: orders.id, reference: orders.reference, paymentStatus: orders.paymentStatus }).from(orders).where(inArray(orders.id, manualOrderIds))
    : [];
  const relatedOrderMap = new Map(relatedOrders.map((order) => [order.id, order]));

  const entries = [
    ...onlinePayments.map((payment) => ({
      id: payment.id,
      createdAt: payment.createdAt,
      orderReference: payment.order.reference,
      provider: "Paystack",
      reference: payment.providerReference,
      status: payment.status,
      amountMinor: payment.amountMinor,
    })),
    ...manualPayments.map((payment) => {
      const metadata = payment.metadata as { amountReceivedMinor?: number; method?: string; paymentReference?: string | null } | null;
      return {
        id: payment.id,
        createdAt: payment.createdAt,
        orderReference: payment.entityId ? relatedOrderMap.get(payment.entityId)?.reference ?? "Order unavailable" : "Order unavailable",
        provider: "WhatsApp / " + (metadata?.method?.replaceAll("_", " ") ?? "Manual"),
        reference: metadata?.paymentReference || "Seller-confirmed payment",
        status: payment.entityId ? relatedOrderMap.get(payment.entityId)?.paymentStatus ?? "PAID" : "PAID",
        amountMinor: metadata?.amountReceivedMinor ?? 0,
      };
    }),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100);

  return <div>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Finance</p>
    <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]"><span className="inline-flex items-center gap-3"><HugeiconsIcon icon={CreditCardIcon} size={25} />Payments</span></h1>
    <p className="mt-2 text-sm text-[#758078]">Online Paystack transactions and seller-confirmed WhatsApp payments.</p>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white">
      {entries.length === 0 ? <p className="px-6 py-16 text-center text-sm text-[#758078]">No payment records have been recorded.</p> :
        <div className="divide-y divide-[#edf0ea]">{entries.map(payment => <article key={payment.id} className="grid gap-3 px-6 py-5 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div><p className="font-medium text-[#304236]">{payment.orderReference}</p><p className="mt-1 text-xs text-[#849087]">{payment.provider} · {payment.reference}</p><p className="mt-1 text-[11px] text-[#9aa49a]">{new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(payment.createdAt)}</p></div>
          <span className="w-fit rounded-full bg-[#f1f4ef] px-3 py-1.5 text-[11px] font-medium text-[#526b56]">{payment.status}</span>
          <p className="font-semibold text-[#203a2b] md:text-right">{payment.amountMinor > 0 ? formatGhsFromPesewas(payment.amountMinor) : "Amount unavailable"}</p>
        </article>)}</div>}
    </div>
  </div>;
}
