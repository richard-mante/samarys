"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon, Package01Icon, ShoppingBag01Icon, UserGroupIcon,
  CreditCardIcon, Activity01Icon, Settings01Icon,
  Store01Icon, Logout01Icon, Archive01Icon,
} from "@hugeicons/core-free-icons";

const links = [
  { href: "/admin", label: "Overview", icon: Home01Icon },
  { href: "/admin/products", label: "Products", icon: Package01Icon },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag01Icon },
  { href: "/admin/customers", label: "Customers", icon: UserGroupIcon },
];

const secondaryLinks = [
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon },
  { href: "/admin/activity", label: "Activity log", icon: Activity01Icon },
  { href: "/admin/settings", label: "Settings", icon: Settings01Icon },
];

function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(href + "/");
}

export function AdminNavigation({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const pathname = usePathname();
  const moreActive = secondaryLinks.some((link) => isActive(pathname, link.href));

  if (mobileOnly) {
    return (
      <nav aria-label="Mobile seller navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4e8e1] bg-white/95 px-2 pt-2 shadow-[0_-8px_30px_rgba(32,58,43,0.06)] backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                className={"flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-medium leading-none transition " + (active ? "bg-[#edf3eb] text-[#244b36]" : "text-[#78847a] hover:bg-[#f5f7f3]")}>
                <HugeiconsIcon icon={link.icon} size={20} strokeWidth={1.8} aria-hidden="true" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
          <details className="group relative">
            <summary aria-label="More navigation options" className={"flex h-full min-h-[52px] cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-medium leading-none transition [&::-webkit-details-marker]:hidden " + (moreActive ? "bg-[#edf3eb] text-[#244b36]" : "text-[#78847a] hover:bg-[#f5f7f3]")}>
              <HugeiconsIcon icon={Archive01Icon} size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>More</span>
            </summary>
            <div className="absolute bottom-[calc(100%+0.75rem)] right-0 w-56 overflow-hidden rounded-2xl border border-[#e4e8e1] bg-white p-2 shadow-[0_16px_48px_rgba(32,58,43,0.16)]">
              {secondaryLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
                    className={"flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium " + (active ? "bg-[#edf3eb] text-[#244b36]" : "text-[#526157] hover:bg-[#f5f7f3]")}>
                    <HugeiconsIcon icon={link.icon} size={18} aria-hidden="true" />{link.label}
                  </Link>
                );
              })}
              <div className="my-1 border-t border-[#edf0ea]" />
              <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#526157] hover:bg-[#f5f7f3]"><HugeiconsIcon icon={Store01Icon} size={18} />View storefront</Link>
              <Link href="/admin/logout" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#9b665d] hover:bg-[#fbf2ef]"><HugeiconsIcon icon={Logout01Icon} size={18} />Sign out</Link>
            </div>
          </details>
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label="Seller navigation" className="flex flex-col gap-1">
      {[...links, ...secondaryLinks].map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
            className={"group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition " + (active ? "bg-[#edf3eb] text-[#244b36]" : "text-[#718075] hover:bg-[#f5f7f3] hover:text-[#304236]")}>
            <HugeiconsIcon icon={link.icon} size={19} strokeWidth={1.7} aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
