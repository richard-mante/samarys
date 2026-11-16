"use client";

import { useActionState } from "react";
import { updateStoreSettings } from "./settings-actions";

export function StoreSettingsForm({ sellerWhatsAppNumber }: { sellerWhatsAppNumber: string }) {
  const [state, action, pending] = useActionState(updateStoreSettings, {});
  return <form action={action} className="mt-6 space-y-5">
    <div>
      <label htmlFor="sellerWhatsAppNumber" className="mb-2 block text-sm font-medium text-[#304236]">Seller WhatsApp number</label>
      <input id="sellerWhatsAppNumber" name="sellerWhatsAppNumber" type="tel" defaultValue={sellerWhatsAppNumber} required minLength={7} maxLength={32} placeholder="+233 55 944 8932" className="w-full rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]"/>
      <p className="mt-2 text-xs leading-5 text-[#849087]">Use an international number or a Ghanaian 10-digit number. Customer enquiry and order links use this contact.</p>
    </div>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-[#eef5ed] p-3 text-sm text-[#315b3b]">{state.success}</p>}
    <button disabled={pending} className="rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:opacity-60">{pending ? "Saving…" : "Save settings"}</button>
  </form>;
}
