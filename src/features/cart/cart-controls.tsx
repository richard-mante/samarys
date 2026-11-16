"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";

export function CartIndicator() {
  const { itemCount, ready } = useCart();
  return <Link href="/checkout" className="relative inline-flex items-center gap-2 rounded-full border border-[#d7ded4] px-4 py-2.5 text-xs font-semibold text-[#244b36] transition hover:bg-white sm:px-5 sm:text-sm" aria-label={ready ? `Order basket, ${itemCount} items` : "Order basket"}>
    <span>My order</span>
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#244b36] px-1.5 text-[10px] font-semibold text-white">{ready ? itemCount : "–"}</span>
  </Link>;
}

export function AddToCartButton({ productId, disabled = false }: { productId: string; disabled?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  return <button type="button" onClick={() => { addItem(productId); setAdded(true); }} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#244b36] px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#183a28] sm:w-fit">
    {added ? "Added to your order" : "Add to my order"} <span aria-hidden="true">{added ? "✓" : "＋"}</span>
  </button>;
}
