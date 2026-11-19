"use client";

import { useState } from "react";

export function CopyTextButton({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyValue}
      aria-label={copied ? "Copied tracking reference" : "Copy tracking reference"}
      title={copied ? "Copied" : "Copy reference"}
      className={"inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-1 text-xs font-medium text-[#66836c] transition hover:bg-[#edf3eb] hover:text-[#244b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66836c] " + className}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
