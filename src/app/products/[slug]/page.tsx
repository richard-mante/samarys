import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";
import { AddToCartButton, CartIndicator } from "@/features/cart/cart-controls";
import { getStoreSettings } from "@/lib/settings";
import { AppIcon } from "@/components/ui/app-icon";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await db.select({ name: products.name, shortDescription: products.shortDescription }).from(products)
    .where(eq(products.slug, slug)).limit(1);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription || "Product details and ordering information.",
    alternates: { canonical: "/products/" + slug },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!product || !product.isActive) notFound();

  const images = await db.select().from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
  const message = "Hello Samary's, I would like to enquire about " + product.name + ".";
  const settings = await getStoreSettings();
  const whatsappUrl = createSellerWhatsAppUrl(message, settings.sellerWhatsAppNumber);

  return (
    <main className="min-h-screen bg-[#f8f7f2]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
        <div className="flex items-center gap-3">{settings.orderingEnabled && <CartIndicator />}<Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#68766c] hover:text-[#244b36]"><HugeiconsIcon icon={ArrowLeft01Icon} size={15} /><AppIcon name="product" size={15} /> All products</Link></div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-9 px-5 pb-20 pt-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-10">
        <div>
          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {images.map((image, index) => (
                <div key={image.id} className={`overflow-hidden rounded-2xl bg-[#e9eee6] ${index === 0 ? "aspect-[4/5] sm:row-span-2" : "aspect-[4/3]"}`}>
                  <img src={image.imageUrl} alt={image.altText} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-[#e8ede4] p-8 text-center"><span className="font-serif text-4xl text-[#66836c]">{product.name}</span></div>
          )}
        </div>

        <div className="flex flex-col justify-center lg:py-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]"><AppIcon name="product" size={14} /> Product details</p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.06] tracking-[-0.04em] text-[#203a2b] sm:text-6xl">{product.name}</h1>
          <p className="mt-6 text-lg leading-8 text-[#68766c]">{product.shortDescription || "Explore the available product information, imagery and ordering details below."}</p>
          <div className="mt-8 border-y border-[#e1e6dd] py-6">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#819083]"><AppIcon name="wallet" size={14} /> Price</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[#244b36]">{formatGhsFromPesewas(product.priceMinor)}</p>
            <p className="mt-2 text-xs text-[#849087]">{product.stockQuantity === null ? "Contact the seller to confirm current availability." : product.stockQuantity <= 0 ? "Currently unavailable." : product.stockQuantity <= 5 ? "Limited availability." : "Available to order."}</p>
          </div>
          {product.description && <div className="mt-7 whitespace-pre-wrap text-sm leading-8 text-[#58665c]">{product.description}</div>}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {settings.orderingEnabled && <AddToCartButton productId={product.id} disabled={product.stockQuantity !== null && product.stockQuantity <= 0} />}
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full border border-[#d9dfd5] px-7 text-sm font-semibold text-[#244b36] transition hover:bg-white"><AppIcon name="whatsapp" size={17} /> Enquire about this product <AppIcon name="external" size={15} className="ml-1" /></a>
          </div>
        </div>
      </section>
      <footer className="border-t border-[#e3e8df] bg-[#fffefa]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 text-xs text-[#849087] sm:px-8">
          <Link href="/" className="font-serif text-lg text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
          <span>{product.name}</span>
        </div>
      </footer>
    </main>
  );
}
