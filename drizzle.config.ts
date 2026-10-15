// drizzle.config.ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read Next's env files on its own. Prefer local overrides,
// then fall back to the repository's .env without overwriting values already loaded.
config({ path: ".env.local" });
config({ path: ".env", override: false });

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.POSTGRES_URL_NON_POOLING! },
});