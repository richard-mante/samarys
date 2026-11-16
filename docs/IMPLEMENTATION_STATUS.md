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
- Public product pages only expose active products and render seller-managed gallery images.
- The home page features active catalogue products and their lead images.
- Product deletion is intentionally not provided because historical order items must retain their product snapshots.

## Seller order operations

- Seller can inspect an individual order, customer contact details, delivery notes, line items, totals and linked payment records.
- Seller can move orders through guarded fulfilment transitions.
- Customers can build a persistent basket and submit a WhatsApp-assisted order request with contact and delivery details.
- Order totals are calculated from current server-side product prices; delivery is explicitly confirmed separately by the seller.
- WhatsApp order requests are stored as unpaid and are not represented as completed payments.
- Fulfilled status is blocked unless payment is marked paid.
- Order status changes are written to the audit log within the same database transaction.

## Storefront experience

- Premium botanical/editorial direction with warm ivory, deep green and sage.
- Responsive landing page with product discovery, seller contact and clear product-information messaging.
- Product detail pages show seller-managed imagery, price and WhatsApp enquiry.
- Reduced-motion and visible keyboard-focus preferences are respected.
- No unverified medical claims, ingredients, certifications or treatment outcomes are presented as facts.

## Still to implement

- Direct image file uploads and managed storage (current gallery accepts image URLs).
- Paystack checkout, payment verification and webhook handling.
- Paystack initialization, verification and webhook handling.
- Seller-verified payment recording for WhatsApp-assisted orders and customer order status views.
- Customer-facing order status views and payment recording for WhatsApp-assisted orders.
- Settings persistence and editable seller contact.
- Complete dashboard operational polish.

## Launch dependencies

- Neon PostgreSQL connection string.
- Session signing secret.
- Paystack test/live credentials.
- Seller-approved product information, actual product photography and ingredients.
- Confirmed product price, delivery coverage/fees and applicable Ghana FDA registration/advertising approvals before live sales.
