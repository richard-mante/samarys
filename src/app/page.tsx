import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { CartIndicator } from "@/features/cart/cart-controls";
import { getStoreSettings } from "@/lib/settings";

export const metadata = {
  title: "Samary's Infection Set",
  description: "Product details, images, price and ordering information for Samary's Infection Set.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const settings = await getStoreSettings();
  const catalogue = await db.query.products.findMany({
    where: eq(products.isActive, true),
    limit: 8,
    with: { images: true },
    orderBy: [asc(products.createdAt)],
  });
  const featured = catalogue[0];

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#203a2b]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
        <div className="flex items-center gap-3">
          <Link href="/orders/track" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#68766c] transition hover:text-[#244b36]"><HugeiconsIcon icon={Package01Icon} size={15} />Track order</Link>
          {settings.orderingEnabled && <CartIndicator />}
        </div>
      </header>

      {featured ? (
        <>
          <section className="mx-auto grid max-w-7xl items-center gap-9 px-5 pb-16 pt-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-10">
            <div className="order-2 lg:order-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">The product</p>
              <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[1.04] tracking-[-0.05em] sm:text-6xl lg:text-7xl">{featured.name}</h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#68766c]">{featured.shortDescription || "Explore the product, view its available details and check current ordering options."}</p>
              <p className="mt-7 text-2xl font-semibold tracking-tight text-[#244b36]">{formatGhsFromPesewas(featured.priceMinor)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={"/products/" + featured.slug} className="inline-flex h-12 items-center justify-center rounded-full bg-[#244b36] px-7 text-sm font-semibold text-white transition hover:bg-[#183a28]">View product details <span className="ml-3">↗</span></Link>
                {settings.orderingEnabled && <Link href="/checkout" className="inline-flex h-12 items-center justify-center rounded-full border border-[#d9dfd5] px-6 text-sm font-semibold text-[#244b36] transition hover:bg-white"><HugeiconsIcon icon={ShoppingCart01Icon} size={16} className="mr-2 inline" />Order now</Link>}
              </div>
            </div>
            <Link href={"/products/" + featured.slug} className="order-1 block overflow-hidden rounded-[1.75rem] bg-[#e8ede4] lg:order-2">
              <div className="aspect-[4/4.4]">
                {featured.images[0]
                  ? <img src={featured.images[0].imageUrl} alt={featured.images[0].altText} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_40%,#f8f7f2_0%,#e8ede4_62%,#dce5d8_100%)] p-8 text-center"><span className="font-serif text-4xl text-[#66836c]">{featured.name}</span></div>}
              </div>
            </Link>
          </section>

          {catalogue.length > 1 && (
            <section className="border-t border-[#e6e8df] bg-[#fffefa]">
              <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
                <h2 className="font-serif text-3xl tracking-tight text-[#203a2b]">More products</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {catalogue.slice(1).map((product) => (
                    <Link key={product.id} href={"/products/" + product.slug} className="group">
                      <div className="aspect-[4/4.5] overflow-hidden rounded-2xl bg-[#e8ede4]">
                        {product.images[0]
                          ? <img src={product.images[0].imageUrl} alt={product.images[0].altText} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                          : <div className="flex h-full items-center justify-center p-6 text-center font-serif text-2xl text-[#66836c]">{product.name}</div>}
                      </div>
                      <div className="mt-4 flex items-start justify-between gap-4"><h3 className="font-serif text-xl">{product.name}</h3><span className="text-sm font-semibold text-[#244b36]">{formatGhsFromPesewas(product.priceMinor)}</span></div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Samary&apos;s</p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">Product information is being prepared.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#758078]">The product will appear here once its details and images are ready.</p>
        </section>
      )}

      <footer className="border-t border-[#e6e8df] bg-[#fffefa]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-[#849087] sm:px-8">
          <span className="font-serif text-lg text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></span>
          <span>Product information supplied by the seller.</span>
        </div>
      </footer>
    </main>
  );
}
