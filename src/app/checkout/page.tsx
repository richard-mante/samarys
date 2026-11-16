import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CheckoutForm } from "@/features/cart/checkout-form";
import { CartIndicator } from "@/features/cart/cart-controls";

export const metadata = { title: "Your order" };

export default async function CheckoutPage() {
  const catalogue = await db.select({
    id: products.id,
    name: products.name,
    shortDescription: products.shortDescription,
    priceMinor: products.priceMinor,
    stockQuantity: products.stockQuantity,
  }).from(products).where(eq(products.isActive, true)).orderBy(asc(products.name));

  return <main className="min-h-screen bg-[#f8f7f2]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
      <CartIndicator />
    </header>
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-8 lg:px-10 lg:pt-12">
      <Link href="/#collection" className="text-sm text-[#66836c] hover:underline">← Continue browsing</Link>
      <div className="mt-6 mb-10 max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Your order · Samary&apos;s</p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-0.05em] text-[#203a2b] sm:text-6xl">Let&apos;s get the details right.</h1>
        <p className="mt-5 text-sm leading-7 text-[#758078]">Review your selection and share your contact details. We&apos;ll prepare an order request and connect you with the seller on WhatsApp.</p>
      </div>
      <CheckoutForm products={catalogue} />
    </section>
  </main>;
}
