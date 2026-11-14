# HCIL public-site refinement — implementation handoff

## Included in this patch

- Adds bottom spacing to the compact rounded homepage hero: `pb-6` (24px) on mobile and `sm:pb-8` (32px) from the small breakpoint upward. Existing top spacing, hero dimensions, rounded corners, palette and following section are unchanged.
- Adds a read-only preflight for canonical languages/locales and homepage CMS records.
- Adds an idempotent bootstrap + slider seed script for the existing `languages`, `platform_locales`, `pages` and `page_translations` tables.

## Important production safeguards

- This is **not** a Drizzle schema migration. No tables, columns, indexes, policies or triggers are created or altered.
- The SQL writes only English/French language and locale reference rows plus the homepage and its two translations. It does not write to `profiles`, Supabase Auth, organizations, workers, roles, permissions, capability records, payments or work records.
- Existing language/locale rows are not overwritten. French fallback is populated only if currently null.
- On an existing homepage translation, the script replaces only the `hero_slider` block and preserves other blocks. It also preserves the existing translation's `status` and `published_at`; an existing draft will remain a draft. A newly inserted translation is published so the database slider can render.
- The original `0010_homepage_hero_slider_seed.sql` is retained for reference but should **not** be run. Use the new combined script only after reviewing its preflight output.
- Since Production has no recoverable backup, do not execute the seed until the preflight output, current profile locale references, RLS status and audit-trigger behavior have been checked. The source schema documents a `taxonomy_audit()` trigger, but the uploaded migration SQL only creates `taxonomy_audit_log`; it does not visibly define that trigger/function. The new preflight queries the live trigger catalog. Treat missing audit triggers as a release blocker and resolve the migration/source discrepancy before inserting canonical reference rows. The transaction rolls back on SQL errors, but it is not a substitute for a backup.

## Application behavior verified from source

- `src/app/[locale]/page.tsx` forces dynamic rendering and calls `getHomeBlocks(locale)`.
- `src/content/home.ts` reads a published `hero_slider` block from `pages` / `page_translations` / `platform_locales`, validates each slide, and falls back to typed English/French slides if the CMS row is absent or unavailable.
- The rest of the homepage remains code-managed; this database seed does not move every homepage section into the CMS.
- The CMS schema has no editor interface in this source snapshot. Slide edits currently require a controlled database workflow; do not expose a public write endpoint.

## Verification to run in the full repository

From PowerShell in the HCIL project root:

```powershell
npm run lint
npx.cmd tsc --noEmit
npm run build
```

Then verify `/en` and `/fr` at mobile and desktop widths, confirm 24px/32px spacing below the slider, keyboard-operate the slider, and verify the code fallback by testing against a non-production database without published slider content.

This archive is a focused source/artifact patch, not a complete application repository. No production SQL has been executed and no deployment has been performed. Full lint/typecheck/build were not run in this extraction because dependencies were not installed.
