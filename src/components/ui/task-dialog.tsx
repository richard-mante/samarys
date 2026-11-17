"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TaskDialog({
  trigger,
  title,
  description,
  children,
  contentClassName = "max-w-2xl",
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={`max-h-[88vh] overflow-y-auto ${contentClassName}`}>
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
