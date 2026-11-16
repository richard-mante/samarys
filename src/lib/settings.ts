import "server-only";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { normalizePhoneNumber } from "@/lib/phone";

const DEFAULT_SELLER_WHATSAPP = "233559448932";
const DEFAULT_DELIVERY_POLICY = "Delivery coverage, availability, fees and timing are confirmed directly by the seller. The product subtotal shown during checkout does not automatically include a delivery fee. Please confirm the complete amount and delivery arrangement before proceeding.";
const DEFAULT_RETURNS_POLICY = "Contact the seller before returning an item or expecting a refund so the applicable terms for your order can be confirmed. This website does not automatically initiate Paystack refunds. The seller must review and process any approved refund through the relevant payment provider.";
const DEFAULT_PRIVACY_POLICY = "When you place an order request, the website may collect your name, phone number, email address if supplied, delivery address and instructions, selected products and order reference. This information is used to create and manage your order, coordinate delivery and respond to support requests. Online payments are handled through Paystack; this website stores payment references and verification status rather than asking you to enter card PINs or security codes here. Order and customer details are available to the seller through the protected administration dashboard for order handling and record keeping. Contact the seller if you need to ask about your information or request a correction.";

export async function getStoreSettings() {
  const rows = await db.select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(inArray(siteSettings.key, [
      "seller_whatsapp_number",
      "delivery_policy",
      "returns_policy",
      "privacy_policy",
    ]));
  const valueFor = (key: string, fallback: string) => {
    const value = rows.find((row) => row.key === key)?.value;
    return typeof value === "string" ? value : fallback;
  };

  return {
    sellerWhatsAppNumber: normalizePhoneNumber(
      valueFor("seller_whatsapp_number", process.env.SELLER_WHATSAPP_NUMBER ?? DEFAULT_SELLER_WHATSAPP),
    ),
    deliveryPolicy: valueFor("delivery_policy", DEFAULT_DELIVERY_POLICY),
    returnsPolicy: valueFor("returns_policy", DEFAULT_RETURNS_POLICY),
    privacyPolicy: valueFor("privacy_policy", DEFAULT_PRIVACY_POLICY),
    orderingEnabled: process.env.ORDERS_ENABLED === "true",
  };
}
