import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { payments } from "@/db/schema";

export const metadata = { title: "Payment status" };

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ status?: string; reference?: string }> }) {
  const params = await searchParams;
  const reference = params.reference?.trim();
  const payment = reference ? await db.query.payments.findFirst({
    where: eq(payments.providerReference, reference),
    columns: { status: true, orderId: true },
  }) : null;
  const success = payment?.status === "PAID";
  const failed = params.status === "failed" || payment?.status === "FAILED";
  return <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-6 py-16">
    <section className="w-full max-w-xl rounded-[1.75rem] border border-[#dce5d8] bg-white p-8 text-center shadow-[0_20px_60px_rgba(37,65,45,0.06)] sm:p-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf4eb] text-2xl text-[#41684d]" aria-hidden="true">{success ? "✓" : failed ? "!" : "…"}</span>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Samary&apos;s · Payment</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#203a2b]">{success ? "Payment confirmed." : failed ? "Payment not confirmed." : "Payment is being checked."}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#758078]">{success ? "Your payment has been verified and your order is confirmed. Keep your reference for any follow-up." : failed ? "We could not confirm a successful payment for this reference. If money was deducted, please contact the seller before trying again." : "We have not received final confirmation yet. Please allow a moment, then contact the seller if your payment was deducted."}</p>
      {reference && <p className="mt-6 rounded-xl bg-[#f5f7f3] px-4 py-3 text-sm font-semibold text-[#405447]">Reference: {reference}</p>}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/" className="rounded-full bg-[#244b36] px-7 py-3.5 text-sm font-semibold text-white">Return to the collection</Link><Link href="/checkout" className="rounded-full border border-[#dce5d8] px-7 py-3.5 text-sm font-semibold text-[#405447]">Back to checkout</Link></div>
    </section>
  </main>;
}
