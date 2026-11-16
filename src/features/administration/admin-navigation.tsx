"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon, Package01Icon, ShoppingBag01Icon, UserGroupIcon,
  CreditCardIcon, Activity01Icon, Settings01Icon,
} from "@hugeicons/core-free-icons";

const links = [
  { href: "/admin", label: "Overview", short: "Home", icon: Home01Icon },
  { href: "/admin/products", label: "Products", short: "Products", icon: Package01Icon },
  { href: "/admin/orders", label: "Orders", short: "Orders", icon: ShoppingBag01Icon },
  { href: "/admin/customers", label: "Customers", short: "Customers", icon: UserGroupIcon },
  { href: "/admin/payments", label: "Payments", short: "Payments", icon: CreditCardIcon },
  { href: "/admin/activity", label: "Activity log", short: "Activity", icon: Activity01Icon },
  { href: "/admin/settings", label: "Settings", short: "Settings", icon: Settings01Icon },
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
            <HugeiconsIcon icon={link.icon} size={19} strokeWidth={1.7} aria-hidden="true" />
            <span className="lg:hidden">{link.short}</span>
            <span className="hidden lg:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
