import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_KUDq4XB1gRPu@ep-rough-thunder-beruychb-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
});
