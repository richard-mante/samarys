import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon, Store01Icon } from "@hugeicons/core-free-icons";
import { AdminNavigation } from "@/features/administration/admin-navigation";

export const metadata = { title: "Seller workspace", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f2] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-[#e4e8e1] bg-white px-5 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
        <div className="lg:block">
          <div>
            <Link href="/" className="font-serif text-[26px] tracking-[-0.04em] text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#9aa49a]">Seller workspace</p>
          </div>
        </div>

        <div className="mt-6 hidden border-t border-[#edf0ea] pt-5 lg:mt-10 lg:block lg:border-0 lg:pt-0">
          <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a0aaa0]">Workspace</p>
          <AdminNavigation />
        </div>

        <div className="mt-auto hidden items-center justify-between border-t border-[#edf0ea] pt-5 lg:flex">
          <Link href="/" title="Open storefront" className="inline-flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium text-[#78847a] transition hover:bg-[#f5f7f3] hover:text-[#244b36]"><HugeiconsIcon icon={Store01Icon} size={18} /><span>Storefront</span></Link>
          <Link href="/admin/logout" aria-label="Sign out" title="Sign out" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#9b665d] transition hover:bg-[#fbf2ef] hover:text-[#8c4036]"><HugeiconsIcon icon={Logout01Icon} size={18} /></Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 hidden border-b border-[#e4e8e1]/80 bg-[#f8f9f6]/90 px-6 py-4 backdrop-blur-xl lg:block lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-xs text-[#849087]">Administration <span className="mx-2 text-[#c4cdc1]">/</span> <span className="font-medium text-[#526157]">Your business, in focus.</span></p>
            <span className="text-xs font-medium text-[#849087]">Seller workspace</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 pb-28 pt-7 sm:px-6 sm:pt-8 lg:px-10 lg:py-10">{children}</main>
      </div>
      <AdminNavigation mobileOnly />
    </div>
  );
}
