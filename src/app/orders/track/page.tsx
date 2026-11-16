import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { OrderTracker } from "@/features/orders/order-tracker";

export const metadata = {
  title: "Track your order",
  description: "Look up the latest status of your Samary's order.",
  alternates: { canonical: "/orders/track" },
};

export default function TrackOrderPage() {
  return <main className="min-h-screen bg-[#f8f7f2]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
      <Link href="/" className="text-sm font-medium text-[#66836c] hover:text-[#244b36]"><HugeiconsIcon icon={ArrowLeft01Icon} size={15} className="mr-1.5 inline" />Back to the collection</Link>
    </header>
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-10 lg:pt-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={Package01Icon} size={15} />Samary&apos;s · Order support</span></p>
        <h1 className="mt-4 font-serif text-5xl tracking-[-0.055em] text-[#203a2b] sm:text-6xl">A little clarity on what&apos;s next.</h1>
        <p className="mt-5 text-sm leading-7 text-[#758078]">Check the latest fulfilment and payment status of an order. You&apos;ll need the order reference and the phone number used at checkout.</p>
      </div>
      <OrderTracker />
    </section>
  </main>;
}
