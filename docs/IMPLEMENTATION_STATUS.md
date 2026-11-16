# Implementation status

This document tracks implemented application capabilities. It is not a build or end-to-end test report.

## Working agreement

- Active implementation happens on `development`.
- Completed development work is merged into `main` regularly; never leave completed work isolated on a feature branch.
- End-to-end tests are outside the current implementation scope.
- Do not run application builds; the project owner will run and confirm builds personally.

## Product catalogue

- Product records are stored in PostgreSQL through Drizzle.
- Seller authentication is required for catalogue administration.
- Sellers can create products.
- Sellers can edit product details, price, stock quantity and storefront visibility.
- Sellers can add and remove product gallery images using public image URLs and accessible alt text.
- Sellers can upload image files directly to Cloudinary using server-signed uploads; the Cloudinary API secret remains server-side.
- Public product pages only expose active products and render seller-managed gallery images.
- The home page features active catalogue products and their lead images.
- Product deletion is intentionally not provided because historical order items must retain their product snapshots.

## Seller workspace

- Seller dashboard includes live product/order/revenue metrics, recent orders, unpaid requests and low-stock alerts.
- Seller workspace navigation is responsive and highlights the active section.
- Seller can search orders by customer name, phone or reference and filter by fulfilment status, payment status and order channel.
- Seller can review a timestamped activity log for order, payment, settings and catalogue changes.
- Seller WhatsApp contact is editable in the dashboard, persisted in site settings and reused by storefront enquiry/order links.
- Seller can inspect individual orders, customer contact details, delivery notes, line items, totals and linked payment records.
- Seller can move orders through guarded fulfilment transitions.
- Seller can record a manually received WhatsApp payment, delivery fee and payment reference; the action is audit-logged.
- The finance dashboard combines Paystack transaction records with seller-confirmed WhatsApp payment audit records.
- Fulfilled status is blocked unless payment is marked paid.
- Order status changes are written to the audit log within the same database transaction.

## Customer ordering and payments

- Customers can build a persistent basket and submit a WhatsApp-assisted order request with contact and delivery details.
- WhatsApp order requests are stored as unpaid and are not represented as completed payments.
- Customer checkout supports hosted Paystack payments in GHS alongside WhatsApp-assisted order requests.
- Order totals are calculated from active server-side product prices; browser totals are never trusted.
- Paystack initialization creates order and payment records with immutable item-price snapshots before redirecting to hosted checkout.
- Callback verification checks provider transaction status, reference, amount and currency before settling the order.
- Signed Paystack webhooks use HMAC SHA-512 validation and persisted event keys for idempotent processing.
- Payment result pages read verified payment state from PostgreSQL; URL parameters alone cannot claim payment success.
- Customers can look up order fulfilment/payment status using the order reference and matching checkout phone number. Lookup responses omit customer identity, contact and delivery-address details.
- Customer ordering is gated by the server-only `ORDERS_ENABLED` flag and defaults to disabled until seller pricing and regulatory checks are complete.
- Paystack deployment variables and webhook registration are documented in `docs/PAYSTACK_SETUP.md`.

## Storefront experience

- Premium botanical/editorial direction with warm ivory, deep green and sage.
- Responsive landing page with product discovery, seller contact and clear product-information messaging.
- Product detail pages show seller-managed imagery, price and WhatsApp enquiry.
- Reduced-motion and visible keyboard-focus preferences are respected.
- No unverified medical claims, ingredients, certifications or treatment outcomes are presented as facts.

## Remaining work before launch

- Complete the final security, accessibility, performance and SEO review.
- Configure Neon, Cloudinary, Vercel and Paystack credentials and validate the live integrations.
- Complete the seller's product, pricing, delivery and applicable Ghana FDA/regulatory approvals.

## Launch dependencies

- Neon PostgreSQL connection string.
- Session signing secret.
- Cloudinary cloud name, API key and API secret for managed image uploads.
- Paystack test/live credentials and webhook registration.
- Seller-approved product information, actual product photography and ingredients.
- Confirmed product price, delivery coverage/fees and applicable Ghana FDA registration/advertising approvals before live sales.
