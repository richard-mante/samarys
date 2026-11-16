import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { CheckoutForm } from "@/features/cart/checkout-form";
import { CartIndicator } from "@/features/cart/cart-controls";
import { getStoreSettings } from "@/lib/settings";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = { title: "Your order", alternates: { canonical: "/checkout" }, robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  const catalogue = settings.orderingEnabled ? await db.select({
    id: products.id,
    name: products.name,
    shortDescription: products.shortDescription,
    priceMinor: products.priceMinor,
    stockQuantity: products.stockQuantity,
  }).from(products).where(eq(products.isActive, true)).orderBy(asc(products.name)) : [];
  const sellerContactUrl = createSellerWhatsAppUrl(
    "Hello Samary's, I would like to enquire about product availability and when ordering will open.",
    settings.sellerWhatsAppNumber,
  );

  return <main className="min-h-screen bg-[#f8f7f2]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
      {settings.orderingEnabled && <CartIndicator />}
    </header>
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-8 lg:px-10 lg:pt-12">
      <Link href="/#collection" className="text-sm text-[#66836c] hover:underline">← Continue browsing</Link>
      {settings.orderingEnabled ? <>
        <div className="mt-6 mb-10 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Your order · Samary&apos;s</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.05em] text-[#203a2b] sm:text-6xl">Let&apos;s get the details right.</h1>
          <p className="mt-5 text-sm leading-7 text-[#758078]">Review your selection and share your contact details. We&apos;ll prepare an order request and connect you with the seller on WhatsApp.</p>
        </div>
        <CheckoutForm products={catalogue} />
      </> : <div className="mx-auto mt-16 max-w-xl rounded-[1.75rem] border border-[#dce5d8] bg-white px-7 py-12 text-center shadow-[0_20px_60px_rgba(37,65,45,0.05)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Preparing for launch</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-[#203a2b]">Ordering will open soon.</h1>
        <p className="mt-4 text-sm leading-7 text-[#758078]">We&apos;re completing product and delivery checks before accepting order requests. You can still contact the seller with questions.</p>
        <a href={sellerContactUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex rounded-full bg-[#244b36] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#183a28]">Contact the seller on WhatsApp ↗</a>
      </div>}
    </section>
  </main>;
}
