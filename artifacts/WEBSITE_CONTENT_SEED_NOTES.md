# HCIL website content and demo seed notes

This source bundle adds bilingual About pages and editorial preview articles as typed fixtures. `src/content/seeds/marketing-content-seed.ts` exposes the same records as a schema-neutral seed payload and marks all records as `draft`.

## Why this is not yet a direct SQL insert

The supplied `home-page-kamba.zip` contains frontend source only; it does not include the existing `src/db/schema/content.ts`, the generated migration history or `drizzle.config.ts`. The full repository listing says a content schema already exists and owns pages/blog/forums. Creating replacement tables or guessing its columns could duplicate the content domain and corrupt the migration history.

Before wiring records to Supabase, inspect and map the seed payload to the canonical content-module tables and translation rules. Use stable `seedKey` values (or an equivalent source key) for idempotent upserts. Keep demo records in draft status by default, and publish only after editorial, policy-source and localization review.

## Required integration checks

1. Confirm the actual exports and columns in `src/db/schema/content.ts`.
2. Confirm the canonical locale identifier used by translations (`platform_locales.id` or another FK).
3. Insert/upsert `about` pages and `blog` posts plus EN/FR translations using the existing content module.
4. Preserve source URLs, the `demo` flag, and draft status.
5. Add tests that re-running the seed creates no duplicates.
6. Only after the schema is confirmed, add a seed command under the project's existing migration/seed workflow.
