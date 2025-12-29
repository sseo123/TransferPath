import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite", // D1 is SQLite
  driver: "d1-http", // Use this to connect via the Cloudflare API
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? "",
    token: process.env.CLOUDFLARE_API_TOKEN ?? "",
  },
});
