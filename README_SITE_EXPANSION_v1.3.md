# HCIL Website Expansion v1.3

Built on the supplied HCIL homepage refinement v1.2 source. This is an application source overlay, not a complete Next.js project.

## Added

- Homepage intelligence section explaining authoritative records (PostgreSQL), relationship intelligence (knowledge graph), semantic retrieval (Qdrant), and the intended AI orchestrator/shared memory. Copy explicitly states these capabilities are in development.
- About HCIL overview and submenu routes: mission & approach, how intelligence works, policy alignment, trust & governance.
- A bilingual blog index and five bilingual sample articles.
- Official policy links and carefully qualified potential-contribution language for SND30, CEMAC/ECCAS context, AU Agenda 2063, SDGs and the UN Cameroon cooperation cycles.
- Schema-neutral demo content seed payload in `src/content/seeds/marketing-content-seed.ts`.

## Routes

For each locale (`/en`, `/fr`):
- `/about`
- `/about/mission`
- `/about/intelligence`
- `/about/policy-alignment`
- `/about/trust`
- `/blog`
- `/blog/[slug]` for five seeded slugs

All sample posts are labelled editorial/demo content and all framework references say that HCIL is independent, with no implied endorsement.

## Database seed boundary

The uploaded ZIP does not include the actual Drizzle content schema or `drizzle.config.ts`, although the broader repository listing indicates a content module already exists. To avoid duplicating or guessing its tables, this bundle does not execute inserts. The seed payload and `artifacts/WEBSITE_CONTENT_SEED_NOTES.md` define how to wire idempotent upserts against the existing schema. Upload `src/db/schema/content.ts`, `src/db/schema/reference.ts`, `src/db/schema/index.ts`, `src/db/index.ts`, `drizzle.config.ts`, and the content migrations to complete the database seed safely.

## Validation

This bundle should be overlaid onto the full HCIL repository. The bundle itself has no `package.json`/lockfile or dependency installation, so the production build must be run in the actual project. Run `npx tsc --noEmit`, then `npm run build`, and inspect the bilingual pages in a Vercel Preview. The static routes use Next.js App Router APIs for Next 15/16 (`params` as a Promise).
