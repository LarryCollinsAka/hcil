# HCIL Corporate Website Redesign — Direction & Implementation Plan

**Status:** Approved direction / implementation specification  
**Scope:** Public-facing website only  
**Source baseline:** `hcil_dev(4).zip` (23 November 2026)

## 1. Strategic positioning

HCIL should present itself as a credible, African-founded, globally oriented human-capital and work-intelligence initiative. The public website must explain the value it seeks to create before explaining the technology behind it.

**Core positioning line**

> Connecting human potential to meaningful work — from Cameroon to Africa and the world.

**Supporting message**

HCIL helps people make their capabilities more visible and helps organizations think more clearly about the work they need done, the skills required, and the outcomes that matter.

This is positioning language, not a claim that every described workflow is already generally available.

## 2. Audience and value propositions

### Talent and professionals
- Make practical capabilities easier to understand and demonstrate.
- Build a clearer professional record over time.
- Discover work that fits demonstrated strengths, language abilities and experience.
- Understand expectations and how contributions are evaluated.

### Employers and organizations
- Start with the outcome and the work that needs to be done.
- Describe the capabilities and languages required.
- Structure complex work into clearer responsibilities and deliverables.
- Make delivery expectations and review criteria easier to understand.

### Institutions and development partners
- Explore practical approaches to skills visibility, workforce development and access to meaningful work.
- Understand HCIL's potential contribution in the context of Cameroon, African and global development priorities.
- Distinguish clearly between intended contribution, implemented capabilities and measured outcomes.

## 3. Geographic and visual identity

The website should tell a connected story across three contexts:

1. **Cameroon:** local talent, enterprises, education, multilingual realities and economic opportunity.
2. **Africa:** regional collaboration, entrepreneurship, skills mobility and inclusive growth.
3. **Global:** international organizations, remote collaboration, cross-border work and professional standards.

Photography should show real, contemporary African professionals and organizations alongside diverse international teams. Avoid stereotypical imagery, tokenistic flags, generic futuristic AI art and stock imagery that implies partnerships or customers HCIL does not have.

### Design language
- Preserve HCIL's Cameroon-inspired green, yellow and restrained red palette.
- Use deep green for institutional authority, white and warm neutrals for clarity, yellow for selective emphasis, and red only as a restrained accent.
- Establish generous whitespace, confident typography, strong editorial hierarchy and consistent image treatment.
- Prefer full-bleed editorial photography, purposeful diagrams, restrained line illustrations and clear iconography over excessive floating cards, gradients and decorative blobs.
- Use subtle motion only when it improves comprehension; respect reduced-motion preferences.
- Design mobile layouts intentionally, not as compressed desktop layouts.

## 4. Homepage information architecture

1. **Hero / brand promise** — one clear headline, one short explanation, two audience-specific calls to action and a high-quality image.
2. **Audience pathways** — Talent, Organizations, Institutions / Partners.
3. **The HCIL approach** — a visual sequence: Understand the need → Identify relevant capabilities → Organize the work → Review outcomes → Build a stronger record.
4. **Cameroon to Africa to Global** — geographically grounded storytelling, without implying current operational coverage that has not been verified.
5. **What makes the approach different** — evidence, context, multilingual capability, clear expectations and human accountability.
6. **Intelligence, explained simply** — describe AI as an enabling capability, not the headline product; technical details belong on the dedicated intelligence page.
7. **Development context** — SND30, African Union Agenda 2063 and relevant UN Sustainable Development Goals, with careful wording about potential contribution rather than endorsement or formal alignment.
8. **Insights / journal** — editorial-quality articles with real images and clear categories.
9. **Closing invitation** — distinct next steps for talent, organizations and institutions.

The database-managed hero slider may remain. Each slide should tell a distinct story and use CMS-provided image assets. Keep manual controls, keyboard access, readable contrast and no forced autoplay.

## 5. Public-page design system

| Page | Intended presentation |
|---|---|
| Home | Editorial corporate landing page with clear audience pathways |
| About HCIL | Institutional story, purpose, vision, mission and operating principles |
| Mission and approach | Visual explanation of the human-capital lifecycle and how HCIL intends to work |
| Intelligence | Plain-language explanation first; architecture and AI details as supporting depth |
| Policy alignment | Institutional briefing style with clear geographic layers, careful caveats and source links |
| Trust and governance | Clear commitments, privacy/access principles, human oversight and implementation status |
| Blog / Insights | Professional editorial listing and article layouts |

All pages should share a coherent header, footer, typography scale, content width, spacing system, image language, CTA treatment and responsive behavior.

## 6. Content and claims policy

- Lead with benefits and outcomes; introduce technical terms only when needed and explain them in plain language.
- Keep AI, SND30, African Union and UN references, but explain why they matter to ordinary visitors.
- Do not invent customers, partners, endorsements, certifications, usage statistics, geographic reach, employment outcomes or measured impact.
- Clearly distinguish what is live, what is in limited/early access, what is being developed and what is a future intention.
- Avoid promises of employment, guaranteed work, guaranteed income or guaranteed results.
- Do not describe an AI suggestion as a verified fact or an automated decision as a human-approved decision.
- Preserve the user's confirmed status that English/French language switching works on the public pages and in the Talent Portal. Translation completeness is not an open issue unless a new, reproducible defect is found.

## 7. Source implementation map

The archive's active homepage route is `src/app/[locale]/page.tsx`. It calls `getHomeBlocks()` from `src/content/home.ts` and renders the result through `src/components/home/BlockRenderer.tsx`.

The homepage slider is read from the published CMS `hero_slider` block with a typed fallback. The other homepage sections are currently code-managed. The files under `src/content/homepage/homepage.en.ts` and `homepage.fr.ts` are not used by the active route shown in this archive; do not treat them as the live source of homepage content without tracing a new import/reference first.

Primary implementation targets:
- `src/components/home/HeroSlider.tsx`
- `src/components/home/BlockRenderer.tsx`
- `src/components/home/Highlights.tsx`
- `src/components/home/Steps.tsx`
- `src/components/home/Intelligence.tsx`
- `src/components/home/Principles.tsx`
- `src/components/home/Audiences.tsx`
- `src/components/home/Journal.tsx`
- `src/components/home/Cta.tsx`
- `src/components/site/Header.tsx`
- `src/components/site/Footer.tsx`
- `src/components/site/ui.ts`
- `src/app/globals.css`
- `src/content/home.ts` (English and French copy)
- `src/content/about.ts` and `src/components/about/AboutPageView.tsx` (subsequent public-page phase)

## 8. Protected boundaries

This redesign must not alter:
- Supabase authentication or account provisioning.
- Roles, permissions, RBAC policies or authorization behavior.
- Talent Portal, organization workspaces or dashboard workflows.
- Database schema, migrations, RLS policies, triggers or production records.
- Existing English/French locale routing and language-switching behavior.
- Payment, work, capability, assessment or organization data.

No production SQL should be executed for this visual/content redesign. Do not introduce public write endpoints for CMS content.

## 9. Delivery sequence

### Phase 1 — Homepage
- Establish typography, spacing, surface, button and image rules.
- Refine hero and navigation hierarchy.
- Rework audience pathways and the explanation of HCIL's approach.
- Replace technology-first explanations with value-led content.
- Improve visual storytelling and the closing invitation.
- Produce matching English and French content.

### Phase 2 — Institutional pages
- Redesign About, Mission/Approach, Intelligence, Policy Alignment and Trust.
- Preserve careful caveats and source references.

### Phase 3 — Insights and shared chrome
- Refine blog listing/article layouts, header, footer and shared responsive patterns.

### Phase 4 — Quality assurance
- Run lint, TypeScript and production build.
- Test desktop, tablet and mobile in English and French.
- Check keyboard navigation, focus states, contrast, reduced motion, image loading, links and CTAs.
- Confirm no auth, portal, dashboard, database or RBAC behavior changed.
- Deploy only after explicit user approval; independently verify the production alias and deployed experience.

## 10. Acceptance criteria

- A first-time visitor can explain what HCIL is for within a few seconds without understanding AI or data architecture.
- The homepage makes the Cameroon → Africa → Global story visible without making unsupported reach claims.
- Talent, organizations and institutions can each identify a relevant next step.
- Pages look like one coherent corporate institution rather than disconnected MVP screens.
- Images are relevant, high quality, responsibly representative and have meaningful alt text.
- English and French have equivalent content quality and working language switching.
- Mobile layouts are deliberate, readable and easy to navigate.
- Public claims match implemented capability and are explicit about work in progress.
- Auth, RBAC, dashboards and production data remain untouched.
