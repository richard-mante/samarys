"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, siteSettings } from "@/db/schema";
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
