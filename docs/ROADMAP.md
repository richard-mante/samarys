# Implementation Roadmap

## Phase 0 — Repository and project foundation
- [x] Confirm repository access.
- [x] Establish development branch.
- [x] Record product scope and architecture.
- [x] Initialize Next.js application configuration and storefront shell.
- [x] Add environment template and setup instructions.
- [x] Add initial Drizzle schema and database client.
- [ ] Install dependencies and configure local environment (project owner).

## Phase 1 — Data and application foundation
- [x] Define initial relational schema.
- [x] Add database connection module.
- [ ] Configure Neon credentials and validate connection (project owner).
- [ ] Generate and review first migration (project owner).
- [ ] Add validation, formatting and shared domain types.
- [x] Establish admin authentication and server-side authorization.
- [x] Add explicit administrator provisioning workflow.

## Phase 2 — Storefront and product management
- [x] Add initial responsive storefront shell.
- [x] Complete premium responsive storefront experience.
- [x] Add dynamic product detail pages.
- [x] Build product image upload and gallery (signed Cloudinary uploads plus external image URLs).
- [x] Implement dashboard product management.
- [x] Add configurable settings and seller contact.
- [x] Add customer help, FAQ and policy information pages.

## Phase 3 — Orders and WhatsApp
- [x] Implement customer checkout and server-side order creation.
- [x] Add WhatsApp click-to-chat URL helper.
- [x] Implement WhatsApp-assisted order path.
- [x] Add seller order listing and payment visibility.
- [x] Add seller order status transitions.
- [x] Add customer order tracking and seller order search/filtering.
- [x] Add customer directory and per-customer order history.
- [x] Add seller activity log and catalogue audit records.

## Phase 4 — Paystack
- [x] Initialize Paystack transactions server-side.
- [x] Verify transactions server-side.
- [x] Validate webhook signatures and handle events idempotently.
- [x] Add payment history view.
- [x] Add payment reconciliation actions.

## Phase 5 — Verification and launch
- [ ] Final security, accessibility, performance and SEO review.
- [ ] Complete product and regulatory launch gates with the seller.
- [ ] Deploy production only after launch gates pass (project owner).
