"use client";

import { useActionState } from "react";
import { updateProduct } from "./actions";

type ProductFormValue = {
  id: string; name: string; slug: string; shortDescription: string | null;
  description: string | null; priceMinor: number; stockQuantity: number | null; isActive: boolean;
};

export function EditProductForm({ product }: { product: ProductFormValue }) {
  const update = updateProduct.bind(null, product.id);
  const [state, action, pending] = useActionState(update, {});
  return <form action={action} className="space-y-5">
    <Field label="Product name" name="name" defaultValue={product.name} required />
    <Field label="URL slug" name="slug" defaultValue={product.slug} required />
    <Field label="Short description" name="shortDescription" defaultValue={product.shortDescription ?? ""} />
    <div><label htmlFor="description" className="mb-2 block text-sm font-medium">Full description</label><textarea id="description" name="description" rows={6} defaultValue={product.description ?? ""} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" /></div>
    <Field label="Price (GHS)" name="priceGhs" type="number" defaultValue={(product.priceMinor / 100).toFixed(2)} required />
    <Field label="Stock quantity (optional)" name="stockQuantity" type="number" defaultValue={product.stockQuantity === null ? "" : String(product.stockQuantity)} />
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="isActive" defaultChecked={product.isActive} className="h-4 w-4 accent-[#244b36]" /> Visible in the storefront</label>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{state.success}</p>}
    <button disabled={pending} className="w-full rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Saving..." : "Save changes"}</button>
  </form>;
}

function Field({ label, name, defaultValue, required, type = "text" }: { label: string; name: string; defaultValue?: string; required?: boolean; type?: string }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label><input id={name} name={name} type={type} defaultValue={defaultValue} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" /></div>;
}
