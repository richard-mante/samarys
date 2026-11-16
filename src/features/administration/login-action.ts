"use server";

import "server-only";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { createAdminSession } from "@/lib/auth";

export async function loginAdmin(_previous: { error?: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password || password.length > 200) {
    return { error: "Enter your email address and password." };
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (!admin || !(await compare(password, admin.passwordHash))) {
    return { error: "The email address or password is incorrect." };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}
