"use client";

import { useActionState, useRef, useState } from "react";
import { addProductImage, removeProductImage } from "./actions";
import { saveUploadedProductImage } from "./image-upload-actions";

type ProductImage = { id: string; imageUrl: string; altText: string };
type UploadSignature = { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };

export function ProductGalleryManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const addImage = addProductImage.bind(null, productId);
  const [state, action, pending] = useActionState(addImage, {});
  const fileRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploadError("Choose a product image first."); return; }
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) { setUploadError("Use a JPG, PNG, WebP or AVIF image."); return; }
    if (file.size > 8 * 1024 * 1024) { setUploadError("Choose an image smaller than 8 MB."); return; }
    if (altText.trim().length < 4) { setUploadError("Add a short image description."); return; }

    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/admin/products/images/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        cache: "no-store",
      });
      const signature = await signatureResponse.json() as UploadSignature & { error?: string };
      if (!signatureResponse.ok) throw new Error(signature.error || "Could not prepare a secure image upload.");

      const payload = new FormData();
      payload.append("file", file);
      payload.append("api_key", signature.apiKey);
      payload.append("timestamp", String(signature.timestamp));
      payload.append("folder", signature.folder);
      payload.append("signature", signature.signature);

      const cloudResponse = await fetch("https://api.cloudinary.com/v1_1/" + signature.cloudName + "/image/upload", {
        method: "POST",
        body: payload,
      });
      const uploaded = await cloudResponse.json() as { secure_url?: string; error?: { message?: string } };
      if (!cloudResponse.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message || "Cloudinary could not upload this image.");

      const saved = await saveUploadedProductImage(productId, uploaded.secure_url, altText.trim());
      if (saved.error) throw new Error(saved.error);
      if (fileRef.current) fileRef.current.value = "";
      setAltText("");
      window.location.reload();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#e4e8e1] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#66836c]">Visual identity</p>
          <h2 className="mt-2 font-serif text-2xl text-[#203a2b]">Product gallery</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#758078]">Upload approved product photography or add an image hosted elsewhere. Uploaded images are stored in Samary&apos;s Cloudinary media library.</p>
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

      <form onSubmit={uploadImage} className="mt-6 grid gap-4 border-t border-[#edf0ea] pt-6">
        <div>
          <p className="text-sm font-semibold text-[#304236]">Upload from your device</p>
          <p className="mt-1 text-xs leading-5 text-[#849087]">Image files up to 8 MB</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="mt-3 block w-full text-sm text-[#526157] file:mr-4 file:rounded-full file:border-0 file:bg-[#edf3eb] file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-[#315b3b] hover:file:bg-[#e2ecdf]" />
        </div>
        <div>
          <label htmlFor="uploadedAltText" className="mb-2 block text-sm font-medium text-[#304236]">Image description</label>
          <input id="uploadedAltText" value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe what the product photo shows" required minLength={4} maxLength={240} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
        </div>
        {uploadError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{uploadError}</p>}
        <button type="submit" disabled={uploading} className="w-full rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:opacity-60 sm:w-fit">{uploading ? "Uploading image…" : "Upload image"}</button>
      </form>

      <form action={action} className="mt-6 grid gap-4 border-t border-[#edf0ea] pt-6">
        <div>
          <p className="text-sm font-semibold text-[#304236]">Or add an existing image URL</p>
          <label htmlFor="imageUrl" className="mb-2 mt-4 block text-sm font-medium text-[#304236]">Image URL</label>
          <input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/product-photo.jpg" required className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none transition focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
        </div>
        <div>
          <label htmlFor="altText" className="mb-2 block text-sm font-medium text-[#304236]">Image description</label>
          <input id="altText" name="altText" placeholder="Describe what the product photo shows" required minLength={4} maxLength={240} className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none transition focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" />
        </div>
        {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        {state.success && <p role="status" className="rounded-xl bg-[#eef5ed] p-3 text-sm text-[#315b3b]">{state.success}</p>}
        <button disabled={pending} className="w-full rounded-full border border-[#b9c9b6] bg-white px-6 py-3.5 text-sm font-semibold text-[#244b36] transition hover:bg-[#f8faf6] disabled:opacity-60 sm:w-fit">{pending ? "Adding image…" : "Add image URL"}</button>
      </form>
    </section>
  );
}
