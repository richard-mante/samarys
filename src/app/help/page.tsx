import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";
import { AppIcon } from "@/components/ui/app-icon";

export const metadata = {
  title: "Help & frequently asked questions",
  description: "Find answers about ordering, payment, delivery and tracking a Samary's order.",
  alternates: { canonical: "/help" },
};

export default async function HelpPage() {
  const settings = await getStoreSettings();
  const contactUrl = createSellerWhatsAppUrl("Hello Samary's, I need help with an order or product enquiry.", settings.sellerWhatsAppNumber);
  const faqs = [
    {
      question: "How do I place an order?",
      answer: settings.orderingEnabled
        ? "Add available products to your basket and continue to checkout. You can pay through Paystack or send a WhatsApp-assisted order request to the seller."
        : "Customer ordering is temporarily closed while the seller completes product and delivery checks. You can still contact the seller with product questions.",
    },
    {
      question: "When is a WhatsApp order confirmed?",
      answer: "A WhatsApp checkout creates an order request, not a completed or paid order. The seller must confirm availability and delivery cost with you before you arrange payment.",
    },
    {
      question: "How do I know whether my Paystack payment went through?",
      answer: "The app checks payment status with Paystack on the server. A return from the payment page alone is not proof of payment. If money was deducted but the status is not confirmed, contact the seller and share your order reference.",
    },
    {
      question: "How can I track my order?",
      answer: "Use the Track order page with the order reference shown after checkout and the same phone number you supplied when placing the order.",
      link: true,
    },
    {
      question: "Is stock reserved while I am arranging payment?",
      answer: "A Paystack checkout temporarily reserves finite stock for 30 minutes while payment is pending. A WhatsApp order request does not reserve stock; the seller confirms availability before recording payment. Finite stock is updated when payment is verified or recorded.",
    },
    {
      question: "How long is stock held during Paystack checkout?",
      answer: "The reservation lasts 30 minutes. If payment completes after the reservation expires and the product is no longer available, the order may be cancelled and the seller will review the payment and refund.",
    },
    {
      question: "How much is delivery and where do you deliver?",
      answer: settings.deliveryPolicy,
    },
    {
      question: "Where can I find product information?",
      answer: "Review the product page and the information on the product's own packaging. Contact the seller if you need clarification. The website does not provide medical advice or make unverified treatment promises.",
    },
    {
      question: "What if payment went through after my order was cancelled?",
      answer: "Contact the seller immediately and share your order reference. The app records the payment, but a refund must be reviewed and processed separately by the seller through Paystack.",
    },
    {
      question: "What if I need to return an item or request a refund?",
      answer: settings.returnsPolicy,
    },
  ];

  return <main className="min-h-screen bg-[#f8f7f2]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
      <Link href="/" aria-label="Back to home" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#66836c] hover:text-[#244b36]"><AppIcon name="back" size={17} /><span className="hidden sm:inline">Home</span></Link>
    </header>
    <section className="mx-auto max-w-4xl px-6 pb-24 pt-10 lg:px-10 lg:pt-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]"><span className="inline-flex items-center gap-2"><AppIcon name="support" size={15} />Customer care · Samary&apos;s</span></p>
      <h1 className="mt-4 font-serif text-5xl tracking-[-0.055em] text-[#203a2b] sm:text-6xl">A little help, when you need it.</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-[#758078]">Find practical answers about checkout, payment, delivery and order updates. If something is still unclear, speak directly with the seller.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/orders/track" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28]"><AppIcon name="orders" size={16} />Track order</Link>
        <a href={contactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#cbd8c7] bg-white px-6 py-3.5 text-sm font-semibold text-[#41684d] transition hover:bg-[#f8faf6]"><AppIcon name="whatsapp" size={17} />Contact the seller <AppIcon name="external" size={14} /></a>
      </div>
      <div className="mt-12 divide-y divide-[#e3e8df] border-y border-[#e3e8df]">
        {faqs.map((faq, index) => <article key={faq.question} className="py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aa69a]">0{index + 1}</p>
          <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">{faq.question}</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-[#758078]">{faq.answer}</p>
          {"link" in faq && faq.link && <Link href="/orders/track" className="mt-3 inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[#41684d] hover:underline">Track order <AppIcon name="external" size={14} /></Link>}
        </article>)}
      </div>
      <p className="mt-8 text-xs leading-6 text-[#849087]">For order-specific help, include your order reference when contacting the seller. Do not send payment PINs, passwords or card security codes.</p>
    </section>
  </main>;
}
