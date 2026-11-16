import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";
import { AddToCartButton, CartIndicator } from "@/features/cart/cart-controls";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!product || !product.isActive) notFound();

  const images = await db.select().from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
  const message = "Hello Samary's, I would like to enquire about " + product.name + ". Please share the ordering details.";
  const whatsappUrl = createSellerWhatsAppUrl(message);

  return (
    <main className="min-h-screen bg-[#f8f7f2]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></a>
        <div className="flex items-center gap-2"><CartIndicator /><a href="/" className="hidden rounded-full border border-[#d9dfd5] px-5 py-2.5 text-sm font-medium text-[#405447] transition hover:bg-white sm:inline-flex">Back to collection</a></div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-10 lg:pt-12">
        <div>
          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {images.map((image, index) => (
                <div key={image.id} className={`overflow-hidden rounded-[1.5rem] bg-[#e9eee6] ${index === 0 ? "aspect-[4/5] sm:row-span-2" : "aspect-[4/3]"}`}>
                  <img src={image.imageUrl} alt={image.altText} className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#e8ede4] p-10 text-center">
              <div className="absolute -left-16 -top-10 h-64 w-64 rounded-full bg-[#d4e0d1]" />
              <div className="absolute -bottom-12 -right-12 h-72 w-72 rounded-full bg-[#d0ddcd]" />
              <div className="relative flex h-[78%] w-[72%] flex-col items-center justify-center rounded-[1.5rem] border border-white/70 bg-[#f9f8f1]/90 p-8 shadow-[0_30px_80px_rgba(37,65,45,0.10)]">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#66836c]">Samary&apos;s</span>
                <span className="mt-6 font-serif text-4xl leading-tight text-[#244b36]">{product.name}</span>
                <span className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[#7b857c]">Product photography pending</span>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs leading-6 text-[#849087]">Product photographs are supplied by the seller. Contact the seller if you need additional product information.</p>
        </div>

        <div className="flex flex-col justify-center lg:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#66836c]">Samary&apos;s · Product details</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.06] tracking-[-0.04em] text-[#203a2b] sm:text-6xl">{product.name}</h1>
          {product.shortDescription && <p className="mt-6 text-lg leading-8 text-[#68766c]">{product.shortDescription}</p>}
          <div className="mt-8 border-y border-[#e1e6dd] py-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#819083]">Price</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#244b36]">{formatGhsFromPesewas(product.priceMinor)}</p>
            <p className="mt-2 text-xs text-[#849087]">Confirm current availability and delivery details with the seller.</p>
          </div>
          {product.description && <div className="mt-8 whitespace-pre-wrap text-sm leading-8 text-[#58665c]">{product.description}</div>}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><AddToCartButton productId={product.id} disabled={product.stockQuantity !== null && product.stockQuantity <= 0} /><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-[#d9dfd5] px-8 py-4 text-sm font-semibold text-[#244b36] transition hover:bg-white sm:w-fit">Enquire on WhatsApp <span aria-hidden="true" className="ml-3">↗</span></a></div>
          <p className="mt-4 max-w-md text-xs leading-6 text-[#849087]">Product information is provided by the seller. Please confirm ingredients, directions, suitability and any safety questions directly with the seller before purchasing.</p>
        </div>
      </section>
    </main>
  );
}
