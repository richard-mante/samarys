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
    url: "postgresql://neondb_owner:npg_KUDq4XB1gRPu@ep-rough-thunder-beruychb-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
