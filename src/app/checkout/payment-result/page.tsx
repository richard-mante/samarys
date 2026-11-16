import Link from "next/link";

export const metadata = { title: "Payment status" };

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string; reference?: string }> }) {
  const params = await searchParams;
  const success = params.status === "success";
  const failed = params.status === "failed";
  return <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-6 py-16">
    <section className="w-full max-w-xl rounded-[1.75rem] border border-[#dce5d8] bg-white p-8 text-center shadow-[0_20px_60px_rgba(37,65,45,0.06)] sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4eb] text-2xl text-[#41684d]" aria-hidden="true">{success ? "✓" : failed ? "!" : "…"}</span>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Samary&apos;s · Payment</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#203a2b]">{success ? "Payment confirmed." : failed ? "Payment not confirmed." : "Payment status unavailable."}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#758078]">{success ? "Paystack has verified your payment and your order is confirmed. Keep your reference for any follow-up." : "We could not confirm a successful payment for this reference. If money was deducted, please contact the seller before trying again."}</p>
      {params.reference && <p className="mt-6 rounded-xl bg-[#f5f7f3] px-4 py-3 text-sm font-semibold text-[#405447]">Reference: {params.reference}</p>}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/" className="rounded-full bg-[#244b36] px-7 py-3.5 text-sm font-semibold text-white">Return to the collection</Link><Link href="/checkout" className="rounded-full border border-[#dce5d8] px-7 py-3.5 text-sm font-semibold text-[#405447]">Back to checkout</Link></div>
    </section>
  </main>;
}
