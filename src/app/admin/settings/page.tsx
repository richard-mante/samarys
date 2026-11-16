import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/settings";
import { StoreSettingsForm } from "@/features/administration/store-settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return <div className="max-w-3xl">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Configuration</p>
    <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]">Store settings</h1>
    <p className="mt-2 text-sm text-[#758078]">Manage the contact customers use to ask questions and confirm order requests.</p>

    <section className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Customer support</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Seller contact</h2>
      <p className="mt-2 text-sm leading-6 text-[#758078]">This number is used by the storefront for product enquiries and WhatsApp-assisted order requests. Changes are recorded in the admin audit log.</p>
      <StoreSettingsForm sellerWhatsAppNumber={settings.sellerWhatsAppNumber} />
    </section>

    <section className="mt-5 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Launch safeguards</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Before going live</h2>
      <p className="mt-3 text-sm leading-7 text-[#758078]">{settings.orderingEnabled ? "WhatsApp order requests are enabled. Paystack checkout remains unavailable until its integration and credentials are configured." : "Customer order requests and live Paystack checkout remain disabled until pricing, product documentation, applicable regulatory approvals and permitted advertising claims have been confirmed. Product enquiry remains available."}</p>
      <div className="mt-5 flex flex-wrap gap-2"><span className={"inline-flex rounded-full px-3 py-1.5 text-xs font-medium " + (settings.orderingEnabled ? "bg-amber-50 text-amber-800" : "bg-[#edf3eb] text-[#41684d]")}>Order requests {settings.orderingEnabled ? "enabled" : "disabled"}</span><span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">Paystack checkout not configured</span></div>
      <p className="mt-4 text-xs leading-6 text-[#849087]">The order-request gate is controlled by the server-only ORDERS_ENABLED environment variable. Keep it false until all launch checks are complete.</p>
    </section>
  </div>;
}
