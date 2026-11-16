import Link from "next/link";
import { getStoreSettings } from "@/lib/settings";
import { createSellerWhatsAppUrl } from "@/lib/whatsapp";

export const metadata = {
  title: "Customer information & policies",
  description: "Important information about Samary's orders, delivery, payments and customer privacy.",
  alternates: { canonical: "/policies" },
};

export default async function PoliciesPage() {
  const settings = await getStoreSettings();
  const contactUrl = createSellerWhatsAppUrl("Hello Samary's, I have a question about your customer policies.", settings.sellerWhatsAppNumber);

  return <main className="min-h-screen bg-[#f8f7f2]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
      <Link href="/" className="text-sm font-medium text-[#66836c] hover:text-[#244b36]">Back to the collection</Link>
    </header>
    <section className="mx-auto max-w-4xl px-6 pb-24 pt-10 lg:px-10 lg:pt-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Customer information</p>
      <h1 className="mt-4 font-serif text-5xl tracking-[-0.055em] text-[#203a2b] sm:text-6xl">Clear information before you order.</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-[#758078]">These notes explain how the current Samary&apos;s website handles order requests and customer information. The seller should confirm and publish any additional business-specific terms before accepting live orders.</p>

      <div className="mt-12 space-y-10">
        <section className="border-t border-[#dfe5dc] pt-6">
          <h2 className="font-serif text-2xl text-[#203a2b]">Orders and payment</h2>
          <p className="mt-3 text-sm leading-7 text-[#758078]">Product prices are shown in Ghana cedis. A WhatsApp-assisted checkout saves an order request; it is not considered paid or confirmed until the seller confirms availability and records receipt of payment. Paystack orders are marked paid only after the payment is verified by the app.</p>
        </section>
        <section className="border-t border-[#dfe5dc] pt-6">
          <h2 className="font-serif text-2xl text-[#203a2b]">Availability and stock</h2>
          <p className="mt-3 text-sm leading-7 text-[#758078]">An unpaid order request does not reserve stock. The seller confirms product availability before payment. Finite stock quantities are updated when payment is verified or recorded by the seller.</p>
        </section>
        <section className="border-t border-[#dfe5dc] pt-6">
          <h2 className="font-serif text-2xl text-[#203a2b]">Delivery</h2>
          <p className="mt-3 text-sm leading-7 text-[#758078]">Delivery coverage, availability, fees and timing are confirmed directly by the seller. The product subtotal shown during checkout does not automatically include a delivery fee. Please confirm the complete amount and delivery arrangement before proceeding.</p>
        </section>
        <section className="border-t border-[#dfe5dc] pt-6">
          <h2 className="font-serif text-2xl text-[#203a2b]">Returns and refunds</h2>
          <p className="mt-3 text-sm leading-7 text-[#758078]">Contact the seller before returning an item or expecting a refund so the applicable terms for your order can be confirmed. This website does not automatically initiate Paystack refunds. The seller must review and process any approved refund through the relevant payment provider.</p>
        </section>
        <section className="border-t border-[#dfe5dc] pt-6">
          <h2 className="font-serif text-2xl text-[#203a2b]">Customer information and privacy</h2>
          <p className="mt-3 text-sm leading-7 text-[#758078]">When you place an order request, the website may collect your name, phone number, email address if supplied, delivery address and instructions, selected products and order reference. This information is used to create and manage your order, coordinate delivery and respond to support requests. Online payments are handled through Paystack; this website stores payment references and verification status rather than asking you to enter card PINs or security codes here.</p>
          <p className="mt-3 text-sm leading-7 text-[#758078]">Order and customer details are available to the seller through the protected administration dashboard for order handling and record keeping. Contact the seller if you need to ask about your information or request a correction.</p>
        </section>
        <section className="border-t border-[#dfe5dc] pt-6">
          <h2 className="font-serif text-2xl text-[#203a2b]">Product information</h2>
          <p className="mt-3 text-sm leading-7 text-[#758078]">Read the product description and the manufacturer's instructions on the packaging. Ask the seller if information is missing or unclear. Website content is not medical advice, and no unverified treatment or cure claim should be relied on when making a health decision.</p>
        </section>
      </div>

      <div className="mt-12 rounded-2xl border border-[#dce5d8] bg-white p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-[#203a2b]">Need clarification?</h2>
        <p className="mt-2 text-sm leading-6 text-[#758078]">Ask the seller to confirm delivery, return or refund terms for your specific order before proceeding.</p>
        <a href={contactUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28]">Contact the seller on WhatsApp ↗</a>
      </div>
      <p className="mt-8 text-xs leading-6 text-[#9aa49a]">These customer notes describe the current website flow and are not a substitute for the seller&apos;s final approved legal terms, privacy notice or regulatory disclosures.</p>
    </section>
  </main>;
}
