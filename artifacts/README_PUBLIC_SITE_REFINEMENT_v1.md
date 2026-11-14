# HCIL public website refinement — v1 implementation patch

## Included
- Compact rounded hero slider with three bilingual editorial slides.
- Published slide content is read from the existing `pages` / `page_translations` / `platform_locales` tables.
- Existing page blocks remain in place; the new slider is inserted above them.
- If published CMS content is unavailable, the homepage uses a local bilingual fallback so the public page remains available.
- Homepage copy is simplified around the value to people and organizations. Technical names are retained where useful but explained in plain language.
- Existing HCIL green/yellow/red palette is preserved.

## Apply
1. Copy the included `src/` files into the repository, preserving the paths.
2. Review `artifacts/0010_homepage_hero_slider_seed.sql`. It adds/updates only the `hero_slider` JSON block in the existing homepage translations; it does not create tables or alter other blocks.
3. First run the SQL in a non-production SQL editor if one becomes available. HCIL currently has a single production database, so review the SQL carefully and export the affected `pages` and `page_translations` rows before running it.
4. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
5. Deploy to Vercel and verify `/en` and `/fr` on mobile and desktop.

## Important limitations
- The uploaded source has a canonical content schema but no editorial CMS interface or content-management service. The slider is database-managed, but this patch does not invent a public write API or grant broad write permissions. Slide changes can initially be made through a controlled database editing workflow. A role-protected editor UI should be a separate implementation after inspecting the existing RBAC permission catalogue and admin routes.
- The uploaded source snapshot contains no production database data, so the seed assumes active `en` and `fr` rows exist in `platform_locales`. Verify this before execution.
- Image URLs are starter editorial assets hosted by Unsplash. Replace them later with approved HCIL media URLs; the database stores the URLs, so no application code change is needed.
- This patch intentionally adds no database migration and does not change auth, RBAC, operational portals or payment workflows.
