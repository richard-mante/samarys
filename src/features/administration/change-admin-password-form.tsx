"use client";

import { useActionState } from "react";
import { changeAdminPassword } from "./settings-actions";

const fieldClass = "w-full rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]";

export function ChangeAdminPasswordForm() {
  const [state, action, pending] = useActionState(changeAdminPassword, {});
  return <form action={action} className="mt-6 space-y-4">
    <div><label htmlFor="currentPassword" className="mb-2 block text-sm font-medium text-[#304236]">Current password</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required maxLength={200} className={fieldClass}/></div>
    <div><label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-[#304236]">New password</label><input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={200} className={fieldClass}/><p className="mt-2 text-xs text-[#849087]">Use at least 12 characters and avoid reusing another account password.</p></div>
    <div><label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#304236]">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={200} className={fieldClass}/></div>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-[#eef5ed] p-3 text-sm text-[#315b3b]">{state.success}</p>}
    <button type="submit" disabled={pending} className="w-full rounded-full bg-[#244b36] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:opacity-60 sm:w-fit">{pending ? "Updating password…" : "Change password"}</button>
  </form>;
}
