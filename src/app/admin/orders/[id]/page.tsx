import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { formatGhsFromPesewas } from "@/lib/money";
import { OrderStatusForm } from "@/features/orders/order-status-form";

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

  return <div className="mx-auto max-w-5xl">
    <Link href="/admin/orders" className="text-sm text-[#66836c] transition hover:text-[#244b36]">← Back to orders</Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66836c]">Order management</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">{order.reference}</h1>
        <p className="mt-2 text-sm text-[#758078]">Placed {new Intl.DateTimeFormat("en-GH", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)}</p>
      </div>
      <span className="rounded-full bg-[#edf3eb] px-4 py-2 text-xs font-semibold text-[#41684d]">{statusLabels[order.status] ?? order.status}</span>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl text-[#203a2b]">Items ordered</h2>
          <div className="mt-5 divide-y divide-[#edf0ea]">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div><p className="text-sm font-medium text-[#304236]">{item.productNameSnapshot}</p><p className="mt-1 text-xs text-[#849087]">Qty {item.quantity} × {formatGhsFromPesewas(item.unitPriceMinor)}</p></div>
                <p className="text-sm font-semibold text-[#304236]">{formatGhsFromPesewas(item.lineTotalMinor)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-[#edf0ea] pt-5 text-sm">
            <div className="flex justify-between text-[#758078]"><span>Subtotal</span><span>{formatGhsFromPesewas(order.subtotalMinor)}</span></div>
            <div className="flex justify-between text-[#758078]"><span>Delivery</span><span>{formatGhsFromPesewas(order.deliveryFeeMinor)}</span></div>
            <div className="flex justify-between pt-2 text-base font-semibold text-[#203a2b]"><span>Total</span><span>{formatGhsFromPesewas(order.totalMinor)}</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl text-[#203a2b]">Customer details</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-[#849087]">Full name</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.customer.fullName}</dd></div>
            <div><dt className="text-xs text-[#849087]">Phone</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.customer.phone}</dd></div>
            <div><dt className="text-xs text-[#849087]">Email</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.customer.email || "Not provided"}</dd></div>
            <div><dt className="text-xs text-[#849087]">Order channel</dt><dd className="mt-1 text-sm font-medium text-[#304236]">{order.channel === "PAYSTACK" ? "Online payment" : "WhatsApp assisted"}</dd></div>
          </dl>
          {(order.deliveryAddress || order.deliveryCity || order.deliveryRegion || order.deliveryNotes) && <div className="mt-6 border-t border-[#edf0ea] pt-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#849087]">Delivery information</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#526157]">{[order.deliveryAddress, order.deliveryCity, order.deliveryRegion].filter(Boolean).join(", ") || "Address not supplied"}</p>{order.deliveryNotes && <p className="mt-2 text-sm leading-6 text-[#758078]">Note: {order.deliveryNotes}</p>}</div>}
        </section>

        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <h2 className="font-serif text-2xl text-[#203a2b]">Payment record</h2>
          <p className="mt-2 text-sm text-[#758078]">Payment status: <strong className="text-[#304236]">{order.paymentStatus}</strong></p>
          {order.payments.length ? <div className="mt-4 divide-y divide-[#edf0ea]">{order.payments.map(payment => <div key={payment.id} className="py-3 first:pt-0"><p className="text-sm font-medium text-[#304236]">{payment.provider} · {payment.status}</p><p className="mt-1 break-all text-xs text-[#849087]">{payment.providerReference}</p><p className="mt-1 text-xs text-[#849087]">{formatGhsFromPesewas(payment.amountMinor)}</p></div>)}</div> : <p className="mt-4 text-sm text-[#849087]">No online payment transaction is linked to this order.</p>}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Fulfilment</p>
          <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Update order</h2>
          <p className="mt-2 text-sm leading-6 text-[#758078]">Move this order through its next valid step. Every change is recorded in the admin audit log.</p>
          <div className="mt-6"><OrderStatusForm orderId={order.id} status={order.status} paymentStatus={order.paymentStatus} /></div>
        </section>
        <a href={"https://wa.me/" + order.customer.phone.replace(/\D/g, "") + "?text=" + encodeURIComponent("Hello " + order.customer.fullName + ", regarding your Samary's order " + order.reference + ".")} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[#dce5d8] bg-[#f1f5ef] p-5 text-sm font-semibold text-[#315b3b] transition hover:bg-[#e8efe5]">Contact customer on WhatsApp <span aria-hidden="true">↗</span></a>
      </aside>
    </div>
  </div>;
}
