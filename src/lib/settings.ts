import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { normalizePhoneNumber } from "@/lib/phone";

const DEFAULT_SELLER_WHATSAPP = "233559448932";

export async function getStoreSettings() {
  const [whatsappSetting] = await db.select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "seller_whatsapp_number"))
    .limit(1);

  const configuredValue = typeof whatsappSetting?.value === "string"
    ? whatsappSetting.value
    : process.env.SELLER_WHATSAPP_NUMBER ?? DEFAULT_SELLER_WHATSAPP;

  return {
    sellerWhatsAppNumber: normalizePhoneNumber(configuredValue),
    orderingEnabled: process.env.ORDERS_ENABLED === "true",
  };
}
