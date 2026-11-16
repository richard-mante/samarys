# Samary's

A premium, mobile-first product commerce application with a public storefront and a protected seller dashboard.

## Development workflow

Active implementation happens on `development`. Merge completed work into `main` regularly; Vercel production deploys from `main`. Do not run builds or end-to-end tests as part of routine implementation work; the project owner will run and confirm them.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Neon PostgreSQL and Drizzle ORM
- Paystack hosted checkout
- WhatsApp click-to-chat
- Vercel

## Deployment

The production domain is [samary.catpad.shop](https://samary.catpad.shop).

**Before deploying, follow the complete [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md).** It covers Neon database setup and migrations, Vercel environment variables and domain/DNS, seller-admin provisioning, Paystack API keys and webhook configuration, storefront setup, launch approvals and post-deployment checks.

For payment-specific details, see [Paystack Setup](docs/PAYSTACK_SETUP.md).

## Local development

1. Install a supported Node.js LTS release and npm.
2. Copy `.env.example` to `.env.local`.
3. Configure `DATABASE_URL` and the required local secrets.
4. Install dependencies with `npm install`.
5. Generate/apply database migrations when setting up a fresh database (see the deployment checklist).
6. Start the app with `npm run dev`.

Never commit `.env.local`, database credentials, session secrets or Paystack secret keys.

## Project documentation

- [Deployment checklist](docs/DEPLOYMENT_CHECKLIST.md)
- [Project scope](docs/PROJECT_SCOPE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Design brief](docs/DESIGN_BRIEF.md)
- [Roadmap](docs/ROADMAP.md)
- [Paystack setup](docs/PAYSTACK_SETUP.md)

## Launch safeguards

Customer ordering remains disabled by default with `ORDERS_ENABLED=false`. Enable it only after pricing, product information, delivery terms and applicable Ghana FDA/regulatory and advertising requirements have been verified. Never publish unsubstantiated medical treatment or cure claims.
