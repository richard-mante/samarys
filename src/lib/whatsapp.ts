const DEFAULT_SELLER_NUMBER = "233559448932";

function normalizeWhatsAppNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits || digits.length < 10 || digits.length > 15) {
    throw new Error("A valid international WhatsApp number is required.");
  }
  return digits;
}

export function createSellerWhatsAppUrl(
  message?: string,
  sellerNumber = process.env.SELLER_WHATSAPP_NUMBER ?? DEFAULT_SELLER_NUMBER,
): string {
  const phone = normalizeWhatsAppNumber(sellerNumber);
  const baseUrl = `https://wa.me/${phone}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}
