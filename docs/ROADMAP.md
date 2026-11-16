# Implementation Roadmap

## Phase 0 — Repository and project foundation
- [x] Confirm repository access.
- [x] Establish development branch.
- [x] Record product scope and architecture.
- [x] Initialize Next.js application configuration and storefront shell.
- [x] Add environment template and setup instructions.
- [x] Add initial Drizzle schema and database client.
- [ ] Install dependencies and run lint, typecheck and production build in a local environment.

## Phase 1 — Data and application foundation
- [x] Define initial relational schema.
- [x] Add database connection module.
- [ ] Configure Neon credentials and validate connection.
- [ ] Generate and review first migration.
- [ ] Add validation, formatting and shared domain types.
- [ ] Establish admin authentication and authorization.

## Phase 2 — Storefront and product management
- [x] Add initial responsive storefront shell.
- [ ] Complete design system and responsive storefront.
- [ ] Build product detail and gallery.
- [ ] Implement dashboard product management.
- [ ] Add configurable settings and seller contact.

## Phase 3 — Orders and WhatsApp
- [ ] Implement customer checkout and server-side order creation.
- [x] Add WhatsApp click-to-chat URL helper.
- [ ] Implement WhatsApp-assisted order path.
- [ ] Build seller order management and status transitions.

## Phase 4 — Paystack
- [ ] Initialize Paystack transactions server-side.
- [ ] Verify transactions server-side.
- [ ] Validate webhook signatures and handle events idempotently.
- [ ] Build payment history and reconciliation.

## Phase 5 — Verification and launch
- [ ] Add unit, integration and end-to-end tests.
- [ ] Test payment sandbox and failure cases.
- [ ] Test seller and customer journeys on mobile and desktop.
- [ ] Review security, accessibility, performance and SEO.
- [ ] Complete product and regulatory launch gates.
- [ ] Deploy production only after launch gates pass.
