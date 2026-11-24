# HCIL Corporate Homepage Redesign — v1

This package continues from `HCIL_neuroinclusive_foundation_v1.zip` and implements the first corporate homepage design pass.

## What changed

- Reworked the database-managed hero slider presentation into a large editorial, photo-led split layout.
- Kept the carousel manual-only: no autoplay, with previous/next and slide selection controls.
- Localized the carousel's control labels and region strapline for English and French.
- Reframed homepage audience pathways around three groups: talent, organizations, and institutions/development partners.
- Added a Cameroon / Africa / Global storytelling section with photographic cards.
- Simplified the homepage intelligence section copy to emphasize user and organizational outcomes before technical implementation language.
- Reworked the highlights, process, principles, language, editorial and closing CTA sections into a calmer corporate visual system.
- Added inclusive-by-design as an explicit HCIL principle in English and French.
- Refined the public header from a floating pill treatment to a cleaner institutional navigation bar.
- Preserved the accessibility preferences layer from the preceding package.

## Important content and architecture notes

- The homepage still reads its published hero slides from the existing CMS/database tables at request time. This pass changes how those slides are presented; it does not update published database content.
- The rest of the homepage copy remains in the typed English/French fallback content in `src/content/home.ts`.
- The new institution pathway links to the existing `/about/policy-alignment` page.
- Images are referenced through existing Unsplash-hosted image URLs. Confirm image loading, licensing/usage suitability, and final image selection before production release.
- Wording intentionally distinguishes HCIL's direction and in-development capabilities from released functionality. Do not publish operational or impact claims without verification.
- No database schema, migrations, authentication, RBAC, Talent Portal, workspace dashboards, or production deployment was changed.

## Verification

- Targeted TypeScript check of the edited homepage components passed using temporary type stubs for unavailable framework dependencies.
- Full project build and lint were not run: `npm ci --ignore-scripts --no-audit --no-fund` timed out, and the local dependency cache did not contain all locked packages.
- Visual browser testing was not performed. Check desktop/mobile layout, image loading, carousel controls, English/French content, keyboard access, reduced motion, contrast, and screen-reader announcements after installing dependencies and running the application.

## Main files changed

- `src/components/home/HeroSlider.tsx`
- `src/components/home/Audiences.tsx`
- `src/components/home/Regions.tsx` (new)
- `src/components/home/BlockRenderer.tsx`
- `src/components/home/Highlights.tsx`
- `src/components/home/Steps.tsx`
- `src/components/home/Intelligence.tsx`
- `src/components/home/Principles.tsx`
- `src/components/home/Languages.tsx`
- `src/components/home/Journal.tsx`
- `src/components/home/Cta.tsx`
- `src/components/site/Header.tsx`
- `src/content/home.ts`
- `src/content/types.ts`
