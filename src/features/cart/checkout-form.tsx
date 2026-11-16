"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useCart } from "@/features/cart/cart-provider";
import { formatGhsFromPesewas } from "@/lib/money";
import { createWhatsAppOrder } from "@/features/orders/create-whatsapp-order";

type CheckoutProduct = { id: string; name: string; shortDescription: string | null; priceMinor: number; stockQuantity: number | null };

const fieldClass = "w-full rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm text-[#304236] outline-none transition placeholder:text-[#a0aaa0] focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]";

export function CheckoutForm({ products }: { products: CheckoutProduct[] }) {
  const { items, ready, setQuantity, removeItem, clearCart } = useCart();
  const [state, action, pending] = useActionState(createWhatsAppOrder, {});
  const productMap = new Map(products.map((product) => [product.id, product]));
  const cartLines = items.map((item) => ({ ...item, product: productMap.get(item.productId) })).filter((item) => item.product);
  const subtotal = cartLines.reduce((sum, item) => sum + (item.product?.priceMinor ?? 0) * item.quantity, 0);

  useEffect(() => {
    if (state.whatsappUrl) clearCart();
  }, [state.whatsappUrl, clearCart]);

  if (!ready) return <div className="rounded-2xl border border-[#e4e8e1] bg-white p-10 text-center text-sm text-[#758078]">Preparing your order basket…</div>;

  if (state.whatsappUrl) {
    return <section className="rounded-[1.75rem] border border-[#dce5d8] bg-white p-7 text-center shadow-[0_20px_60px_rgba(37,65,45,0.06)] sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4eb] text-2xl text-[#41684d]">✓</span>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Request saved</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#203a2b]">One last step.</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#758078]">{state.success}</p>
      <p className="mt-5 rounded-xl bg-[#f5f7f3] px-4 py-3 text-sm font-semibold text-[#405447]">Reference: {state.reference}</p>
      <a href={state.whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#244b36] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#183a28] sm:w-auto">Continue to WhatsApp <span aria-hidden="true">↗</span></a>
      <p className="mt-4 text-xs leading-6 text-[#849087]">Your request is saved, but it is not yet a paid or confirmed order. The seller will confirm availability and delivery cost with you.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#66836c] hover:underline">Return to the collection</Link>
    </section>;
  }

  if (items.length === 0 || cartLines.length === 0) {
    return <section className="rounded-[1.75rem] border border-dashed border-[#d9e1d6] bg-white px-6 py-16 text-center">
      <p className="font-serif text-3xl text-[#405447]">Your order basket is empty.</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#849087]">Explore the collection and add the products you would like to enquire about.</p>
      <Link href="/#collection" className="mt-7 inline-flex rounded-full bg-[#244b36] px-7 py-3.5 text-sm font-semibold text-white">Explore products</Link>
    </section>;
  }

  return <form action={action} className="grid gap-8 lg:grid-cols-[1fr_0.82fr]">
    <div className="space-y-7">
      <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Your selection</p><h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Order summary</h2></div><span className="text-xs text-[#849087]">{cartLines.length} product(s)</span></div>
        <div className="mt-5 divide-y divide-[#edf0ea]">
          {cartLines.map((line) => <div key={line.productId} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#304236]">{line.product?.name}</p><p className="mt-1 text-xs text-[#849087]">{formatGhsFromPesewas(line.product?.priceMinor ?? 0)} each</p><button type="button" onClick={() => removeItem(line.productId)} className="mt-2 text-xs font-medium text-[#9b5148] hover:underline">Remove</button></div>
            <div className="flex items-center gap-3"><button type="button" aria-label={"Decrease " + line.product?.name + " quantity"} onClick={() => setQuantity(line.productId, line.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe5dc] text-[#526b56]">−</button><span className="w-5 text-center text-sm tabular-nums">{line.quantity}</span><button type="button" aria-label={"Increase " + line.product?.name + " quantity"} disabled={line.quantity >= 99 || (line.product?.stockQuantity !== null && line.product?.stockQuantity !== undefined && line.quantity >= line.product.stockQuantity)} onClick={() => setQuantity(line.productId, line.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe5dc] text-[#526b56] disabled:opacity-40">+</button></div>
            <p className="w-24 text-right text-sm font-semibold text-[#304236]">{formatGhsFromPesewas((line.product?.priceMinor ?? 0) * line.quantity)}</p>
          </div>)}
        </div>
        {cartLines.length !== items.length && <p className="mt-4 text-xs text-[#9b5148]">Some products are no longer available and have been excluded. Remove them from your basket to continue.</p>}
      </section>

      <section className="rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">02 / Your details</p>
        <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Where can we reach you?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#304236]">Full name</label><input id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={180} className={fieldClass} placeholder="Your full name"/></div>
          <div><label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#304236]">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={32} className={fieldClass} placeholder="e.g. 055 000 0000"/></div>
          <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-[#304236]">Email <span className="font-normal text-[#9aa49a]">(optional)</span></label><input id="email" name="email" type="email" autoComplete="email" className={fieldClass} placeholder="you@example.com"/></div>
          <div className="sm:col-span-2"><label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium text-[#304236]">Delivery address / landmark</label><input id="deliveryAddress" name="deliveryAddress" autoComplete="street-address" required minLength={5} maxLength={2000} className={fieldClass} placeholder="House number, street or nearby landmark"/></div>
          <div><label htmlFor="deliveryCity" className="mb-2 block text-sm font-medium text-[#304236]">Town / city</label><input id="deliveryCity" name="deliveryCity" autoComplete="address-level2" required minLength={2} maxLength={120} className={fieldClass} placeholder="e.g. Accra"/></div>
          <div><label htmlFor="deliveryRegion" className="mb-2 block text-sm font-medium text-[#304236]">Region <span className="font-normal text-[#9aa49a]">(optional)</span></label><input id="deliveryRegion" name="deliveryRegion" autoComplete="address-level1" maxLength={120} className={fieldClass} placeholder="e.g. Greater Accra"/></div>
          <div className="sm:col-span-2"><label htmlFor="deliveryNotes" className="mb-2 block text-sm font-medium text-[#304236]">Additional directions <span className="font-normal text-[#9aa49a]">(optional)</span></label><textarea id="deliveryNotes" name="deliveryNotes" rows={3} maxLength={2000} className={fieldClass} placeholder="Anything that will help us locate you?"/></div>
        </div>
      </section>
    </div>

    <aside className="h-fit rounded-2xl border border-[#dfe5dc] bg-[#f0f4ed] p-6 sm:p-8 lg:sticky lg:top-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">03 / Review</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Almost there.</h2>
      <div className="mt-6 flex justify-between gap-4 text-sm text-[#68766c]"><span>Items subtotal</span><span className="font-semibold text-[#304236]">{formatGhsFromPesewas(subtotal)}</span></div>
      <div className="mt-4 flex justify-between gap-4 border-t border-[#dce5d8] pt-4 text-sm text-[#68766c]"><span>Delivery</span><span className="font-medium text-[#526b56]">Confirm with seller</span></div>
      <div className="mt-5 flex justify-between gap-4 border-t border-[#dce5d8] pt-5"><span className="text-sm font-semibold text-[#304236]">Items total</span><span className="text-xl font-semibold tracking-tight text-[#244b36]">{formatGhsFromPesewas(subtotal)}</span></div>
      <p className="mt-5 text-xs leading-6 text-[#758078]">This is an order request, not a payment. Delivery cost and availability will be confirmed by the seller on WhatsApp. No payment is collected on this page.</p>
      <input type="hidden" name="items" value={JSON.stringify(cartLines.map(({ productId, quantity }) => ({ productId, quantity })))} />
      {state.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending || cartLines.length !== items.length || subtotal <= 0} className="mt-6 w-full rounded-full bg-[#244b36] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Saving your request…" : "Continue with WhatsApp ↗"}</button>
      <p className="mt-4 text-center text-[10px] leading-5 text-[#849087]">By continuing, you agree to be contacted about this order request.</p>
    </aside>
  </form>;
}
