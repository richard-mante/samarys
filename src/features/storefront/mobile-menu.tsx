"use client";

import { useState } from "react";
import Link from "next/link";

export function StorefrontMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-[#d7ded4] text-[#36543f] transition hover:bg-white lg:hidden"
      >
        {open ? <span className="text-2xl leading-none" aria-hidden="true">×</span> : <span className="flex flex-col gap-[5px]" aria-hidden="true"><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /></span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#17271d]/95 px-8 text-center text-white backdrop-blur-md lg:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu" className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-3xl leading-none">×</button>
          <nav className="flex flex-col items-center gap-7 font-display text-3xl tracking-[-0.04em]">
            <Link href="/#about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/#products" onClick={() => setOpen(false)}>Product</Link>
            <Link href="/help" onClick={() => setOpen(false)}>Customer care</Link>
            <Link href="/orders/track" onClick={() => setOpen(false)}>Track order</Link>
          </nav>
        </div>
      )}
    </>
  );
}
