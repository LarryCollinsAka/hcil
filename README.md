# HCIL navigation localization patch

Overlay these two files onto the repository:

- `src/components/site/Header.tsx`
- `src/content/site.ts`

Changes:
- Move the full desktop navigation breakpoint from `lg` to `xl`, keeping the compact/mobile menu active at intermediate widths where French labels would otherwise crowd the header.
- Prevent desktop labels from wrapping and slightly reduce horizontal padding and label size.
- Shorten French navigation labels and account actions while retaining the intended meaning.

After applying, run `npm run build` and inspect `/en` and `/fr` at desktop, tablet, and mobile widths. This patch intentionally does not change routes, auth actions, database code, or email configuration. A production build has not been run in this environment.
