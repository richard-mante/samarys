export function normalizePhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return "233" + digits.slice(1);
  return digits;
}
