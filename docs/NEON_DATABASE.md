# Neon PostgreSQL configuration

Samary uses Neon PostgreSQL through Drizzle ORM and postgres-js.

## Connection string

Only one environment variable is required:

- `DATABASE_URL`: your Neon pooled connection string (the hostname includes `-pooler`). Use this same value for the running Next.js app, Vercel, Drizzle schema generation and migrations.

Keep the connection string server-side, out of browser bundles, and out of source control. Add it to your local `.env.local` and to the appropriate Vercel environment.

## Why the pooled connection works

The application runs on Vercel's serverless infrastructure. The pooled Neon endpoint is designed to handle many short-lived application instances without consuming one database connection per invocation. The runtime postgres-js client disables prepared statements for PgBouncer transaction-pooling compatibility and caps each warm function instance at one connection.

Drizzle Kit also reads `DATABASE_URL`, so you do not need a separate unpooled connection string for the normal setup. If Neon or a particular schema operation reports a pooling-specific limitation during a migration, handle that operation separately; it is not a second variable required for the app's standard environment.

## Runtime and schema indexes

The schema includes indexes for the application's real query paths:

- Public active-product catalogue ordered by creation date.
- Product image galleries ordered by product and sort order.
- Admin order lists filtered by fulfilment status, payment status, channel, or customer and sorted by creation date.
- Order item lookups by order and by product, including stock-reservation checks.
- Payment lookup by order and payment state.
- Rate-limit bucket lookups in audit logs.

These indexes are declared in the Drizzle schema. They do not affect an existing Neon database until a migration is generated, reviewed and applied.

## Apply the schema changes

1. Back up the Neon database before changing a live schema.
2. Set `DATABASE_URL` in your local `.env.local` to your Neon pooled connection string.
3. Generate the migration with `npm run db:generate`.
4. Review the SQL, especially when applying to a database that may already contain manually created tables or indexes.
5. Apply the reviewed migration with `npm run db:migrate`.
6. Keep the generated migration files committed with the application code.

Do not generate or apply migrations automatically at application startup. Do not point production preview deployments at the live database unless that is intentional.

## Operational notes

- Keep the existing order/payment transaction boundaries; Neon is PostgreSQL, so row locks and transactions remain supported through the pooled postgres-js connection.
- Keep image payloads compressed. The current product image implementation stores Base64 data in PostgreSQL; this is acceptable for the current small catalogue but increases database size and response payloads as image volume grows. Moving image binaries to object storage should be a separate migration when scale or storage costs justify it.
- Use Neon monitoring to watch active connections, compute usage, storage growth and query latency after deployment.
- Do not add aggressive connection pool sizes to serverless functions. Increase only after observing actual concurrency and Neon connection metrics.
