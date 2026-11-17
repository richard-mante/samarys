import { requireAdmin } from "@/lib/admin";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon, Store01Icon, LockKeyIcon, ShieldCheckIcon, Image01Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { getStoreSettings } from "@/lib/settings";
import { StoreSettingsForm } from "@/features/administration/store-settings-form";
import { ChangeAdminPasswordForm } from "@/features/administration/change-admin-password-form";
import { TaskDialog } from "@/components/ui/task-dialog";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();
  const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);

  return <div className="max-w-3xl">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Configuration</p>
    <h1 className="mt-2 font-serif text-4xl tracking-tight text-[#203a2b]"><span className="inline-flex items-center gap-3"><HugeiconsIcon icon={Settings01Icon} size={25} />Store settings</span></h1>
    <p className="mt-2 text-sm text-[#758078]">Choose a task to update store information or secure the administrator account.</p>

    <section className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Storefront details</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={Store01Icon} size={20} />Contact & customer policies</span></h2>
      <p className="mt-2 text-sm leading-6 text-[#758078]">Update the seller WhatsApp contact, delivery information, returns and privacy details shown to customers.</p>
      <TaskDialog
        title="Edit storefront details"
        description="Keep customer-facing contact and policy information accurate. Changes are recorded in the admin activity log."
        contentClassName="max-w-3xl"
        trigger={<button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183a28]"><HugeiconsIcon icon={Edit01Icon} size={16} />Edit storefront details</button>}
      >
        <StoreSettingsForm sellerWhatsAppNumber={settings.sellerWhatsAppNumber} deliveryPolicy={settings.deliveryPolicy} returnsPolicy={settings.returnsPolicy} privacyPolicy={settings.privacyPolicy} />
      </TaskDialog>
    </section>

    <section className="mt-5 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Account security</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={LockKeyIcon} size={20} />Administrator password</span></h2>
      <p className="mt-2 text-sm leading-6 text-[#758078]">Change the administrator password after signing in. Use a unique password with at least 12 characters.</p>
      <TaskDialog
        title="Change administrator password"
        description="Verify your current password, then choose and confirm a new password."
        trigger={<button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d9dfd5] px-5 py-3 text-sm font-semibold text-[#244b36] transition hover:bg-[#f5f7f3]"><HugeiconsIcon icon={LockKeyIcon} size={16} />Change password</button>}
      >
        <ChangeAdminPasswordForm />
      </TaskDialog>
    </section>

    <section className="mt-5 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#789173]">Launch safeguards</p>
      <h2 className="mt-2 font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={ShieldCheckIcon} size={20} />Before going live</span></h2>
      <p className="mt-3 text-sm leading-7 text-[#758078]">{settings.orderingEnabled ? "Customer order requests are enabled. Paystack checkout can be initiated when its server-side secret key is configured." : "Customer order requests and live Paystack checkout remain disabled until pricing, product documentation, applicable regulatory approvals and permitted advertising claims have been confirmed. Product enquiry remains available."}</p>
      <div className="mt-5 flex flex-wrap gap-2"><span className={"inline-flex rounded-full px-3 py-1.5 text-xs font-medium " + (settings.orderingEnabled ? "bg-[#edf3eb] text-[#41684d]" : "bg-amber-50 text-amber-800")}>Order requests {settings.orderingEnabled ? "enabled" : "disabled"}</span><span className={"inline-flex rounded-full px-3 py-1.5 text-xs font-medium " + (paystackConfigured ? "bg-[#edf3eb] text-[#41684d]" : "bg-amber-50 text-amber-800")}>Paystack secret key {paystackConfigured ? "configured" : "missing"}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf3eb] px-3 py-1.5 text-xs font-medium text-[#41684d]"><HugeiconsIcon icon={Image01Icon} size={14} />Base64 image storage</span></div>
      <p className="mt-4 text-xs leading-6 text-[#849087]">The order-request gate is controlled by the server-only ORDERS_ENABLED environment variable. Keep it false until all launch checks are complete. A configured Paystack secret key does not confirm webhook registration or successful live payment testing; verify those separately. Product images are optimised in the browser and stored in the application database.</p>
    </section>
  </div>;
}
