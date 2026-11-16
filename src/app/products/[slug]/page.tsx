import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { formatGhsFromPesewas } from "@/lib/money";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!product || !product.isActive) notFound();
  const message = "Hello Samary's, I would like to enquire about " + product.name + ". Please share the ordering details.";
  const whatsappUrl = createSellerWhatsAppUrl(message);

  return <main className="min-h-screen bg-[#f8f7f2]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"><a href="/" className="text-xl font-semibold">Samary&apos;s<span className="text-[#66836c]">.</span></a><a href="/" className="text-sm text-[#68766c]">Back to home</a></header>
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-2 lg:px-10 lg:py-20">
      <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] bg-[#e8ede4] p-10 text-center"><div className="rounded-2xl border border-white/70 bg-[#f9f8f1]/90 px-10 py-16"><p className="text-xs uppercase tracking-[0.24em] text-[#66836c]">Samary&apos;s</p><p className="mt-5 font-serif text-4xl text-[#244b36]">{product.name}</p><p className="mt-4 text-xs text-[#7b857c]">Product photography pending seller upload</p></div></div>
      <div className="flex flex-col justify-center"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#66836c]">Product details</p><h1 className="mt-4 font-serif text-5xl tracking-tight">{product.name}</h1>{product.shortDescription && <p className="mt-5 text-lg leading-8 text-[#68766c]">{product.shortDescription}</p>}<p className="mt-7 text-2xl font-semibold">{formatGhsFromPesewas(product.priceMinor)}</p>{product.description && <div className="mt-8 whitespace-pre-wrap text-sm leading-8 text-[#58665c]">{product.description}</div>}<a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-10 inline-flex w-fit rounded-full bg-[#244b36] px-8 py-4 text-sm font-semibold text-white">Enquire on WhatsApp</a><p className="mt-4 text-xs leading-6 text-[#849087]">Contact the seller to confirm availability and ordering details. Product information is subject to seller verification.</p></div>
    </section>
  </main>;
}
