import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const orderChannelEnum = pgEnum("order_channel", ["PAYSTACK", "WHATSAPP"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "FULFILLED",
  "CANCELLED",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
]);
export const paymentProviderEnum = pgEnum("payment_provider", ["PAYSTACK"]);
export const paymentEventStatusEnum = pgEnum("payment_event_status", [
  "RECEIVED",
  "PROCESSED",
  "FAILED",
]);

export const admins = pgTable(
  "admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    name: varchar("name", { length: 180 }).notNull(),
    shortDescription: varchar("short_description", { length: 320 }),
    description: text("description"),
    priceMinor: integer("price_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
    isActive: boolean("is_active").notNull().default(false),
    stockQuantity: integer("stock_quantity"),
    ...timestamps,
  },
  (table) => ({
    activeCreatedAtIndex: index("products_active_created_at_idx").on(table.isActive, table.createdAt),
  }),
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 240 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productSortIndex: index("product_images_product_sort_idx").on(table.productId, table.sortOrder),
  }),
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }),
    ...timestamps,
  },
  (table) => ({
    phoneIndex: index("customers_phone_idx").on(table.phone),
  }),
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: varchar("reference", { length: 48 }).notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    channel: orderChannelEnum("channel").notNull(),
    status: orderStatusEnum("status").notNull().default("PENDING_PAYMENT"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("UNPAID"),
    currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    deliveryFeeMinor: integer("delivery_fee_minor").notNull().default(0),
    totalMinor: integer("total_minor").notNull(),
    deliveryAddress: text("delivery_address"),
    deliveryCity: varchar("delivery_city", { length: 120 }),
    deliveryRegion: varchar("delivery_region", { length: 120 }),
    deliveryNotes: text("delivery_notes"),
    ...timestamps,
  },
  (table) => ({
    customerCreatedAtIndex: index("orders_customer_created_at_idx").on(table.customerId, table.createdAt),
    statusCreatedAtIndex: index("orders_status_created_at_idx").on(table.status, table.createdAt),
    paymentCreatedAtIndex: index("orders_payment_created_at_idx").on(table.paymentStatus, table.createdAt),
    channelCreatedAtIndex: index("orders_channel_created_at_idx").on(table.channel, table.createdAt),
    createdAtIndex: index("orders_created_at_idx").on(table.createdAt),
  }),
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    productNameSnapshot: varchar("product_name_snapshot", { length: 180 }).notNull(),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalMinor: integer("line_total_minor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orderIndex: index("order_items_order_idx").on(table.orderId),
    productIndex: index("order_items_product_idx").on(table.productId),
  }),
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    provider: paymentProviderEnum("provider").notNull().default("PAYSTACK"),
    providerReference: varchar("provider_reference", { length: 120 }).notNull().unique(),
    amountMinor: integer("amount_minor").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("GHS"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    providerPayload: jsonb("provider_payload"),
    ...timestamps,
  },
  (table) => ({
    orderStatusIndex: index("payments_order_status_idx").on(table.orderId, table.status),
  }),
);

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerEventKey: varchar("provider_event_key", { length: 180 }).notNull(),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    eventType: varchar("event_type", { length: 120 }).notNull(),
    status: paymentEventStatusEnum("status").notNull().default("RECEIVED"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    eventKeyUnique: uniqueIndex("payment_events_provider_key_uidx").on(table.providerEventKey),
    paymentIndex: index("payment_events_payment_idx").on(table.paymentId),
  }),
);

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 120 }).notNull(),
    entityId: varchar("entity_id", { length: 180 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    adminIndex: index("audit_logs_admin_idx").on(table.adminId),
    createdAtIndex: index("audit_logs_created_at_idx").on(table.createdAt),
    rateLimitLookupIndex: index("audit_logs_rate_limit_lookup_idx").on(
      table.entityType,
      table.action,
      table.entityId,
      table.createdAt,
    ),
  }),
);

import { relations } from "drizzle-orm";

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const adminsRelations = relations(admins, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(admins, { fields: [auditLogs.adminId], references: [admins.id] }),
}));
