"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", short: "Home" },
  { href: "/admin/products", label: "Products", short: "Products" },
  { href: "/admin/orders", label: "Orders", short: "Orders" },
  { href: "/admin/customers", label: "Customers", short: "Customers" },
  { href: "/admin/payments", label: "Payments", short: "Payments" },
  { href: "/admin/activity", label: "Activity log", short: "Activity" },
  { href: "/admin/settings", label: "Settings", short: "Settings" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seller navigation" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
      {links.map((link) => {
        const active = link.href === "/admin"
          ? pathname === "/admin"
          : pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={"group flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition " + (
              active
                ? "bg-[#edf3eb] text-[#244b36]"
                : "text-[#718075] hover:bg-[#f5f7f3] hover:text-[#304236]"
            )}
          >
            <span className={"h-1.5 w-1.5 rounded-full transition " + (active ? "bg-[#668b67]" : "bg-transparent group-hover:bg-[#c4d1bf]")} />
            <span className="lg:hidden">{link.short}</span>
            <span className="hidden lg:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
