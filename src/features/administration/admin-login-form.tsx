"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "./login-action";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, {});
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[#304236]">Email address</label>
        <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-[#304236]">Password</label>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
      </div>
      {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
