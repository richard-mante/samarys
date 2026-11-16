"use client";

import { useActionState } from "react";
import { addProductImage, removeProductImage } from "./actions";

type ProductImage = { id: string; imageUrl: string; altText: string };

export function ProductGalleryManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const addImage = addProductImage.bind(null, productId);
  const [state, action, pending] = useActionState(addImage, {});

  return (
    <section className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66836c]">Visual identity</p>
          <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Product gallery</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#758078]">Add approved product photography using a public image URL. Images appear on the customer-facing product page.</p>
        </div>
        <span className="rounded-full bg-[#f1f4ef] px-3 py-1.5 text-xs font-medium text-[#526b56]">{images.length} {images.length === 1 ? "image" : "images"}</span>
      </div>

      {images.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-xl border border-[#e8ece6]">
              <div className="aspect-[4/3] bg-[#f1f3ee]">
                <img src={image.imageUrl} alt={image.altText} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="min-w-0 truncate text-xs text-[#68766c]">{image.altText}</p>
                <form action={removeProductImage.bind(null, image.id, productId)}>
                  <button type="submit" className="shrink-0 text-xs font-medium text-[#9b5148] hover:underline">Remove</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-[#d9e1d6] bg-[#fafbf8] px-5 py-9 text-center">
          <p className="font-medium text-[#405447]">Your gallery is waiting for its first image</p>
          <p className="mt-2 text-sm text-[#849087]">Use real product photography supplied and approved by the seller.</p>
        </div>
      )}

      <form action={action} className="mt-6 grid gap-4 border-t border-[#edf0ea] pt-6">
        <div>
          <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-[#304236]">Image URL</label>
          <input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/product-photo.jpg" required className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none transition focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
        </div>
        <div>
          <label htmlFor="altText" className="mb-2 block text-sm font-medium text-[#304236]">Image description</label>
          <input id="altText" name="altText" placeholder="Samary's product bottle on a neutral background" required minLength={4} maxLength={240} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none transition focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
        </div>
        {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        {state.success && <p role="status" className="rounded-xl bg-[#eef5ed] p-3 text-sm text-[#315b3b]">{state.success}</p>}
        <button disabled={pending} className="w-full rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:opacity-60 sm:w-fit">{pending ? "Adding image…" : "Add to gallery"}</button>
      </form>
    </section>
  );
}
