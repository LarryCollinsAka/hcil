# HCIL duplicate-signup hardening patch

## Files
- `src/modules/identity/auth/actions.ts`
- `src/components/auth/PortalAuthPage.tsx`

## Changes
1. Detect Supabase `user_already_exists` signup errors and redirect to the portal sign-in page with a neutral `user-exists` message.
2. Detect the Supabase email-enumeration-protection response (`data.user.identities` is an empty array) before checking for a session or routing to email confirmation.
3. Do not provision an HCIL profile or show the new-account confirmation screen for that duplicate response.
4. Add English and French neutral copy. The copy does not confirm whether an email address is registered.
5. Remove the raw Supabase error message from signup logs; retain the error code and portal for diagnostics.

## Apply
Copy the two files into the matching locations in the project, review the diff, then run the project's normal typecheck, lint, and production build. Do not run database migrations for this patch.

## Important scope
This patch does not change `access-actions.ts` (role assignment/revocation), profile provisioning, database schema, or Supabase Auth configuration. It assumes the project's Supabase Auth response follows the documented empty-identities duplicate-signup behavior. Verify both email-confirmation settings in a non-production test project before release.
