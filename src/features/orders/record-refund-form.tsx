"use client";

import { useActionState } from "react";
import { recordOrderRefund } from "./actions";

export function RecordRefundForm({ orderId, channel }: { orderId: string; channel: "PAYSTACK" | "WHATSAPP" }) {
  const actionWithOrder = recordOrderRefund.bind(null, orderId);
  const [state, action, pending] = useActionState(actionWithOrder, {});
  return <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-7">
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800">Payment reconciliation</p>
    <h2 className="mt-2 font-serif text-2xl text-amber-950">Record a completed refund</h2>
    <p className="mt-2 text-sm leading-6 text-amber-900">First complete the refund outside this app{channel === "PAYSTACK" ? " in the Paystack Dashboard" : " with the customer"} for the full order amount. Then record it here so the order and finance reports reflect the refund. This form does not transfer money. If a returned product is accepted back into stock, inspect it and update its stock quantity separately.</p>
    <form action={action} className="mt-5 space-y-4">
      <div><label htmlFor="refundReference" className="mb-2 block text-sm font-medium text-amber-950">{channel === "PAYSTACK" ? "Paystack refund reference" : "Transfer or refund reference"} <span className="font-normal text-amber-800">(optional)</span></label><input id="refundReference" name="refundReference" maxLength={120} className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"/></div>
      <div><label htmlFor="refundReason" className="mb-2 block text-sm font-medium text-amber-950">Reason / reconciliation note</label><textarea id="refundReason" name="reason" required minLength={4} maxLength={500} rows={3} className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500"/></div>
      <label className="flex items-start gap-3 text-xs leading-5 text-amber-950"><input type="checkbox" name="confirmRefund" value="on" required className="mt-0.5 h-4 w-4 accent-amber-800"/><span>I confirm the full refund has already been completed outside this app.</span></label>
      {state.error && <p role="alert" className="rounded-xl bg-white p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl bg-white p-3 text-sm text-[#315b3b]">{state.success}</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-amber-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-950 disabled:opacity-60">{pending ? "Recording refund…" : "Record completed refund"}</button>
    </form>
  </section>;
}
