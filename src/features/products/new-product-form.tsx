"use client";

import { useActionState } from "react";
import { createProduct } from "./actions";

const initialState = {};

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProduct, initialState);
  return <form action={action} className="space-y-5">
    <Field label="Product name" name="name" placeholder="Product name" required />
    <Field label="URL slug" name="slug" placeholder="product-name" required />
    <Field label="Short description" name="shortDescription" placeholder="A concise product introduction" />
    <div><label htmlFor="description" className="mb-2 block text-sm font-medium">Full description</label><textarea id="description" name="description" rows={5} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" /></div>
    <Field label="Price (GHS)" name="priceGhs" type="number" placeholder="0.00" required />
    <Field label="Stock quantity (optional)" name="stockQuantity" type="number" placeholder="Leave blank to not track stock" />
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="isActive" className="h-4 w-4 accent-[#244b36]" /> Make product visible in the storefront</label>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{state.success}</p>}
    <button disabled={pending} className="w-full rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Saving..." : "Save product"}</button>
  </form>;
}

function Field({ label, name, placeholder, required, type = "text" }: { label: string; name: string; placeholder?: string; required?: boolean; type?: string }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label><input id={name} name={name} type={type} placeholder={placeholder} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" /></div>;
}
