# Samary's — V1 Project Scope

## Product vision
Build a polished, trustworthy, mobile-first commerce experience for Samary's, with a public storefront and a protected seller administration dashboard.

The application supports two order paths:
1. Online payment through Paystack.
2. WhatsApp-assisted ordering, where the customer sends an order summary to the seller and payment is arranged directly.

The seller's WhatsApp number is configured as +233559448932 (display: 055 944 8932).

## V1 modules

### Customer storefront
- Homepage and brand presentation.
- Product detail page with configurable gallery, description, price and availability.
- FAQ, contact and customer information/policy pages.
- Responsive layouts and accessible interactions.

### Checkout and orders
- Customer name, phone and delivery/contact details.
- Server-calculated totals and unique order references.
- Order items and immutable price snapshots.
- Order confirmation and status display.
- Customer order lookup using the order reference and matching checkout phone number.
- WhatsApp-assisted order creation and prefilled seller message.

### Payments
- Paystack transaction initialization on the server.
- Server-side transaction verification.
- Signed webhook verification.
- Idempotent payment event handling.
- Payment and order status reconciliation.
- Never trust a browser redirect as proof of payment.

### Seller dashboard
- Secure administrator authentication.
- Overview of orders and verified revenue.
- Product, price, availability and image management.
- Order search, filtering and status updates.
- Payment history and reconciliation.
- Customer directory and per-customer order history.
- Store settings for seller WhatsApp contact and editable delivery, returns and privacy information; delivery coverage and fees are confirmed with the seller per order until fixed delivery rules are supplied.
- Audit trail for sensitive administrative actions.

## Explicitly out of scope for V1
- Marketplace or multiple sellers.
- Native mobile applications.
- Subscription billing.
- Rider dispatch and route management.
- Advanced forecasting or multi-warehouse inventory.
- Automated WhatsApp Business API messaging.
- Complex staff roles and permissions.

## Launch gates
Live sales and public medical advertising remain disabled until the seller confirms product pricing, product identity and supporting documentation, applicable Ghana FDA registration/authorization and approved indications, ingredients, instructions, safety information, and permitted advertising claims. The supplied flyer is an unverified source of seller-provided claims, not evidence of efficacy or regulatory approval.

## Acceptance criteria
- Customer can place either supported order type.
- Online payment is only marked paid after server-side verification.
- WhatsApp-assisted orders remain unpaid until the seller records a verified payment outcome.
- Seller can manage products and orders through authenticated dashboard screens.
- All critical customer and seller journeys pass documented tests.
- No unverified medical treatment or cure claims are published.
