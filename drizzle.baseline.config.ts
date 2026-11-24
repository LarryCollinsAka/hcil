// Temporary isolated output used only to reconstruct the missing 0008 snapshot.
// This file never points at the production database and does not change drizzle.config.ts.
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle.baseline.schema.ts",
  out: "./.drizzle-baseline",
  dialect: "postgresql",
});
