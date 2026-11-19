import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { NewProductForm } from "@/features/products/new-product-form";
import { requireAdmin } from "@/lib/admin";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/products" aria-label="Back to products" className="mb-6 inline-flex items-center gap-2 text-sm text-[#66836c] transition hover:text-[#244b36]">
        <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
        <span className="hidden sm:inline">Products</span>
      </Link>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Catalogue</p>
      <h1 className="mt-2 font-serif text-4xl">
        <span className="inline-flex items-center gap-3">
          <HugeiconsIcon icon={Package01Icon} size={26} />
          Add a product
        </span>
      </h1>
      <p className="mt-2 text-sm text-[#758078]">Add the product information and images you have available. You can update the details as more verified information becomes available.</p>
      <div className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
        <NewProductForm />
      </div>
    </div>
  );
}
