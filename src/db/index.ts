import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured. Use your Neon pooled connection string.");
}

const globalForDatabase = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
};

// Vercel functions use Neon's pooled endpoint. One connection per warm
// function instance keeps connection use bounded as the app scales.
// prepare:false is required for PgBouncer transaction-pooling compatibility.
const clientOptions = {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30,
} as const;

const client =
  globalForDatabase.postgresClient ??
  postgres(connectionString, clientOptions);

// Reuse the client across development hot reloads. Production warm instances
// reuse the module-scoped singleton.
if (process.env.NODE_ENV !== "production") {
  globalForDatabase.postgresClient = client;
}

export const db = drizzle(client, { schema });
