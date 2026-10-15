# HCIL Separate Auth Portals v1

## Why

Talent, business/employer, and agency users have different motivations and onboarding information. This patch gives them separate, localized sign-in and sign-up experiences while preserving one Supabase Auth identity and the existing role/permission model.

## Routes

- `/{locale}/talent/sign-up` and `/{locale}/talent/sign-in`
- `/{locale}/business/sign-up` and `/{locale}/business/sign-in`
- `/{locale}/agency/sign-up` and `/{locale}/agency/sign-in`
- `/{locale}/auth/sign-up` and `/{locale}/auth/sign-in` remain as portal-selection pages for existing header links.

Supported locales remain `en` and `fr`.

## Core decisions

- Signup type is fixed by the route and server action; there is no editable `account_type` select.
- Talent signup does not ask for an organization.
- Business signup asks for organization name/type.
- Agency signup asks for agency name and restricts type to staffing or recruitment agency.
- Existing account identity is shared. A person should not register multiple accounts just to participate in multiple ways; a later onboarding flow should attach additional participation types to the existing profile. That multi-participation self-service flow is not part of this patch.
- A portal is an entry view only and never grants authorization by itself. Every permission remains enforced via the RBAC model.
- Agency signup does not grant representation rights. Representation still requires a separate consent/service flow.
- The common workspace remains the current post-login destination; portal-specific operational dashboards are future work.
- Forgot-password, update-password and email-confirmation links preserve the selected portal where applicable.
- Existing public `/auth/sign-in` and `/auth/sign-up` URLs remain valid but become chooser pages, preserving Header compatibility.

## Apply

Extract this patch into the root of the existing HCIL repository, overwriting matching paths. Do not include or replace `.env`, `.env.local`, `node_modules`, or user-local credentials.

Then run:

```powershell
npx tsc --noEmit
npm run lint
npm run build
```

## Smoke tests

1. `/en/auth/sign-up` and `/fr/auth/sign-up` show three distinct options.
2. Each signup page renders only its relevant fields and submits to a fixed server action.
3. Talent signup does not create an organization; business signup creates an organization with an appropriate type; agency signup preserves `staffing_agency` versus `recruitment_agency`.
4. All sign-in pages use the same Supabase Auth users and route to the shared workspace with a non-authoritative `portal` query parameter.
5. Password reset and email confirmation return to the selected portal.
6. Try a user who has only a talent profile signing in through the business portal: the user may authenticate, but the portal must not give them any organization permission. This is expected; permissions remain in the server-side RBAC checks.
7. Confirm an existing business/agency account still works with its previously stored metadata.
8. Check mobile layout and both languages.

## Validation status

This is a source overlay assembled against the HCIL archive and the corrected Drizzle 0.45.3 RBAC overlay. It has not been validated by `next build`, by the local Supabase project, or by end-to-end browser tests in your environment.
