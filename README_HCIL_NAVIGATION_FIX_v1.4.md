# HCIL Navigation Fix v1.4

This is a two-file source overlay for the HCIL site expansion v1.3. Copy the files into the existing repository, keeping the paths exactly as shown.

## Fixed

- **Language switching preserves the current route**: `/en/about/intelligence` switches to `/fr/about/intelligence`, and vice versa, rather than navigating to the locale homepage.
- Search parameters and URL fragments are preserved for ordinary language-switch clicks.
- Clicking the already-active language does not reload the route or clear the query/fragment.
- The desktop About menu and mobile menu close immediately when a navigation link is selected.
- Native `<details>` menus are also closed after an App Router pathname change, because shared layouts can persist between sibling routes.
- The desktop About dropdown closes when the pointer leaves it and supports Escape-key dismissal.

## Files

- `src/components/site/Header.tsx`
- `src/components/site/LocaleSwitcher.tsx`

## Validation notes

The route-replacement helper was checked against localized root and nested paths. The bundle does not contain `package.json`, the lockfile, or the full app configuration, so a production `next build` was not run here. After overlaying the files, run `npx tsc --noEmit` and `npm run build` in the actual HCIL project, then manually test desktop and mobile navigation in both `/en` and `/fr`.
