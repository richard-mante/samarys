"use client";

import { useActionState } from "react";
import { loginAdmin } from "./login-action";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, {});
  return <form action={action} className="space-y-5">
    <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label><input id="email" name="email" type="email" autoComplete="username" required className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" /></div>
    <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]" /></div>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <button disabled={pending} className="w-full rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Signing in..." : "Sign in"}</button>
  </form>;
}
