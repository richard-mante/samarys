"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = { name?: string };

export function ProductImagePicker({ name = "productImage" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function handleFile(file?: File) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("Choose a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("The original image must be smaller than 10 MB.");
      return;
    }

    try {
      const source = await new Promise<HTMLImageElement>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read this image."));
        reader.onload = () => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("This image could not be opened."));
          image.src = String(reader.result);
        };
        reader.readAsDataURL(file);
      });
      const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare this image.");
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/webp", 0.82);
      if (compressed.length > 2_200_000) throw new Error("This image is still too large. Choose a smaller image.");
      setImageData(compressed);
      setFileName(file.name);
    } catch (cause) {
      setImageData("");
      setFileName("");
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[#d6dfd2] bg-[#fafbf8] p-4">
      <input type="hidden" name="imageData" value={imageData} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#304236]">Product image</p>
          <p className="mt-1 text-xs text-[#849087]">Optional · Stored with the product · Optimised automatically</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full border border-[#d9dfd5] bg-white px-4 py-2 text-xs font-semibold text-[#244b36] hover:bg-[#f2f5ef]">
          {imageData ? "Choose another" : "Choose image"}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
      </div>
      {imageData && (
        <div className="grid gap-3 sm:grid-cols-[112px_1fr] sm:items-center">
          <img src={imageData} alt="Product image preview" className="aspect-square w-28 rounded-xl border border-[#e4e8e1] object-cover" />
          <div className="min-w-0">
            <p className="truncate text-xs text-[#68766c]">{fileName}</p>
            <label htmlFor={name + "-alt"} className="mb-1.5 mt-3 block text-xs font-medium text-[#405447]">Image description</label>
            <Input id={name + "-alt"} name="imageAltText" value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the product image" required minLength={4} maxLength={240} />
            <button type="button" onClick={() => { setImageData(""); setAltText(""); setFileName(""); if (inputRef.current) inputRef.current.value = ""; }} className="mt-2 text-xs font-medium text-[#9b5148] hover:underline">Remove image</button>
          </div>
        </div>
      )}
      {!imageData && <input type="hidden" name="imageAltText" value="" />}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
