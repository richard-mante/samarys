"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type OrderResult = {
  reference: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "PROCESSING" | "FULFILLED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  channel: "PAYSTACK" | "WHATSAPP";
  currency: string;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  createdAt: string;
  updatedAt: string;
  items: { id: string; name: string; quantity: number; unitPriceMinor: number; lineTotalMinor: number }[];
};

const statusLabels: Record<OrderResult["status"], string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

const paymentLabels: Record<OrderResult["paymentStatus"], string> = {
  UNPAID: "Payment not yet recorded",
  PENDING: "Payment being verified",
  PAID: "Paid",
  FAILED: "Payment not completed",
  REFUNDED: "Refunded",
};

function money(amount: number) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount / 100);
}

export function OrderTracker() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOrder(null);
    setPending(true);
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, phone }),
        cache: "no-store",
      });
      const result = await response.json() as { order?: OrderResult; error?: string };
      if (!response.ok || !result.order) throw new Error(result.error || "We couldn't find that order.");
      setOrder(result.order);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't look up your order. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
    <form onSubmit={submit} className="h-fit rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Order details</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Find your order</h2>
      <p className="mt-3 text-sm leading-6 text-[#758078]">Enter the reference from your order confirmation and the phone number you used at checkout.</p>
      <label htmlFor="order-reference" className="mt-6 mb-2 block text-sm font-medium text-[#304236]">Order reference</label>
      <input id="order-reference" value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="SAM-XXXXXXXXXXXX" autoComplete="off" required maxLength={20} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm uppercase tracking-[0.08em] outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
      <label htmlFor="order-phone" className="mt-5 mb-2 block text-sm font-medium text-[#304236]">Checkout phone number</label>
      <input id="order-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 055 000 0000" autoComplete="tel" required minLength={7} maxLength={32} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={pending || !reference.trim() || !phone.trim()} className="mt-6 w-full rounded-full bg-[#244b36] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Finding your order…" : "Track order"}</button>
      <p className="mt-4 text-xs leading-5 text-[#849087]">For your privacy, both details must match the original order.</p>
    </form>

    <section aria-live="polite" className="min-h-72 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      {!order ? <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f4ed] text-xl text-[#66836c]" aria-hidden="true">↗</span>
        <h2 className="mt-5 font-serif text-2xl text-[#405447]">Your order, at a glance.</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[#849087]">Your latest order status and payment information will appear here once you enter your details.</p>
      </div> : <>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf0ea] pb-6">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Order found</p><h2 className="mt-2 font-serif text-3xl text-[#203a2b]">{order.reference}</h2><p className="mt-2 text-xs text-[#849087]">Placed {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</p></div>
          <span className="rounded-full bg-[#edf4eb] px-3 py-2 text-xs font-semibold text-[#41684d]">{statusLabels[order.status]}</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f6f8f4] p-4"><p className="text-xs text-[#849087]">Payment</p><p className="mt-1 text-sm font-semibold text-[#304236]">{paymentLabels[order.paymentStatus]}</p></div>
          <div className="rounded-xl bg-[#f6f8f4] p-4"><p className="text-xs text-[#849087]">Order channel</p><p className="mt-1 text-sm font-semibold text-[#304236]">{order.channel === "PAYSTACK" ? "Online checkout" : "WhatsApp-assisted"}</p></div>
        </div>
        <div className="mt-7">
          <h3 className="font-serif text-xl text-[#203a2b]">Items</h3>
          <div className="mt-3 divide-y divide-[#edf0ea]">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-medium text-[#405447]">{item.name}</p><p className="mt-1 text-xs text-[#849087]">Qty {item.quantity} × {money(item.unitPriceMinor)}</p></div><p className="font-semibold text-[#304236]">{money(item.lineTotalMinor)}</p></div>)}</div>
        </div>
        <div className="mt-5 space-y-2 border-t border-[#edf0ea] pt-5 text-sm">
          <div className="flex justify-between text-[#758078]"><span>Items subtotal</span><span>{money(order.subtotalMinor)}</span></div>
          <div className="flex justify-between text-[#758078]"><span>Delivery</span><span>{order.deliveryFeeMinor > 0 ? money(order.deliveryFeeMinor) : "To be confirmed"}</span></div>
          <div className="flex justify-between border-t border-[#edf0ea] pt-3 font-semibold text-[#203a2b]"><span>Order total</span><span>{money(order.totalMinor)}</span></div>
        </div>
        <p className="mt-5 text-xs leading-6 text-[#849087]">{order.status === "FULFILLED" ? "This order has been marked as fulfilled. Contact the seller if you need any further assistance." : order.status === "CANCELLED" ? "This order has been cancelled. Please contact the seller if you need help." : "The seller will update this status as your order progresses. WhatsApp-assisted orders remain unpaid until the seller records payment."}</p>
      </>}
    </section>
  </div>;
}
