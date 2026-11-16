"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-[#dfe5dc] bg-white px-3.5 py-3 text-sm text-[#203a2b] shadow-sm outline-none transition placeholder:text-[#9aa49a] focus-visible:border-[#789173] focus-visible:ring-2 focus-visible:ring-[#dce5d8] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
