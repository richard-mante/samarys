import { requireAdmin } from "@/lib/admin";

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <div className="max-w-3xl">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Configuration</p>
    <h1 className="mt-2 font-serif text-4xl">Store settings</h1>
    <p className="mt-2 text-sm text-[#758078]">Business details and checkout configuration.</p>
    <section className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6">
      <h2 className="font-semibold">Seller WhatsApp</h2>
      <p className="mt-2 text-sm text-[#758078]">Current contact number used by customer click-to-chat links.</p>
      <p className="mt-4 rounded-xl bg-[#f5f6f2] px-4 py-3 text-sm font-medium">+233 55 944 8932</p>
      <p className="mt-3 text-xs leading-6 text-[#849087]">The contact is currently configured through the server environment. Editable settings will be connected to the database settings module in a subsequent pass.</p>
    </section>
    <section className="mt-5 rounded-2xl border border-[#e4e8e1] bg-white p-6">
      <h2 className="font-semibold">Launch controls</h2>
      <p className="mt-2 text-sm leading-6 text-[#758078]">Live sales and public product claims remain gated until the seller confirms pricing, product documentation and applicable regulatory approvals.</p>
      <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">Launch verification required</span>
    </section>
  </div>;
}
