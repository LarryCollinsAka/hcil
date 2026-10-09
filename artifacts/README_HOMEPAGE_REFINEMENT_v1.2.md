# HCIL homepage refinement v1.2

This bundle refines the supplied `home-page-kamba.zip` source without redesigning its visual direction.

## Changes

- Public brand now reads `HCIL` from `src/config/brand.ts` (one place to change it later).
- The yellow highlights band now communicates four product commitments instead of unsupported statistics.
- Copy now distinguishes milestone funding from contributor payout: milestones group packages; each contributor's agreed payout is intended to follow acceptance of their own assigned package.
- Removed the illustrative `XAF 250,000 released` statement.
- Added clear early-access language: core workflows and payment processing are not presented as live.
- Language messaging now distinguishes the available English/French homepage from broader platform-language support planned feature by feature.
- Primary CTAs navigate to the employer/talent sections already on the page; secondary audience CTAs navigate to explanatory sections.
- Removed navigation links to routes not included in the supplied source (`/sign-in`, `/get-started`, `/blog`, `/forum`, `/about`, `/privacy`, `/terms`). The header now uses in-page navigation until those routes exist.
- Footer links now target sections present on the homepage.
- Localized navigation accessibility labels for English and French.

## Integration

Overlay the included `src/` files onto the existing HCIL repository, reviewing the changed files before committing. This is a homepage/source overlay, **not a complete Next.js project**: the uploaded ZIP did not contain `package.json`, lockfile, Drizzle config or the rest of the app's project-level configuration, so they are not included here.

## Checks run in this sandbox

- TypeScript/TSX syntax transpilation: 23 files, no syntax errors.
- Strict TypeScript checks on content contracts and all supplied source using local declaration stubs: passed.
- English/French homepage block shape: both contain the same 8 block types in the same order.
- Primary/audience CTA fragments: resolve to section IDs present in the supplied page/layout.
- Checked for previous XAF release copy and hard-coded links to missing routes: none remain.
- `globals.css` parses with PostCSS.

A production `next build` was **not** run because the supplied ZIP lacks the package manifest and installed project dependencies. Run `npm run build` in the full HCIL repository after applying the overlay.

## Product truth

The homepage describes the intended HCIL model. It explicitly states that work intake, matching, contracts and payment processing are still under development; example data is illustrative and should not be interpreted as live transactions.
