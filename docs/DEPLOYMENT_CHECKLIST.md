# Samary's deployment checklist

Use this checklist to deploy the app at **https://samary.catpad.shop**. Keep live ordering disabled until the product, delivery and regulatory details are approved.

## 1. Prepare the services

- [ ] Create a [Neon](https://neon.tech/) PostgreSQL project and copy its connection string. Use the pooled connection string for the app.
- [ ] Make sure you have access to the Samary's [Vercel](https://vercel.com/) project and the DNS settings for `catpad.shop`.
- [ ] Sign in to the Samary's [Paystack Dashboard](https://dashboard.paystack.com/). Complete any business verification Paystack requires before live transactions.

## 2. Prepare and migrate the database

On your computer, clone the repository and check out the deployment commit from `main`. Install dependencies with `npm install`, then:

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to the Neon connection string.
2. Generate the initial migration from the current Drizzle schema:
   ```bash
   npm run db:generate
   ```
3. Commit and push the generated `drizzle/` migration files to the repository before deploying.
4. Apply the migrations to the Neon database:
   ```bash
   npm run db:migrate
   ```

Do not skip migrations. The repository currently contains the schema but no generated migration files, so generate and commit the initial migration before the first deployment.

## 3. Configure Vercel

- [ ] Import/connect `richard-mante/samarys` in Vercel.
- [ ] Set the production branch to `main`.
- [ ] Add these Production environment variables (and Preview variables only if you want preview deployments connected to a separate test database):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | A random secret of at least 32 characters |
| `NEXT_PUBLIC_APP_URL` | `https://samary.catpad.shop` |
| `PAYSTACK_SECRET_KEY` | Paystack **test** secret key initially |
| `ORDERS_ENABLED` | `false` until all launch approvals are complete |

Generate a session secret locally with `openssl rand -base64 48`. Keep it private. `PAYSTACK_PUBLIC_KEY` is reserved for a future client-side integration and is not required for the current hosted-checkout flow. Never put a Paystack secret key in a `NEXT_PUBLIC_*` variable or commit it to Git.

- [ ] Deploy the latest `main` branch from Vercel.
- [ ] Add `samary.catpad.shop` under Vercel Project → Settings → Domains.
- [ ] Add the exact DNS record(s) Vercel displays at the DNS provider managing `catpad.shop`. Wait for Vercel to verify the domain and HTTPS certificate.

## 4. Create the seller login

After the database migrations have been applied, create the administrator account from your computer. Use the production Neon connection string in your local `.env.local`, then run:

```bash
ADMIN_EMAIL="your-admin-email" ADMIN_PASSWORD="a-long-unique-password" npm run admin:create
```

Use a strong password of at least 12 characters. This command creates the admin record or updates the password for that email. Do not add `ADMIN_PASSWORD` to Vercel. Then sign in at:

`https://samary.catpad.shop/admin/login`

After her first sign-in, open **Settings → Change administrator password** and replace the initial password with a private one.

## 5. Configure Paystack

In the Paystack Dashboard:

1. Open the API keys/settings area and copy the **Test Secret Key** into Vercel's `PAYSTACK_SECRET_KEY` for the first deployment.
2. Open the Webhooks settings and register this exact endpoint:
   `https://samary.catpad.shop/api/payments/paystack/webhook`
3. Save the webhook and confirm the endpoint is registered. Do not share or commit the secret key.
4. Redeploy in Vercel after changing environment variables.

Run test-mode checkout transactions and confirm that successful payments are verified and reflected in the order/payment records. Also test a cancelled or failed checkout and confirm it is not marked paid. Do not switch to live credentials until the test flow has been checked. For launch, replace the test key with the **Live Secret Key**, verify the webhook configuration for the live account, and redeploy.

More detail: [Paystack setup](./PAYSTACK_SETUP.md).

### Product image storage

Create a Cloudinary account for Samary's and add these server-only Production environment variables in Vercel:

| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

The API secret must never be exposed in a `NEXT_PUBLIC_*` variable or committed to Git. The dashboard requests a short-lived signed upload using the server-side secret; image bytes are uploaded directly from the browser to Cloudinary. The app accepts image files up to 8 MB.

## 6. Finish the app configuration

Sign in to the seller dashboard and complete the following:

- [ ] Add the approved product name, descriptions, price in GHS, stock policy and visibility.
- [ ] Configure Cloudinary image storage with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in Vercel. The seller can upload product images directly from the dashboard; existing public image URLs remain supported.
- [ ] Confirm the seller WhatsApp number is correct: **+233 559 448 932**.
- [ ] Confirm delivery areas, delivery fees, delivery instructions and customer support arrangements.
- [ ] Review the storefront on mobile and desktop, including product details, basket, checkout, WhatsApp order handoff, order tracking, help/FAQ and customer policy pages, plus the seller dashboard.
- [ ] Review and publish accurate contact, delivery, privacy, returns/refund and terms information as applicable.

Customers can look up an order at `https://samary.catpad.shop/orders/track` using the order reference and the same phone number supplied at checkout. The lookup does not expose delivery address, email or other private customer details.

The product's final price has not yet been confirmed. Do not invent a price or publish unverified ingredients, certifications, treatment outcomes or cure claims.

## 7. Complete launch approvals, then enable orders

Before accepting real customer orders, the seller must confirm the product identity, manufacturer, ingredients, directions, safety information, contraindications, approved indications, pricing and stock. Verify the applicable Ghana FDA registration/authorization and advertising requirements for this specific product. Do not advertise treatment of infections or STIs, or other medical claims, unless the exact claims are approved and substantiated.

- [ ] Confirm applicable Ghana FDA status and permitted advertising claims.
- [ ] Confirm product price, delivery coverage/fees, stock and customer support.
- [ ] Complete a real-world review of the customer and seller journeys using Paystack test mode first.
- [ ] Switch Vercel `PAYSTACK_SECRET_KEY` to the live key and redeploy when approved.
- [ ] Change `ORDERS_ENABLED` to `true` in Vercel only when the seller is ready to accept orders, then redeploy.

## 8. After deployment

- [ ] Confirm `https://samary.catpad.shop` loads over HTTPS.
- [ ] Sign in to `/admin/login` and confirm product/settings/order pages work.
- [ ] Place and reconcile a Paystack test order before enabling live mode.
- [ ] Confirm WhatsApp-assisted orders are received by the seller and remain unpaid until payment is recorded by the seller.
- [ ] Monitor Vercel deployment/runtime logs and Paystack transactions/webhook delivery after launch.

**Important:** A successful Vercel deployment does not by itself prove payments, order handling, delivery operations or regulatory compliance are ready. The project owner must run and confirm the production checks. End-to-end tests and builds are intentionally not run as part of the current implementation work.
