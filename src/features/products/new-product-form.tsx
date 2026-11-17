"use client";

import { useActionState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductImagePicker } from "./product-image-picker";
import { createProduct } from "./actions";

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProduct, {});
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2"><label htmlFor="name" className="text-sm font-medium text-[#304236]">Product name</label><Input id="name" name="name" placeholder="Enter product name" required maxLength={180} /></div>
      <div className="space-y-2"><label htmlFor="shortDescription" className="text-sm font-medium text-[#304236]">Short description</label><Input id="shortDescription" name="shortDescription" placeholder="A concise product introduction" maxLength={320} /></div>
      <div className="space-y-2"><label htmlFor="description" className="text-sm font-medium text-[#304236]">Product details</label><Textarea id="description" name="description" rows={5} placeholder="Add the product information you want customers to see." maxLength={12000} /></div>
      <div className="space-y-2"><label htmlFor="priceGhs" className="text-sm font-medium text-[#304236]">Price (GHS)</label><Input id="priceGhs" name="priceGhs" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00" required /></div>
      <div className="space-y-2"><label htmlFor="stockQuantity" className="text-sm font-medium text-[#304236]">Stock quantity <span className="font-normal text-[#849087]">(optional)</span></label><Input id="stockQuantity" name="stockQuantity" type="number" min="0" step="1" placeholder="Leave blank if stock is not tracked" /></div>
      <ProductImagePicker />
      <label className="flex items-center gap-3 text-sm text-[#405447]"><input type="checkbox" name="isActive" className="h-4 w-4 accent-[#244b36]" /> Show this product in the storefront</label>
      {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="rounded-xl border border-[#d6e4d2] bg-[#f1f6ef] p-3 text-sm text-[#315b3b]">{state.success}</p>}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Saving product…" : <><HugeiconsIcon icon={Add01Icon} size={17} className="mr-2 inline" />Save product</>}</Button>
    </form>
  );
}
