# Architecture

## Selected stack
- Next.js App Router and TypeScript for the storefront, dashboard and server endpoints.
- Neon PostgreSQL as the relational database.
- Drizzle ORM for schema, queries and migrations.
- Paystack for online payments.
- WhatsApp click-to-chat links for customer-initiated communication.
- Tailwind CSS for styling, with shadcn components using Base UI where appropriate.
- Hugeicons for iconography.
- Vercel as the initial deployment target.

## Application boundaries
- `src/app/(storefront)`: public pages and customer journeys.
- `src/app/admin`: authenticated seller dashboard.
- `src/app/api`: server-side order, payment, webhook and admin endpoints.
- `src/features`: domain-oriented product, order, payment and administration modules.
- `src/db`: Drizzle schema and database access.
- `src/lib`: shared configuration, validation, formatting and integrations.

## Payment trust boundaries
1. Browser submits product identifiers and quantities, never authoritative prices.
2. Server loads current prices and availability and calculates the total.
3. Server creates a pending order and initializes Paystack using a unique reference.
4. Server verifies the transaction with Paystack and checks reference, amount, currency and status.
5. Webhook signatures are validated against the raw request body and secret.
6. Payment state transitions are idempotent; duplicate callbacks cannot duplicate fulfilment or revenue.
7. Customer-facing success pages read persisted server-side status.

## WhatsApp boundaries
- Use a wa.me link with URL-encoded, minimal order details.
- Opening WhatsApp does not prove the message was sent or received.
- A WhatsApp-assisted order is not a paid order.
- Seller phone number is configurable in settings and defaults to +233559448932.

## Data and secrets
- Keep database URLs and Paystack secret keys server-only.
- Never expose secrets through NEXT_PUBLIC variables.
- Validate all external input at server boundaries.
- Use secure, HTTP-only, same-site cookies for administrator sessions.
- Apply authorization checks in server actions and route handlers, not only in dashboard UI.
