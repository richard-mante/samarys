"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon, ImageAdd01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImagePicker } from "./product-image-picker";
import { removeProductImage } from "./actions";
import { saveUploadedProductImage } from "./image-upload-actions";

type ProductImage = { id: string; imageUrl: string; altText: string };

export function ProductGalleryManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState("");

  async function addImage(formData: FormData) {
    const imageData = String(formData.get("imageData") ?? "");
    const altText = String(formData.get("imageAltText") ?? "");
    if (!imageData) { setUploadError("Choose a product image first."); return; }
    setUploadError("");
    const result = await saveUploadedProductImage(productId, imageData, altText);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66836c]">Product media</p>
          <h2 className="mt-2 font-serif text-2xl text-[#203a2b]"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={Image01Icon} size={20} />Product images</span></h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#758078]">Upload clear product photography. Images are optimised and stored directly with this product.</p>
        </div>
        <span className="rounded-full bg-[#f1f4ef] px-3 py-1.5 text-xs font-medium text-[#526b56]">{images.length} {images.length === 1 ? "image" : "images"}</span>
      </div>

      {images.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-xl border border-[#e8ece6]">
              <div className="aspect-[4/3] bg-[#f1f3ee]"><img src={image.imageUrl} alt={image.altText} className="h-full w-full object-cover" /></div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="min-w-0 truncate text-xs text-[#68766c]">{image.altText}</p>
                <button type="button" onClick={() => startTransition(async () => { await removeProductImage(image.id, productId); router.refresh(); })} disabled={pending} className="shrink-0 text-xs font-medium text-[#9b5148] hover:underline disabled:opacity-50"><HugeiconsIcon icon={Cancel01Icon} size={14} className="mr-1 inline" />Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-[#d9e1d6] bg-[#fafbf8] px-5 py-9 text-center">
          <p className="font-medium text-[#405447]">No product images yet</p>
          <p className="mt-2 text-sm text-[#849087]">Add the product's approved photography below.</p>
        </div>
      )}

      <form action={(formData) => startTransition(() => { void addImage(formData); })} className="mt-6 border-t border-[#edf0ea] pt-6">
        <ProductImagePicker name="gallery-image" />
        {uploadError && <p role="alert" className="mt-3 text-sm text-red-700">{uploadError}</p>}
        <Button type="submit" disabled={pending} className="mt-4">{pending ? "Saving image…" : <><HugeiconsIcon icon={ImageAdd01Icon} size={17} className="mr-2 inline" />Add product image</>}</Button>
      </form>
    </section>
  );
}
