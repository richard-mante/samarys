export const metadata = { title: "Thoughtful product information and personal support", description: "Explore Samarys product information, speak with the seller and manage your order.", alternates: { canonical: "/" } };

import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { CartIndicator } from "@/features/cart/cart-controls";
import { getStoreSettings } from "@/lib/settings";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const settings = await getStoreSettings();
  const sellerContactUrl = createSellerWhatsAppUrl(undefined, settings.sellerWhatsAppNumber);
  const catalogue = await db.query.products.findMany({
    where: eq(products.isActive, true),
    limit: 8,
    with: { images: true },
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7f2] text-[#203a2b]">
      <div className="bg-[#244b36] px-5 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.19em] text-white sm:text-[11px]">
        Thoughtful product information · Personal seller support
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="font-serif text-[27px] tracking-[-0.04em]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
        <nav className="hidden items-center gap-9 text-[13px] text-[#617064] md:flex">
          <a href="#collection" className="transition hover:text-[#244b36]">The collection</a>
          <a href="#approach" className="transition hover:text-[#244b36]">Our approach</a>
          <a href="#contact" className="transition hover:text-[#244b36]">Contact</a>
        </nav>
        <div className="flex items-center gap-3"><Link href="/orders/track" className="text-xs font-semibold text-[#526b56] transition hover:text-[#244b36]">Track order</Link>{settings.orderingEnabled && <CartIndicator />}<a href={sellerContactUrl} target="_blank" rel="noreferrer" className="hidden rounded-full border border-[#d7ded4] px-4 py-2.5 text-xs font-semibold text-[#244b36] transition hover:bg-white sm:inline-flex sm:px-5 sm:text-sm">Talk to us <span aria-hidden="true" className="ml-1">↗</span></a></div>
      </header>

      <section className="mx-auto grid min-h-[660px] w-full max-w-7xl items-center gap-12 px-6 pb-20 pt-8 lg:min-h-[720px] lg:grid-cols-[1fr_0.94fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-12">
        <div className="relative z-10 max-w-2xl">
          <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#728b70] sm:text-[11px]"><span className="h-px w-8 bg-[#9aac94]" /> A little more considered</p>
          <h1 className="mt-7 font-serif text-[clamp(3.5rem,8vw,6.8rem)] leading-[0.94] tracking-[-0.065em] text-[#203a2b]">
            Discover a more <em className="font-normal text-[#789173]">thoughtful</em> way.
          </h1>
          <p className="mt-8 max-w-lg text-[15px] leading-8 text-[#68766c] sm:text-base">
            Welcome to Samary&apos;s. Explore our product information, take the time to understand what is offered, and speak directly with our team whenever you need a little more clarity.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#collection" className="inline-flex items-center gap-5 rounded-full bg-[#244b36] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(36,75,54,0.16)] transition hover:-translate-y-0.5 hover:bg-[#183a28]">Explore the collection <span aria-hidden="true">↗</span></a>
            <a href={sellerContactUrl} target="_blank" rel="noreferrer" className="rounded-full px-5 py-4 text-sm font-medium text-[#526b56] transition hover:bg-white">Speak with us</a>
          </div>
          <div className="mt-12 flex items-center gap-4 border-t border-[#e2e6dd] pt-6">
            <div className="flex -space-x-2">
              <span className="h-7 w-7 rounded-full border-2 border-[#f8f7f2] bg-[#c9d7c3]" />
              <span className="h-7 w-7 rounded-full border-2 border-[#f8f7f2] bg-[#e5d8c4]" />
              <span className="h-7 w-7 rounded-full border-2 border-[#f8f7f2] bg-[#9eae96]" />
            </div>
            <p className="text-xs leading-5 text-[#849087]">Personal support, with a real person<br />ready to answer your questions.</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#e5e9df] blur-2xl" />
          <div className="relative aspect-[0.92] overflow-hidden rounded-[2rem] bg-[#e7ece3] sm:rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_42%,rgba(255,255,255,0.78),transparent_52%),linear-gradient(145deg,#e8ede5_0%,#dce5d8_52%,#cbd9c9_100%)]" />
            <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full border border-white/60" />
            <div className="absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full border border-white/55" />
            <svg viewBox="0 0 520 600" fill="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path d="M264 560C258 457 270 368 244 280C222 205 173 150 110 92" stroke="#607E62" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M252 439C189 422 136 386 111 326C165 319 215 346 252 439Z" fill="#AFC2A8" fillOpacity=".72" stroke="#789477" strokeWidth="1.5"/>
              <path d="M248 439C214 391 172 360 111 326" stroke="#789477" strokeWidth="1.2"/>
              <path d="M248 354C302 325 336 278 338 222C286 230 251 274 248 354Z" fill="#C1D0B9" fillOpacity=".8" stroke="#789477" strokeWidth="1.5"/>
              <path d="M248 354C273 303 309 265 338 222" stroke="#789477" strokeWidth="1.2"/>
              <path d="M216 261C158 249 119 211 102 159C153 158 197 192 216 261Z" fill="#C5D3BD" fillOpacity=".78" stroke="#789477" strokeWidth="1.5"/>
              <path d="M216 261C179 218 141 186 102 159" stroke="#789477" strokeWidth="1.2"/>
              <path d="M260 482C322 452 371 405 385 343C326 349 277 395 260 482Z" fill="#9FB69A" fillOpacity=".62" stroke="#789477" strokeWidth="1.5"/>
              <path d="M260 482C296 426 341 382 385 343" stroke="#789477" strokeWidth="1.2"/>
              <path d="M262 562C305 515 337 477 354 430" stroke="#607E62" strokeWidth="2" strokeLinecap="round"/>
              <path d="M354 430C395 412 430 379 440 335C399 340 367 374 354 430Z" fill="#B7C8B0" fillOpacity=".75" stroke="#789477" strokeWidth="1.5"/>
              <path d="M354 430C379 392 412 360 440 335" stroke="#789477" strokeWidth="1.2"/>
              <path d="M262 562C233 519 212 484 202 443" stroke="#607E62" strokeWidth="2" strokeLinecap="round"/>
              <path d="M202 443C157 429 124 397 113 355C157 362 190 394 202 443Z" fill="#B7C8B0" fillOpacity=".65" stroke="#789477" strokeWidth="1.5"/>
              <path d="M202 443C174 408 144 379 113 355" stroke="#789477" strokeWidth="1.2"/>
              <path d="M110 92C140 114 167 145 184 177" stroke="#789477" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between sm:bottom-9 sm:left-9 sm:right-9">
              <div className="rounded-2xl border border-white/70 bg-[#f8f7f2]/85 px-5 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-[9px] font-semibold uppercase tracking-[0.23em] text-[#789173]">Samary&apos;s</p>
                <p className="mt-1 font-serif text-2xl tracking-tight text-[#244b36]">Made with care.</p>
              </div>
              <span className="mb-1 rounded-full border border-white/70 bg-white/45 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-[#526b56] backdrop-blur-sm">Est. with intention</span>
            </div>
          </div>
          <div className="absolute -left-5 top-12 hidden h-20 w-20 items-center justify-center rounded-full border border-[#d6dfd2] bg-[#f8f7f2] text-center shadow-sm sm:flex">
            <span className="font-serif text-[11px] leading-4 text-[#607e62]">Care<br/>in every<br/>detail</span>
          </div>
        </div>
      </section>

      <section id="collection" className="scroll-mt-10 border-y border-[#e6e8df] bg-[#fffefa]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#789173]">01 / The collection</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.045em] text-[#203a2b] sm:text-5xl">A closer look.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-[#758078]">Take a moment to explore the products and the information currently available.</p></div>
            <a href={sellerContactUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#41684d] transition hover:text-[#203a2b]">Need help choosing? <span aria-hidden="true">↗</span></a>
          </div>
          {catalogue.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalogue.map((product, index) => (
                <article key={product.id} className="group">
                  <Link href={"/products/" + product.slug} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#e8ede4]">
                      {product.images[0] ? <img src={product.images[0].imageUrl} alt={product.images[0].altText} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"/> : <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_40%,#f8f7f2_0%,#e8ede4_62%,#dce5d8_100%)]"><span className="font-serif text-3xl text-[#66836c]">{product.name}</span></div>}
                      <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-[#f8f7f2]/85 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#526b56]">0{index + 1}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4 pt-5">
                      <div><h3 className="font-serif text-2xl tracking-tight text-[#203a2b]">{product.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#758078]">{product.shortDescription || "Explore product details and ordering information."}</p></div>
                      <span className="mt-1 text-lg text-[#789173] transition group-hover:translate-x-1">↗</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[#244b36]">{formatGhsFromPesewas(product.priceMinor)}</p>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[1.5rem] border border-dashed border-[#d9e1d6] bg-[#f8f9f5] px-6 py-16 text-center">
              <p className="font-serif text-2xl text-[#405447]">The collection is being prepared.</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#849087]">Product details will appear here as soon as they have been reviewed and approved for publication.</p>
            </div>
          )}
        </div>
      </section>

      <section id="approach" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-10 lg:py-28">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#789173]">02 / Our approach</p><h2 className="mt-4 font-serif text-4xl leading-[1.08] tracking-[-0.045em] sm:text-5xl">Clarity is part of the experience.</h2></div>
        <div className="grid gap-8 sm:grid-cols-2">
          <article className="border-t border-[#dfe4dc] pt-5"><p className="text-xs text-[#9aa69a]">01</p><h3 className="mt-5 font-serif text-2xl">Understand first</h3><p className="mt-3 text-sm leading-7 text-[#758078]">Read the available product information and ask questions whenever something is unclear.</p></article>
          <article className="border-t border-[#dfe4dc] pt-5"><p className="text-xs text-[#9aa69a]">02</p><h3 className="mt-5 font-serif text-2xl">Speak directly</h3><p className="mt-3 text-sm leading-7 text-[#758078]">Connect with the seller for current availability, delivery details and product enquiries.</p></article>
          <article className="border-t border-[#dfe4dc] pt-5"><p className="text-xs text-[#9aa69a]">03</p><h3 className="mt-5 font-serif text-2xl">No guesswork</h3><p className="mt-3 text-sm leading-7 text-[#758078]">We aim to keep published details clear and avoid promising what has not been verified.</p></article>
          <article className="border-t border-[#dfe4dc] pt-5"><p className="text-xs text-[#9aa69a]">04</p><h3 className="mt-5 font-serif text-2xl">Personal support</h3><p className="mt-3 text-sm leading-7 text-[#758078]">Get in touch with a real person when you need help with your order.</p></article>
        </div>
      </section>

      <footer id="contact" className="bg-[#203a2b] text-[#f8f7f2]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
          <div className="grid gap-10 sm:grid-cols-2 sm:items-end">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a9bea4]">A question on your mind?</p><h2 className="mt-4 max-w-md font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">We&apos;re just a message away.</h2></div>
            <div className="sm:justify-self-end"><a href={sellerContactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-5 rounded-full bg-[#f8f7f2] px-7 py-4 text-sm font-semibold text-[#244b36] transition hover:bg-white">Chat on WhatsApp <span aria-hidden="true">↗</span></a><p className="mt-4 text-xs text-[#b8c6b4]">+233 55 944 8932</p></div>
          </div>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-[#b8c6b4]"><span className="font-serif text-xl text-[#f8f7f2]">Samary&apos;s<span className="text-[#a9bea4]">.</span></span><Link href="/orders/track" className="text-xs text-[#d4dfd1] transition hover:text-white">Track an order</Link><Link href="/help" className="text-xs text-[#d4dfd1] transition hover:text-white">Help & FAQs</Link><Link href="/policies" className="text-xs text-[#d4dfd1] transition hover:text-white">Customer policies</Link><span>© {new Date().getFullYear()} Samary&apos;s. All rights reserved.</span><span>Product information is subject to seller verification.</span></div>
        </div>
      </footer>
    </main>
  );
}
