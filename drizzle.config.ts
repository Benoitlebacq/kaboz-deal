import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit tourne hors de Next.js : on charge explicitement .env.local.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
