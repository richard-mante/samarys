"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function StorefrontMobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="storefront-mobile-navigation"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] rounded-full border border-[#d7ded4] text-[#36543f] transition hover:bg-white lg:hidden"
      >
        {open ? <span className="text-2xl leading-none" aria-hidden="true">×</span> : <span className="flex flex-col gap-[5px]" aria-hidden="true"><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /></span>}
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          id="storefront-mobile-navigation"
          className="fixed inset-0 z-[100] flex h-[100dvh] min-h-[100svh] flex-col items-center justify-center overflow-y-auto bg-[#17271d] px-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5rem,env(safe-area-inset-top))] text-center text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Storefront navigation"
        >
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu" className="absolute right-6 top-[max(1.5rem,env(safe-area-inset-top))] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-3xl leading-none text-white">×</button>
          <nav className="flex flex-col items-center gap-7 font-display text-3xl tracking-[-0.04em] text-white">
            <Link href="/#about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/#products" onClick={() => setOpen(false)}>Product</Link>
            <Link href="/help" onClick={() => setOpen(false)}>Customer care</Link>
            <Link href="/orders/track" onClick={() => setOpen(false)}>Track order</Link>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
