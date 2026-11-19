import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { CartIndicator } from "@/features/cart/cart-controls";
import { StorefrontFeatureRotation } from "@/features/storefront/feature-rotation";
import { getStoreSettings } from "@/lib/settings";
import { AppIcon } from "@/components/ui/app-icon";
import { StorefrontMobileMenu } from "@/features/storefront/mobile-menu";

export const metadata = {
  title: "Samary's Infection Set",
  description: "Explore Samary's Infection Set, review available product information and find current ordering options.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const settings = await getStoreSettings();
  const catalogue = await db.query.products.findMany({
    where: eq(products.isActive, true),
    with: { images: true },
    orderBy: [asc(products.createdAt)],
  });
  const featured = catalogue[0];
  const heroImage = featured?.images[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f4ed] text-[#203a2b]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_26%,rgba(203,218,193,0.68),transparent_42%),linear-gradient(135deg,#f7f6f0_0%,#eef1e8_100%)]" />
      <header className="animate-fade-in relative z-30 mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="animate-slide-left delay-200 font-display text-[27px] font-medium tracking-[-0.06em] text-[#203a2b] sm:text-3xl">
          Samary's<span className="text-[#789173]">.</span>
        </Link>
        <nav className="animate-fade-in delay-400 hidden items-center gap-7 text-sm font-medium text-[#405849] lg:flex xl:gap-10">
          <Link href="/#about" className="transition hover:text-[#829a7b]">About</Link>
          <Link href="/#products" className="transition hover:text-[#829a7b]">Catalogue</Link>
          <Link href="/help" className="transition hover:text-[#829a7b]">Customer care</Link>
          <Link href="/orders/track" className="transition hover:text-[#829a7b]">Track order</Link>
        </nav>
        <div className="animate-slide-right delay-300 flex items-center gap-2 sm:gap-3">
          <CartIndicator />
          <StorefrontMobileMenu />
        </div>
      </header>

      {featured ? (
        <>
          <section id="about" className="relative z-10 mx-auto flex min-h-[590px] max-w-[1600px] flex-col justify-center px-5 pb-8 pt-8 sm:min-h-[660px] sm:px-8 lg:min-h-[min(760px,78vh)] lg:px-10 lg:pb-20 lg:pt-10">
            <div className="relative z-10 max-w-[850px]">

              <h1 className="font-display text-[clamp(3.1rem,8vw,9.6rem)] font-normal leading-[0.88] tracking-[-0.075em] text-[#203a2b]">
                <span className="block whitespace-nowrap"><span className="word-clip"><span className="animate-word-reveal delay-300">A</span></span>{" "}<span className="word-clip"><span className="animate-word-reveal delay-400">closer</span></span>{" "}<span className="word-clip"><span className="animate-word-reveal delay-500 text-[#203a2b]/45">look</span></span></span>
                <span className="block whitespace-nowrap"><span className="word-clip"><span className="animate-word-reveal delay-600 text-[#203a2b]/45">at</span></span>{" "}<span className="word-clip"><span className="animate-word-reveal delay-700">Samary's</span></span></span>
                <span className="block whitespace-nowrap"><span className="word-clip"><span className="animate-word-reveal delay-800">Infection</span></span></span>
                <span className="block whitespace-nowrap"><span className="word-clip"><span className="animate-word-reveal delay-900">Set</span></span><span className="ml-3 inline-block h-[0.68em] w-[0.68em] translate-y-[0.06em] overflow-hidden rounded-full bg-[#dce5d8] align-middle shadow-[0_12px_35px_rgba(32,58,43,0.12)] sm:ml-5">
                  {heroImage ? <img src={heroImage.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center"><AppIcon name="product" size={30} /></span>}
                </span></span>
              </h1>
              <div className="animate-fade-up delay-600 mt-8 flex flex-col gap-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-8 lg:mt-[68px] lg:gap-12">
                <Link href={"/products/" + featured.slug} className="inline-flex h-14 w-full items-center justify-center gap-5 rounded-md bg-[#203a2b] px-8 text-base font-medium tracking-[-0.03em] text-white transition hover:-translate-y-0.5 hover:bg-[#31563e] sm:h-16 sm:w-[240px] sm:text-lg lg:h-[72px] lg:w-[290px]">
                  Explore our product <AppIcon name="external" size={19} />
                </Link>
                <p className="max-w-[310px] text-sm leading-[1.5] tracking-[-0.025em] text-[#68766c] sm:text-base lg:text-lg">
                  {featured.shortDescription || "Take a closer look at our product and find the details you need before ordering."}
                </p>
              </div>
            </div>

            <div className="animate-scale-in delay-800 relative z-0 -mx-[12%] -mb-28 mt-2 sm:-mx-[10%] sm:-mb-36 lg:hidden">
              {heroImage ? (
                <img src={heroImage.imageUrl} alt={heroImage.altText} className="mx-auto w-[118%] max-w-[900px] object-contain drop-shadow-[0_28px_35px_rgba(32,58,43,0.16)]" />
              ) : (
                <div className="mx-auto flex aspect-[5/3] w-[118%] max-w-[900px] items-center justify-center text-center font-display text-4xl text-[#66836c]">{featured.name}</div>
              )}
            </div>

            {heroImage ? (
              <div className="animate-scale-in delay-700 pointer-events-none absolute -bottom-[13%] -right-[18%] z-0 hidden w-[min(79vw,1120px)] lg:block xl:-right-[12%]">
                <img src={heroImage.imageUrl} alt="" className="w-full object-contain drop-shadow-[0_35px_45px_rgba(32,58,43,0.18)]" />
              </div>
            ) : null}
          </section>

          <section className="relative z-20 grid grid-cols-1 md:grid-cols-[2fr_1.1fr_2fr]">
            <div className="animate-fade-up delay-900 relative flex min-h-[245px] flex-col justify-between overflow-hidden bg-[#e8ece3] px-7 py-8 sm:px-10 sm:py-10 lg:min-h-[285px] lg:px-12">
              <div className="relative z-10 max-w-[360px]">
                <p className="font-display text-[27px] leading-[1.06] tracking-[-0.055em] text-[#203a2b] sm:text-[32px] lg:text-[38px]">Get to know our product before you choose.</p>
                <Link href={"/products/" + featured.slug} className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#36543f] underline decoration-[#9aaa95] underline-offset-4 transition hover:text-[#203a2b] lg:text-base">Product details <AppIcon name="external" size={15} /></Link>
              </div>
              {heroImage && <img src={heroImage.imageUrl} alt="" className="pointer-events-none absolute -bottom-10 -right-8 h-[76%] w-[48%] object-contain opacity-20 mix-blend-multiply" />}
            </div>

            <div className="animate-fade-up delay-1000 bg-[#fffefa] px-7 py-8 sm:px-9 sm:py-10 lg:px-8">
              <StorefrontFeatureRotation />
            </div>

            <div className="animate-fade-up delay-1100 flex min-h-[245px] items-center gap-5 bg-[#203a2b] px-7 py-8 text-white sm:px-10 sm:py-10 lg:gap-7 lg:px-10">
              <div className="flex h-[105px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 sm:h-[125px] sm:w-[155px] lg:h-[142px] lg:w-[180px]">
                {heroImage ? <img src={heroImage.imageUrl} alt={heroImage.altText} className="h-full w-full object-contain" /> : <AppIcon name="product" size={40} />}
              </div>
              <div>
                <p className="font-display text-2xl tracking-[-0.05em] sm:text-3xl lg:text-[35px]">Here to help.</p>
                <p className="mt-2 max-w-[220px] text-sm leading-5 text-white/65 sm:text-base lg:text-lg">Questions about our product or an order? We’re here to help.</p>
                <Link href="/help" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-white underline underline-offset-4 sm:text-sm">Customer care <AppIcon name="external" size={14} /></Link>
              </div>
            </div>
          </section>

          <section id="products" className="relative z-10 border-t border-[#e3e7dd] bg-[#f5f4ed]">
            <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
              <div className="grid gap-8 border-b border-[#dce2d7] pb-9 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-12">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#789173] sm:text-xs">
                    <span className="h-px w-7 bg-[#91a58b]" /> The Samary collection
                  </p>
                  <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,6.2rem)] leading-[0.94] tracking-[-0.075em] text-[#203a2b]">
                    A considered look<br className="hidden sm:block" /> at what we offer<span className="text-[#91a58b]">.</span>
                  </h2>
                </div>
                <div className="flex items-end justify-between gap-6 lg:max-w-[330px] lg:flex-col lg:items-start">
                  <p className="max-w-[300px] text-sm leading-7 text-[#68766c] sm:text-base">
                    Explore our collection and choose a product to see its details and ordering options.
                  </p>
                  <span className="shrink-0 pb-1 font-display text-3xl tracking-[-0.06em] text-[#9aaa95]">{String(catalogue.length).padStart(2, "0")} <span className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b897d]">items</span></span>
                </div>
              </div>

              <div className="mt-9 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
                {catalogue.map((product, index) => (
                  <Link key={product.id} href={"/products/" + product.slug} className="group">
                    <div className="relative aspect-[4/4.5] overflow-hidden rounded-[1.35rem] bg-[#e7ebe2]">
                      {product.images[0] ? (
                        <img src={product.images[0].imageUrl} alt={product.images[0].altText} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-8 text-center font-display text-3xl tracking-[-0.05em] text-[#66836c]">{product.name}</div>
                      )}
                      <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-[#fffefa]/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#405849] backdrop-blur-sm">
                        Collection · {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[#203a2b] text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <AppIcon name="external" size={19} />
                      </span>
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-4 border-b border-[#dce2d7] pb-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-[clamp(1.35rem,2vw,1.8rem)] leading-tight tracking-[-0.05em] text-[#203a2b] transition-colors group-hover:text-[#66836c]">{product.name}</h3>
                        {product.shortDescription && <p className="mt-2 line-clamp-2 max-w-sm text-xs leading-6 text-[#758078] sm:text-sm">{product.shortDescription}</p>}
                      </div>
                      <span className="shrink-0 pt-1 text-sm font-semibold tabular-nums text-[#36543f]">{formatGhsFromPesewas(product.priceMinor)}</span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#536b4e]">
                      View product <AppIcon name="next" size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="relative z-10 mx-auto flex min-h-[68vh] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Samary's</p>
          <h1 className="mt-4 font-display text-4xl tracking-[-0.055em] sm:text-6xl">We’re getting things ready.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#758078]">Our product details will be available here soon.</p>
          <Link href="/help" className="mt-8 inline-flex h-12 items-center gap-3 rounded-md bg-[#203a2b] px-6 text-sm font-medium text-white">Contact us <AppIcon name="external" size={16} /></Link>
        </section>
      )}

      <footer className="relative z-10 overflow-hidden bg-[#203a2b] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-44 h-[440px] w-[440px] rounded-full border border-white/[0.07] sm:h-[560px] sm:w-[560px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-28 h-[310px] w-[310px] rounded-full border border-white/[0.07] sm:h-[420px] sm:w-[420px]" />
        <div className="relative mx-auto max-w-[1600px] px-5 pb-7 pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pt-24">
          <div className="grid gap-12 border-b border-white/15 pb-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1fr] lg:gap-10 lg:pb-20">
            <div className="max-w-sm">
              <Link href="/" className="font-display text-4xl tracking-[-0.075em] sm:text-5xl">Samary's<span className="text-[#a9bd9e]">.</span></Link>
              <p className="mt-5 max-w-[310px] text-sm leading-7 text-white/60">
                A place to explore our collection, learn about our products and get help whenever you need it.
              </p>
              <Link href="/#products" className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/25 px-5 py-3 text-xs font-medium text-white transition hover:border-white/60 hover:bg-white/10">
                Explore the catalogue <AppIcon name="next" size={16} />
              </Link>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a9bd9e]">Explore</p>
              <ul className="mt-5 space-y-4 text-sm text-white/70">
                <li><Link href="/#about" className="transition hover:text-white">About Samary's</Link></li>
                <li><Link href="/#products" className="transition hover:text-white">Product catalogue</Link></li>
                <li><Link href="/help" className="transition hover:text-white">Help & FAQs</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a9bd9e]">Your orders</p>
              <ul className="mt-5 space-y-4 text-sm text-white/70">
                <li><Link href="/orders/track" className="transition hover:text-white">Track an order</Link></li>
                {settings.orderingEnabled && <li><Link href="/checkout" className="transition hover:text-white">Checkout</Link></li>}
                <li><Link href="/policies" className="transition hover:text-white">Store policies</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a9bd9e]">We're here to help</p>
              <p className="mt-5 max-w-[250px] text-sm leading-6 text-white/60">Need help with a product or an order? Get in touch with us.</p>
              <Link href="/help" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white">
                Visit customer care <AppIcon name="external" size={15} />
              </Link>
              <a href={`https://wa.me/${settings.sellerWhatsAppNumber}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm text-white/65 transition hover:text-white">
                <AppIcon name="whatsapp" size={17} /> Chat with us on WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Samary's. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/policies" className="transition hover:text-white/80">Privacy & returns</Link>
              <Link href="/help" className="transition hover:text-white/80">Customer support</Link>
            </div>
            <p>Our products, your orders, and the help you need.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
