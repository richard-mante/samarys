"use client";

import { useActionState } from "react";
import { recordWhatsAppPayment } from "./actions";

const fieldClass = "w-full rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]";

export function RecordWhatsAppPaymentForm({ orderId, subtotalGhs }: { orderId: string; subtotalGhs: string }) {
  const actionForOrder = recordWhatsAppPayment.bind(null, orderId);
  const [state, action, pending] = useActionState(actionForOrder, {});

  return <form action={action} className="mt-5 space-y-4 rounded-xl border border-[#dce5d8] bg-[#f8faf6] p-4">
    <div><p className="text-sm font-semibold text-[#304236]">Record payment received</p><p className="mt-1 text-xs leading-5 text-[#758078]">Only use this after you have personally confirmed receipt of the customer&apos;s payment.</p></div>
    <div><label htmlFor="deliveryFeeGhs" className="mb-2 block text-xs font-medium text-[#526157]">Agreed delivery fee (GHS)</label><input id="deliveryFeeGhs" name="deliveryFeeGhs" type="number" min="0" max="1000000" step="0.01" defaultValue="0" required className={fieldClass}/></div>
    <div><label htmlFor="amountReceivedGhs" className="mb-2 block text-xs font-medium text-[#526157]">Total amount received (GHS)</label><input id="amountReceivedGhs" name="amountReceivedGhs" type="number" min="0.01" max="1000000" step="0.01" defaultValue={subtotalGhs} required className={fieldClass}/></div>
    <div><label htmlFor="method" className="mb-2 block text-xs font-medium text-[#526157]">Payment method</label><select id="method" name="method" required className={fieldClass}><option value="MOBILE_MONEY">Mobile Money</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option></select></div>
    <div><label htmlFor="paymentReference" className="mb-2 block text-xs font-medium text-[#526157]">Payment reference <span className="font-normal text-[#9aa49a]">(optional)</span></label><input id="paymentReference" name="paymentReference" maxLength={180} className={fieldClass} placeholder="Transaction ID or receipt number"/></div>
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-lg bg-[#eaf3e7] p-3 text-xs text-[#315b3b]">{state.success}</p>}
    <button disabled={pending} className="w-full rounded-full bg-[#244b36] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#183a28] disabled:opacity-60">{pending ? "Recording…" : "Confirm payment received"}</button>
  </form>;
}
