"use server";

import "server-only";
import { createHash } from "node:crypto";
import { compare } from "bcryptjs";
import { and, count, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { admins, auditLogs } from "@/db/schema";
import { createAdminSession } from "@/lib/auth";

export async function loginAdmin(_previous: { error?: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password || password.length > 200) {
    return { error: "Enter your email address and password." };
  }

  const requestHeaders = await headers();
  const clientAddress = (
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    "unknown"
  ).split(",")[0].trim().slice(0, 80);
  const attemptKey = createHash("sha256")
    .update(email + ":" + clientAddress + ":" + (process.env.SESSION_SECRET ?? "local-only"))
    .digest("hex");
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const [recentAttempts] = await db.select({ total: count() }).from(auditLogs).where(and(
    eq(auditLogs.action, "ADMIN_LOGIN_FAILED"),
    eq(auditLogs.entityType, "admin_login"),
    eq(auditLogs.entityId, attemptKey),
    gte(auditLogs.createdAt, since),
  ));

  if (Number(recentAttempts?.total ?? 0) >= 8) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes before trying again." };
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (!admin || !(await compare(password, admin.passwordHash))) {
    await db.insert(auditLogs).values({
      action: "ADMIN_LOGIN_FAILED",
      entityType: "admin_login",
      entityId: attemptKey,
      metadata: { reason: admin ? "incorrect_password" : "unknown_account" },
    });
    return { error: "The email address or password is incorrect." };
  }

  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));
  await db.insert(auditLogs).values({
    adminId: admin.id,
    action: "ADMIN_LOGIN_SUCCEEDED",
    entityType: "admin",
    entityId: admin.id,
  });
  await createAdminSession(admin.id);
  redirect("/admin");
}
