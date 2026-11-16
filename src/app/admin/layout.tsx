import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6f2] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#e4e8e1] bg-white px-5 py-5 lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link href="/" className="text-xl font-semibold tracking-tight">Samary&apos;s<span className="text-[#66836c]">.</span></Link>
        <p className="mt-1 text-xs text-[#849087]">Seller workspace</p>
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 rounded-xl px-3 py-2.5 text-sm text-[#526157] transition hover:bg-[#edf2eb] hover:text-[#244b36]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/admin/logout" className="mt-8 inline-block text-sm text-[#78847a] hover:text-[#244b36]">Sign out</Link>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-[#e4e8e1] bg-white/80 px-6 py-4 lg:px-10">
          <p className="text-sm text-[#68766c]">Samary&apos;s administration</p>
        </header>
        <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
