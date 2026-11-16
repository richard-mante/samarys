# Samary's

A premium, mobile-first product commerce application with a public storefront and a protected seller dashboard.

## Active development

All active implementation is on the `development` branch. `main` is reserved for stable releases; do not merge `main` into `development`.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Neon PostgreSQL and Drizzle ORM
- Paystack
- WhatsApp click-to-chat
- Vercel

## Deployment\n\nThe current production domain is [samary.catpad.shop](https://samary.catpad.shop). Configure `NEXT_PUBLIC_APP_URL=https://samary.catpad.shop` in Vercel and register the matching Paystack webhook documented in `docs/PAYSTACK_SETUP.md`.\n\n## Local setup

1. Install Node.js (current supported LTS) and npm.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to a Neon PostgreSQL connection string.
4. Install dependencies with `npm install`.
5. Run `npm run dev`.

## Database

- `npm run db:generate` creates Drizzle migrations from the schema.
- `npm run db:migrate` applies migrations.
- `npm run db:studio` opens Drizzle Studio.

Never commit `.env.local`, database credentials or Paystack secret keys.

## Project documentation

- [Project scope](docs/PROJECT_SCOPE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Design brief](docs/DESIGN_BRIEF.md)
- [Roadmap](docs/ROADMAP.md)

## Launch safeguards

Live checkout and public medical advertising remain gated until product pricing, product documentation and applicable regulatory approvals have been verified. Do not publish unsubstantiated treatment or cure claims.
