import Link from "next/link";
import { AdminNavigation } from "@/features/administration/admin-navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f2] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-[#e4e8e1] bg-white px-5 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
        <div className="flex items-center justify-between gap-4 lg:block">
          <div>
            <Link href="/" className="font-serif text-[26px] tracking-[-0.04em] text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#9aa49a]">Seller workspace</p>
          </div>
          <Link href="/" className="rounded-full border border-[#e2e8df] px-3.5 py-2 text-[11px] font-semibold text-[#526b56] transition hover:bg-[#f5f7f3] lg:hidden">View store ↗</Link>
        </div>

        <div className="mt-6 border-t border-[#edf0ea] pt-5 lg:mt-10 lg:border-0 lg:pt-0">
          <p className="mb-3 hidden px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a0aaa0] lg:block">Workspace</p>
          <AdminNavigation />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf0ea] pt-4 lg:mt-auto lg:block lg:pt-6">
          <div className="hidden rounded-xl bg-[#f6f8f4] p-3 lg:block">
            <p className="text-xs font-semibold text-[#405447]">Samary&apos;s store</p>
            <p className="mt-1 text-[10px] leading-5 text-[#849087]">Manage products, customers and orders.</p>
          </div>
          <div className="flex items-center gap-4 lg:mt-5 lg:justify-between">
            <Link href="/" className="hidden text-xs font-medium text-[#78847a] transition hover:text-[#244b36] lg:inline">View storefront ↗</Link>
            <Link href="/admin/logout" className="text-xs font-semibold text-[#9b665d] transition hover:text-[#8c4036]">Sign out</Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 hidden border-b border-[#e4e8e1]/80 bg-[#f8f9f6]/90 px-6 py-4 backdrop-blur-xl lg:block lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-xs text-[#849087]">Administration <span className="mx-2 text-[#c4cdc1]">/</span> <span className="font-medium text-[#526157]">Your business, in focus.</span></p>
            <Link href="/" className="text-xs font-semibold text-[#526b56] transition hover:text-[#203a2b]">View storefront ↗</Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
