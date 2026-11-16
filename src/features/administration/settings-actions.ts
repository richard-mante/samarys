"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { db } from "@/db";
import { admins, auditLogs, siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { normalizePhoneNumber } from "@/lib/phone";

export type SettingsActionState = { error?: string; success?: string };

const settingsSchema = z.object({
  sellerWhatsAppNumber: z.string().trim().min(7).max(32)
    .regex(/^\+?[0-9\s()-]+$/, "Enter a valid phone number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Enter a complete phone number with country code if needed."),
});

export async function updateStoreSettings(_previous: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const admin = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    sellerWhatsAppNumber: formData.get("sellerWhatsAppNumber"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the settings and try again." };

  const phone = normalizePhoneNumber(parsed.data.sellerWhatsAppNumber);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(siteSettings).values({
        key: "seller_whatsapp_number",
        value: phone,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: phone, updatedAt: new Date() },
      });

      await tx.insert(auditLogs).values({
        adminId: admin.adminId,
        action: "STORE_SETTINGS_UPDATED",
        entityType: "site_settings",
        entityId: "seller_whatsapp_number",
        metadata: { sellerWhatsAppNumber: phone },
      });
    });

    revalidatePath("/");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");
    return { success: "Store settings saved." };
  } catch {
    return { error: "Could not save store settings. Please try again." };
  }
}


const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12, "Use at least 12 characters for your new password.").max(200),
  confirmPassword: z.string().min(1).max(200),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "The new passwords do not match.",
  path: ["confirmPassword"],
});

export async function changeAdminPassword(_previous: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the password fields." };

  const [record] = await db.select({ passwordHash: admins.passwordHash, email: admins.email })
    .from(admins).where(eq(admins.id, admin.adminId)).limit(1);
  if (!record || !(await compare(parsed.data.currentPassword, record.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { error: "Choose a new password that is different from your current one." };
  }

  try {
    const passwordHash = await hash(parsed.data.newPassword, 12);
    await db.transaction(async (tx) => {
      await tx.update(admins).set({ passwordHash, updatedAt: new Date() }).where(eq(admins.id, admin.adminId));
      await tx.insert(auditLogs).values({
        adminId: admin.adminId,
        action: "ADMIN_PASSWORD_CHANGED",
        entityType: "admin",
        entityId: admin.adminId,
        metadata: { email: record.email },
      });
    });
    revalidatePath("/admin/settings");
    return { success: "Your password has been changed." };
  } catch {
    return { error: "Could not change your password. Please try again." };
  }
}
