# Paystack setup

## Production domain

The current production domain for Samary's is:

`https://samary.catpad.shop`

Set `NEXT_PUBLIC_APP_URL=https://samary.catpad.shop` in the Vercel production environment. Paystack callback URLs are generated from this setting.

## Environment

Configure these server-side environment variables in the deployment environment and local `.env.local`:

- `PAYSTACK_SECRET_KEY`: Paystack test or live secret key. Never expose this value to the browser.
- `PAYSTACK_PUBLIC_KEY`: reserved for future client-side Paystack components; the current hosted checkout uses the secret-key initialization API.
- `NEXT_PUBLIC_APP_URL`: canonical application origin. Use `https://samary.catpad.shop` in production.
- `DATABASE_URL`: PostgreSQL connection string.

Keep `ORDERS_ENABLED=false` until product pricing, product information, delivery terms and regulatory checks have been approved. Enable it only when the seller is ready to accept orders.

## Paystack dashboard

Register this webhook URL in the Paystack dashboard:

`https://samary.catpad.shop/api/payments/paystack/webhook`

## Customer payment flow

1. Checkout sends customer details and product IDs/quantities to the server.
2. The server reloads active product prices and validates stock; browser totals are never trusted.
3. The server creates an order and pending payment record, then initializes a hosted Paystack transaction in GHS.
4. The customer is redirected to Paystack's hosted authorization page.
5. The callback verifies the transaction with Paystack before settling the order. The signed webhook provides a second, idempotent settlement path.
6. The result page reads payment status from the database; query-string values alone cannot display a successful payment.

WhatsApp-assisted orders remain separate and unpaid until the seller records a payment. No payment credentials are committed to the repository.

## Before live mode

- Add and verify the webhook URL above in the Paystack dashboard.
- Configure production secret key and `NEXT_PUBLIC_APP_URL` in Vercel.
- Add `samary.catpad.shop` to the Vercel project domains and configure the DNS records Vercel provides at the Catpad DNS provider.
- Complete test transactions using Paystack test credentials.
- Confirm product prices, stock policy, delivery fee policy and customer support process.
- Confirm applicable Ghana FDA registration and advertising approvals before enabling live sales.
