import { NextResponse } from "next/server";
import { verifyAndSettlePaystackPayment } from "@/lib/paystack";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
  if (!reference || !/^[A-Za-z0-9_-]{8,120}$/.test(reference)) {
    return NextResponse.redirect(new URL("/checkout/payment-result?status=invalid", url.origin));
  }

  try {
    await verifyAndSettlePaystackPayment(reference);
    return NextResponse.redirect(new URL("/checkout/payment-result?status=success&reference=" + encodeURIComponent(reference), url.origin));
  } catch {
    return NextResponse.redirect(new URL("/checkout/payment-result?status=failed&reference=" + encodeURIComponent(reference), url.origin));
  }
}
