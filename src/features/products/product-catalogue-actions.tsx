"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { TaskDialog } from "@/components/ui/task-dialog";
import { NewProductForm } from "@/features/products/new-product-form";

export function ProductCatalogueActions() {
  const [open, setOpen] = useState(false);

  return (
    <TaskDialog
      open={open}
      onOpenChange={setOpen}
      title="Add a product"
      description="Enter the product information and images you have available. You can update details as more verified information becomes available."
      trigger={<button type="button" onClick={() => setOpen(true)} className="rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183a28]"><HugeiconsIcon icon={Add01Icon} size={17} className="mr-2 inline" />Add product</button>}
    >
      <NewProductForm onSuccess={() => setOpen(false)} />
    </TaskDialog>
  );
}
