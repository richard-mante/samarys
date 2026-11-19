"use client";

import { useState, type ReactNode } from "react";

export function CopyTextButton({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) {
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
      title={copied ? "Copied" : "Click to copy"}
      className={"inline-flex min-w-0 max-w-full cursor-copy items-center rounded-md text-left transition hover:text-[#66836c] hover:underline hover:decoration-dotted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66836c] " + className}
    >
      {copied ? "Copied!" : children}
    </button>
  );
}
