# Initial Data Model

The following is the proposed relational model. Refine constraints and indexes during schema implementation.

## admins
- id (UUID primary key)
- email (unique)
- password_hash (or external auth subject)
- created_at, updated_at, last_login_at

## products
- id (UUID primary key)
- slug (unique)
- name, short_description, description
- price_minor (integer; GHS pesewas)
- currency (GHS)
- is_active, stock_quantity (nullable if stock tracking is disabled)
- created_at, updated_at

## product_images
- id (UUID primary key)
- product_id (foreign key)
- storage_key or image_url
- alt_text
- sort_order
- created_at

## customers
- id (UUID primary key)
- full_name
- phone
- email (nullable)
- created_at, updated_at

## orders
- id (UUID primary key)
- reference (unique, non-guessable)
- customer_id (foreign key)
- order_channel (PAYSTACK or WHATSAPP)
- status (PENDING_PAYMENT, CONFIRMED, PROCESSING, FULFILLED, CANCELLED)
- payment_status (UNPAID, PENDING, PAID, FAILED, REFUNDED)
- currency
- subtotal_minor, delivery_fee_minor, total_minor
- delivery/contact details
- created_at, updated_at

## order_items
- id (UUID primary key)
- order_id (foreign key)
- product_id (nullable foreign key for historical retention)
- product_name_snapshot
- unit_price_minor
- quantity
- line_total_minor

## payments
- id (UUID primary key)
- order_id (foreign key)
- provider (PAYSTACK)
- provider_reference (unique)
- amount_minor, currency
- status
- paid_at, verified_at
- provider_payload (restricted JSONB for reconciliation)

## payment_events
- id (UUID primary key)
- provider_event_key (unique where available)
- payment_id (foreign key, nullable until matched)
- event_type
- received_at
- processed_at
- processing_status

## site_settings
- key (primary key)
- value (JSONB)
- updated_at

## audit_logs
- id (UUID primary key)
- admin_id (foreign key)
- action
- entity_type, entity_id
- metadata (JSONB with sensitive fields excluded)
- created_at

## Money and consistency rules
- Store monetary values as integer minor units (pesewas), never floating-point.
- Persist product name and unit price snapshots on order items.
- Derive order totals on the server.
- Keep payment state separate from fulfilment state.
- Use database transactions for order/payment state changes.
