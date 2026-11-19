import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ShoppingBag01Icon, Package01Icon, UserGroupIcon, CreditCardIcon, WhatsappIcon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";
import { normalizePhoneNumber } from "@/lib/phone";
import { OrderStatusForm } from "@/features/orders/order-status-form";
import { RecordRefundForm } from "@/features/orders/record-refund-form";
import { RecordWhatsAppPaymentForm } from "@/features/orders/record-whatsapp-payment-form";
import { CopyTextButton } from "@/components/ui/copy-text-button";

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { customer: true, items: true, payments: true },
  });
  if (!order) notFound();

  const paymentAudit = await db.select().from(auditLogs)
    .where(and(eq(auditLogs.entityId, id), eq(auditLogs.action, "MANUAL_WHATSAPP_PAYMENT_RECORDED")))
    .orderBy(desc(auditLogs.createdAt)).limit(1);
  const paymentMetadata = paymentAudit[0]?.metadata as {
    method?: string;
    paymentReference?: string | null;
    amountReceivedMinor?: number;
  } | null;
  const refundAudit = await db.select().from(auditLogs)
    .where(and(eq(auditLogs.entityId, id), eq(auditLogs.action, "ORDER_REFUND_RECORDED")))
    .orderBy(desc(auditLogs.createdAt)).limit(1);
  const refundMetadata = refundAudit[0]?.metadata as {
    amountMinor?: number;
    method?: string;
    refundReference?: string | null;
    reason?: string;
  } | null;

  return <div className="mx-auto max-w-5xl">
    <Link href="/admin/orders" aria-label="Back to orders" className="inline-flex items-center gap-1.5 text-sm text-[#66836c] transition hover:text-[#244b36]"><HugeiconsIcon icon={ArrowLeft01Icon} size={17} /><span className="hidden sm:inline">Orders</span></Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66836c]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={ShoppingBag01Icon} size={16} />Order management</span></p>
        <div className="mt-2"><CopyTextButton value={order.reference} className="font-serif text-4xl tracking-tight text-[#203a2b]">{order.reference}</CopyTextButton></div>
        <p className="mt-2 text-sm text-[#758078]">Placed {new Intl.DateTimeFormat("en-GH", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)}</p>
      </div>
      <span className="rounded-full bg-[#edf3eb] px-4 py-2 text-xs font-semibold text-[#41684d]">{statusLabels[order.status] ?? order.status}</span>
    </div>

    {order.status === "CANCELLED" && order.paymentStatus === "PAID" && <div role="alert" className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">Payment was received for this cancelled order. Review the transaction in Paystack and arrange a refund if appropriate; refunds are not processed automatically by this app.</div>}
    {order.channel === "PAYSTACK" && order.paymentStatus === "PENDING" && order.status !== "CANCELLED" && <div className="mt-6 rounded-2xl border border-[#dce5d8] bg-[#f6f8f4] p-5 text-sm leading-6 text-[#526b56]">{new Date(order.createdAt).getTime() + 30 * 60 * 1000 > Date.now() ? "Online stock reservation is active until " + new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000)) + "." : "The 30-minute online stock reservation has expired. Any late payment will be checked against current stock and may require a refund."}</div>}
    {order.paymentStatus === "REFUNDED" && refundAudit[0] && <div className="mt-6 rounded-2xl border border-[#dce5d8] bg-[#f6f8f4] p-5 text-sm leading-6 text-[#526b56]"><p className="font-semibold text-[#304236]">Refund recorded · {formatGhsFromPesewas(refundMetadata?.amountMinor ?? order.totalMinor)}</p><p className="mt-1">Recorded {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(refundAudit[0].createdAt)} via {refundMetadata?.method === "PAYSTACK_DASHBOARD" ? "Paystack Dashboard" : "manual refund"}.</p>{refundMetadata?.refundReference && <p className="mt-1">Reference: {refundMetadata.refundReference}</p>}{refundMetadata?.reason && <p className="mt-2">Note: {refundMetadata.reason}</p>}</div>}
    {order.paymentStatus === "PAID" && <RecordRefundForm orderId={order.id} channel={order.channel} />}

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={Package01Icon} size={19} />Items ordered</span></h2>
          <div className="mt-5 divide-y divide-[#edf0ea]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div><p className="text-sm font-medium text-[#304236]">{item.productNameSnapshot}</p><p className="mt-1 text-xs text-[#849087]">Qty {item.quantity} × {formatGhsFromPesewas(item.unitPriceMinor)}</p></div>
                <p className="text-sm font-semibold text-[#304236]">{formatGhsFromPesewas(item.lineTotalMinor)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-[#edf0ea] pt-5 text-sm">
            <div className="flex justify-between text-[#758078]"><span>Items subtotal</span><span>{formatGhsFromPesewas(order.subtotalMinor)}</span></div>
            <div className="flex justify-between text-[#758078]"><span>Delivery</span><span>{order.deliveryFeeMinor > 0 ? formatGhsFromPesewas(order.deliveryFeeMinor) : "Confirm with seller"}</span></div>
            <div className="flex justify-between pt-2 text-base font-semibold text-[#203a2b]"><span>Order total</span><span>{formatGhsFromPesewas(order.totalMinor)}</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={UserGroupIcon} size={19} />Customer details</span></h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-[#849087]">Full name</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.customer.fullName}</dd></div>
            <div><dt className="text-xs text-[#849087]">Phone</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.customer.phone}</dd></div>
            <div><dt className="text-xs text-[#849087]">Email</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.customer.email || "Not provided"}</dd></div>
            <div><dt className="text-xs text-[#849087]">Order channel</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.channel === "PAYSTACK" ? "Online payment" : "WhatsApp assisted"}</dd></div>
          </dl>
          {(order.deliveryAddress || order.deliveryCity || order.deliveryRegion || order.deliveryNotes) && <div className="mt-6 border-t border-[#edf0ea] pt-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#849087]">Delivery information</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#526157]">{[order.deliveryAddress, order.deliveryCity, order.deliveryRegion].filter(Boolean).join(", ") || "Address not supplied"}</p>{order.deliveryNotes && <p className="mt-2 text-sm leading-6 text-[#758078]">Note: {order.deliveryNotes}</p>}</div>}
        </section>

        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={CreditCardIcon} size={19} />Payment record</span></h2>
          <p className="mt-2 text-sm text-[#758078]">Payment status: <strong className="text-[#304236]">{order.paymentStatus}</strong>{order.channel === "WHATSAPP" && order.paymentStatus !== "PAID" ? " · Payment is arranged directly with the seller." : ""}</p>
          {order.payments.length > 0 ? (
            <div className="mt-4 divide-y divide-[#edf0ea]">{order.payments.map(payment => <div key={payment.id} className="py-3 first:pt-0"><p className="text-sm font-medium text-[#304236]">{payment.provider} · {payment.status}</p><p className="mt-1 break-all text-xs text-[#849087]">{payment.providerReference}</p><p className="mt-1 text-xs text-[#849087]">{formatGhsFromPesewas(payment.amountMinor)}</p></div>)}</div>
          ) : order.paymentStatus === "PAID" && paymentMetadata ? (
            <div className="mt-4 rounded-xl bg-[#eef5ed] p-4">
              <p className="text-sm font-semibold text-[#315b3b]">Payment confirmed by seller</p>
              <p className="mt-2 text-xs text-[#526b56]">Method: {paymentMetadata.method?.replaceAll("_", " ") ?? "Not recorded"}</p>
              {paymentMetadata.paymentReference && <p className="mt-1 break-all text-xs text-[#526b56]">Reference: {paymentMetadata.paymentReference}</p>}
              <p className="mt-1 text-xs text-[#526b56]">Amount: {formatGhsFromPesewas(paymentMetadata.amountReceivedMinor ?? order.totalMinor)}</p>
            </div>
          ) : <p className="mt-4 text-sm text-[#849087]">No online payment transaction is linked to this order.</p>}
          {order.channel === "WHATSAPP" && order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && <RecordWhatsAppPaymentForm orderId={order.id} subtotalGhs={(order.subtotalMinor / 100).toFixed(2)} />}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={Package01Icon} size={15} />Fulfilment</span></p>
          <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Update order</h2>
          <p className="mt-2 text-sm leading-6 text-[#758078]">Move this order through its next valid step. Every change is recorded in the admin audit log.</p>
          <div className="mt-6"><OrderStatusForm orderId={order.id} status={order.status} paymentStatus={order.paymentStatus} /></div>
        </section>
        <a href={"https://wa.me/" + normalizePhoneNumber(order.customer.phone) + "?text=" + encodeURIComponent("Hello " + order.customer.fullName + ", regarding your Samary's order " + order.reference + ".")} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[#dce5d8] bg-[#f1f5ef] p-5 text-sm font-semibold text-[#315b3b] transition hover:bg-[#e8efe5]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={WhatsappIcon} size={18} />Contact customer on WhatsApp</span><HugeiconsIcon icon={ArrowUpRight01Icon} size={16} /></a>
      </aside>
    </div>
  </div>;
}
