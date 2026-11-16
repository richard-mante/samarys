# Implementation status

This document tracks implemented application capabilities. It is not a build or end-to-end test report.

## Working agreement

- Active implementation happens on `development`.
- Do not merge `development` into `main` without explicit direction.
- End-to-end tests are outside the current implementation scope.
- Do not run application builds; the project owner will run and confirm builds personally.

## Product catalogue

- Product records are stored in PostgreSQL through Drizzle.
- Seller authentication is required for catalogue administration.
- Sellers can create products.
- Sellers can edit product details, price, stock quantity and storefront visibility.
- Public product pages only expose active products.
- Product deletion is intentionally not provided because historical order items must retain their product snapshots.

## Still to implement

- Product image upload and gallery management.
- Customer checkout and order creation.
- Paystack initialization, verification and webhook handling.
- WhatsApp-assisted order creation and seller notification.
- Order status management and customer views.
- Settings persistence and editable seller contact.
- Complete dashboard operational polish.

## Environment dependencies

- Neon PostgreSQL connection string.
- Session signing secret.
- Paystack test/live credentials.
- Seller-approved product information and images.
- Confirmed product price and regulatory documentation before live sales.
