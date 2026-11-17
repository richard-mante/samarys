import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockKeyIcon } from "@hugeicons/core-free-icons";
import { AdminLoginForm } from "@/features/administration/admin-login-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f2f4ee] px-4 py-12">
      <div aria-hidden="true" className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#dce5d8] blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#e5e9df] blur-3xl" />
      <Link href="/" className="absolute left-6 top-6 font-serif text-2xl tracking-tight text-[#203a2b]">Samary&apos;s<span className="text-[#829a7b]">.</span></Link>
      <Dialog open>
        <DialogContent aria-describedby="login-description" showCloseButton={false}>
          <DialogHeader>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#789173]">Seller access</p>
            <DialogTitle><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={LockKeyIcon} size={21} />Welcome back.</span></DialogTitle>
            <DialogDescription id="login-description">Sign in to manage Samary&apos;s product information, images and orders.</DialogDescription>
          </DialogHeader>
          <AdminLoginForm />
          <p className="text-center text-xs text-[#9aa49a]">Authorised seller access only.</p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
