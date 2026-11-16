"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProduct } from "./actions";

type ProductFormValue = {
  id: string; name: string; slug: string; shortDescription: string | null;
  description: string | null; priceMinor: number; stockQuantity: number | null; isActive: boolean;
};

export function EditProductForm({ product }: { product: ProductFormValue }) {
  const update = updateProduct.bind(null, product.id);
  const [state, action, pending] = useActionState(update, {});
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium text-[#304236]">Product name</label><Input id="name" name="name" defaultValue={product.name} required maxLength={180} /></div>
      <div className="space-y-2"><label htmlFor="shortDescription" className="text-sm font-medium text-[#304236]">Short description</label><Input id="shortDescription" name="shortDescription" defaultValue={product.shortDescription ?? ""} maxLength={320} /></div>
      <div className="space-y-2"><label htmlFor="description" className="text-sm font-medium text-[#304236]">Product details</label><Textarea id="description" name="description" rows={6} defaultValue={product.description ?? ""} maxLength={12000} /></div>
      <div className="space-y-2"><label htmlFor="priceGhs" className="text-sm font-medium text-[#304236]">Price (GHS)</label><Input id="priceGhs" name="priceGhs" type="number" defaultValue={(product.priceMinor / 100).toFixed(2)} required min="0.01" step="0.01" /></div>
      <div className="space-y-2"><label htmlFor="stockQuantity" className="text-sm font-medium text-[#304236]">Stock quantity <span className="font-normal text-[#849087]">(optional)</span></label><Input id="stockQuantity" name="stockQuantity" type="number" defaultValue={product.stockQuantity === null ? "" : String(product.stockQuantity)} min="0" step="1" /></div>
      <label className="flex items-center gap-3 text-sm text-[#405447]"><input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4 accent-[#244b36]" /> Show this product in the storefront</label>
      {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl border border-[#d6e4d2] bg-[#f1f6ef] p-3 text-sm text-[#315b3b]">{state.success}</p>}
      <p className="text-xs leading-5 text-[#849087]">The product URL is generated automatically from its name.</p>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving changes…" : "Save changes"}</Button>
    </form>
  );
}
