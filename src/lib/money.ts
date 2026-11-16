export const DEFAULT_CURRENCY = "GHS" as const;

/** Convert an amount in Ghana cedis to integer pesewas. */
export function cedisToPesewas(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a finite, non-negative number.");
  }

  return Math.round((amount + Number.EPSILON) * 100);
}

/** Format an integer amount in pesewas as Ghana cedis. */
export function formatGhsFromPesewas(amountMinor: number): string {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Amount must be a non-negative integer in pesewas.");
  }

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}
