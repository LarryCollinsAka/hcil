# HCIL Auth + Dashboard Refinement Patch

This patch targets the `hcil(2).zip` repository snapshot (Next.js App Router, Supabase Auth, Drizzle, Tailwind v4).

## Included

- Password show/hide controls on sign-in, sign-up, and reset-password forms.
- New password policy: at least 8 characters, with at least one letter, one number, and one symbol. Server actions enforce the rule for sign-up and password reset; the client shows live requirements and a strength progress indicator.
- French and English labels for password rules and workspace navigation.
- Workspace-specific chrome so the public website header/footer are hidden inside `/[locale]/workspace`.
- A unique workspace header, sidebar, mobile navigation, profile/sign-out panel, language switcher, and HCIL-only footer.
- Distinct navigation and overview cards for Talent, Business/Employer, and Agency portals.
- Authenticated placeholder section pages for sidebar routes, making navigation functional while clearly marking unfinished domain workflows.
- Access administration wrapped in the workspace shell while preserving existing RBAC checks and actions.

## Apply

1. Back up your current repository or create a branch.
2. Extract the ZIP at the repository root. The ZIP preserves `src/...` paths; merge/overwrite only the listed files.
3. Review the diff before committing.
4. Run `npm ci` and `npm run build` in your own environment.
5. Test both `/en` and `/fr`, sign-in, sign-up, forgot-password/reset-password, each portal's workspace, mobile sidebar, and access administration as a permitted account.

## Password policy

The server validates `password.length >= 8`, at least one ASCII letter, at least one digit, and at least one non-alphanumeric symbol. Existing accounts are not forced to change their password at sign-in; the policy applies when setting a new password. Supabase remains responsible for password hashing and authentication.

## Dashboard behavior

Portal selection changes the dashboard experience only; it does not grant roles or permissions. Sensitive access management remains protected by existing authorization checks. Section pages are UI scaffolds, not implemented business workflows. Metric values that are not backed by implemented domain data are shown as `—`, rather than invented counts.

## Validation status

This patch was assembled against the supplied source snapshot. A dependency install/build could not be completed in the packaging environment because `npm ci` timed out, so please run the build in the project's normal development environment before deployment. No secrets or API keys are included in this patch.
