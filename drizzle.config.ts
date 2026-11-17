import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Set DATABASE_URL before running Drizzle migrations.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
