import { AdminLoginForm } from "@/features/administration/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f2] px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#e4e8e1] bg-white p-8 shadow-sm">
        <a href="/" className="text-xl font-semibold tracking-tight">Samary&apos;s<span className="text-[#66836c]">.</span></a>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#66836c]">Seller workspace</p>
        <h1 className="mt-2 font-serif text-4xl">Welcome back.</h1>
        <p className="mt-2 text-sm leading-6 text-[#758078]">Sign in to manage your products and customer orders.</p>
        <div className="mt-8"><AdminLoginForm /></div>
      </div>
    </main>
  );
}
