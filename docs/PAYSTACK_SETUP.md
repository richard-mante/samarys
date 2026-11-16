# Paystack setup

## Environment

Configure these server-side environment variables in the deployment environment and local `.env.local`:

- `PAYSTACK_SECRET_KEY`: Paystack test or live secret key. Never expose this value to the browser.
- `PAYSTACK_PUBLIC_KEY`: reserved for future client-side Paystack components; the current hosted checkout uses the secret-key initialization API.
- `NEXT_PUBLIC_APP_URL`: canonical application origin, including `https://` in production.
- `DATABASE_URL`: PostgreSQL connection string.

Keep `ORDERS_ENABLED=false` until product pricing, product information, delivery terms and regulatory checks have been approved. Enable it only when the seller is ready to accept orders.

## Paystack dashboard

Register this webhook URL in the Paystack dashboard:

`https://YOUR-DOMAIN/api/payments/paystack/webhook`

Replace `YOUR-DOMAIN` with the deployed application host. The webhook endpoint validates Paystack's HMAC SHA-512 signature using `PAYSTACK_SECRET_KEY`, records event keys to prevent duplicate processing, and verifies amount, currency, reference and transaction status before marking an order paid.

## Customer payment flow

1. Checkout sends customer details and product IDs/quantities to the server.
2. The server reloads active product prices and validates stock; browser totals are never trusted.
3. The server creates an order and pending payment record, then initializes a hosted Paystack transaction in GHS.
4. The customer is redirected to Paystack's hosted authorization page.
5. The callback verifies the transaction with Paystack before settling the order. The signed webhook provides a second, idempotent settlement path.
6. The result page reads payment status from the database; query-string values alone cannot display a successful payment.

WhatsApp-assisted orders remain separate and unpaid until the seller records a payment. No payment credentials are committed to the repository.

## Before live mode

- Add and verify Paystack webhook URL in the dashboard.
- Configure production secret key and canonical app URL in hosting environment.
- Complete test transactions using Paystack test credentials.
- Confirm product prices, stock policy, delivery fee policy and customer support process.
- Confirm applicable Ghana FDA registration and advertising approvals before enabling live sales.
