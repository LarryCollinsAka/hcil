# HCIL Authentication & RBAC v1

> **Compatibility fix v1.0.1 (Drizzle ORM 0.45.x):** This project uses `drizzle-orm@0.45.3` / `drizzle-kit@0.31.11`. Table declarations use the v0 API `pgTable(...).enableRLS()`. Do **not** change these declarations to `pgTable.withRLS(...)` unless you intentionally upgrade and validate the Drizzle v1 line. This compatibility patch changes TypeScript schema metadata syntax only; it does not relax the RLS policy design or change migration SQL.

**Status:** implementation overlay; not yet validated by a complete install/build against the target deployment.

## Goals

- Authenticate people with Supabase Auth using server-managed cookies and email/password flows.
- Keep account participation separate from permission-bearing roles.
- Support people who participate as talents and also belong to one or more organizations.
- Separate platform-wide authority from organization-scoped authority.
- Support HCIL staff functions and agency operations without treating agency membership as consent to represent a talent.
- Keep privileged role assignment out of public sign-up.

## Domain distinctions

- `profiles` is the person/account projection keyed by `auth.users.id`.
- A `worker_profiles` row means the person participates as a talent. It does not grant permission to access another person's data.
- `organizations` includes employers, staffing/recruitment agencies, NGOs, public-sector bodies, educational institutions, artisan associations, cooperatives and other organizations.
- `organization_members` expresses membership only. Its legacy `role` column is retained for compatibility; `user_role_assignments` plus `access_role_permissions` are the new authorization source.
- `agency_representations` is a separate consent-scoped relationship. An agency member cannot infer representation authority from their agency role.

## Initial role catalogue

### Platform scope

| Role key | Intended use |
|---|---|
| `super_admin` | Full platform authority. Cannot be granted through public sign-up or the role-management screen. |
| `platform_admin` | Platform administration with bounded ability to delegate lower-level operational roles. |
| `chief_operating_officer` | Cross-platform operational oversight; no automatic RBAC/security administration. |
| `operations_manager` | Work operations and assigned coordination. |
| `staff_coordinator` | Assignment coordination and assigned evidence review. |
| `support_agent` | Limited user-support context. |
| `content_editor` | Website/editorial content. |
| `community_moderator` | Community moderation. |
| `finance_manager` | Finance review/reconciliation and reporting. |

### Organization scope

Employer/non-agency roles: `org_owner`, `org_admin`, `org_manager`, `org_staff`, `org_viewer`.

Staffing/recruitment-agency roles: `agency_owner`, `agency_admin`, `agency_manager`, `talent_coordinator`, `recruiter`, `agency_finance`.

Roles are data-backed in `access_roles`; their permissions are explicit rows in `access_role_permissions`. Job titles such as COO are not special-cased throughout the codebase; their permission set defines what they can do.

## Delegation policy in v1

- Initial `super_admin`: one-time private operator bootstrap (`npm run rbac:bootstrap-superadmin`). The script aborts if an active super-admin already exists. It intentionally does not support public self-promotion.
- `super_admin` can delegate `platform_admin`, COO and the other listed operational platform roles through the access screen, but not another `super_admin`.
- `platform_admin` can delegate only `operations_manager`, `staff_coordinator`, `support_agent`, `content_editor`, `community_moderator`, and `finance_manager`.
- Organization owners can delegate their organization's administrator/manager/staff/viewer roles. Organization admins can delegate manager/staff/viewer, not another owner/admin.
- Agency owners can delegate agency admin/manager/coordinator/recruiter/finance roles. Agency admins can delegate the lower-scope manager/coordinator/recruiter/finance roles.
- Owner-role transfer is intentionally not supported by the generic screen. A dedicated transfer process must be designed before that role can move.
- The screen can assign roles only to people who already have an HCIL profile. Email invitations are not part of this overlay.
- Every server action re-checks authorization; hiding a UI control is not considered security.

## Agency representation boundary

The schema and database guard provide the relationship and allowed scopes, including consent fields. The actual consent UI and a dedicated representation service are not implemented in this phase. Do not activate an agency representation until an application service verifies that the authenticated person is the represented talent, records their explicit consent and selected scopes, and supports expiry/revocation. Do not expose private evidence or accept assignments solely because an agency role exists.

## Files added/changed

- Supabase server and browser clients plus Next.js 16 `src/proxy.ts` session refresh.
- Sign-up, sign-in, email callback, password reset/update and check-email pages (English/French locale paths).
- Idempotent profile/talent/organization provisioning.
- Permission checks in `src/modules/identity/application/authorization.ts`.
- Data-driven RBAC schema plus role assignment/revocation service and `/[locale]/workspace/access` screen.
- Audit fields on role assignment rows (`granted_by`, `reason`, `revoked_by`, `revocation_reason`, timestamps).
- One-time super-admin bootstrap script.
- `drizzle/0006_auth_rbac.sql` migration, snapshot and journal entry.

## Configuration

Keep secrets in the local environment only; never commit or share `.env` values.

Required for the Next.js app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the app accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a compatibility fallback)
- `NEXT_PUBLIC_SITE_URL` set to the canonical public origin in deployed environments (for example `https://your-domain.cm`)
- `POSTGRES_URL_NON_POOLING` for migrations/bootstrap is preferred; `POSTGRES_URL` is a fallback for the bootstrap script.

In Supabase Auth URL Configuration, add the exact local callback and production callback patterns you use, including `http://localhost:3000/**` for local development and your canonical domain/preview patterns. The verification and password-reset links must be allowed by the Supabase redirect allow-list.

No Supabase service-role/secret key belongs in client-side code. The browser Supabase client is currently only a utility; application data access is performed server-side.

## Install and apply

1. Extract the overlay into the root of the existing HCIL repository and review the modified files.
2. **Existing-organization preflight:** if this is not a fresh development database, review every current organization before migrating. The migration adds `organization_type` with a default of `employer`; it cannot infer whether an existing organization is a staffing or recruitment agency. If you have existing agencies, first add the column in a preparatory step and update only verified rows before running the migration. For example:

   ```sql
   ALTER TABLE public.organizations
     ADD COLUMN IF NOT EXISTS organization_type text NOT NULL DEFAULT 'employer';

   -- Replace the example predicates with verified organization IDs from your own data.
   UPDATE public.organizations
      SET organization_type = 'staffing_agency'
    WHERE id IN ('<verified-organization-uuid>');
   ```

   Use `recruitment_agency` where appropriate. Do not guess classifications or run the placeholder UUID. Once types are reviewed, the migration's `ADD COLUMN IF NOT EXISTS` is idempotent and role backfill can assign the correct organization-scoped roles. On a fresh database with no organizations, skip this preflight.
3. Because the overlay intentionally does not ship the repository's old lockfile, install dependencies in your local project and update `package-lock.json`:

   ```bash
   npm install @supabase/ssr@^0.12.7 @supabase/supabase-js@^2.57.0
   ```

4. Back up the database and test on a non-production Supabase project first. This migration enables RLS on every existing table in the `public` schema and deliberately creates no direct Data API policies. This is a conservative default-deny posture; browser-based PostgREST queries will fail until explicit least-privilege policies are added.
5. Verify `POSTGRES_URL_NON_POOLING` is available to the migration command. The project config now loads `.env.local` first and falls back to `.env`.
6. Apply the migration:

   ```bash
   npm run db:migrate
   ```

7. Run static/build checks before opening the application:

   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

8. Register your own initial account, confirm the email if Supabase confirmation is enabled, and ensure the profile exists. Then set `HCIL_BOOTSTRAP_SUPERADMIN_EMAIL` temporarily in your private shell environment and run:

   ```bash
   npm run rbac:bootstrap-superadmin
   ```

9. Remove `HCIL_BOOTSTRAP_SUPERADMIN_EMAIL` from the environment after bootstrap. Do not add it to source control.
10. Test sign-up as a talent, business, agency, and combined account; check sign-in/out, email callback, password recovery, unauthorized role assignment, organization scoping, and owner transfer restrictions.

## Important operational caveats

- A complete `npm install`, `tsc`, lint, Next build, migration run and end-to-end Supabase test have **not** been run in this authoring environment. Dependency installation was unavailable here, so this bundle is a prepared implementation overlay, not a verified production release.
- Before production, configure Supabase email templates, redirect allow-list, rate limiting/CAPTCHA strategy, legal/privacy copy, account deletion/anonymization workflow, monitoring and recovery procedures.
- Drizzle connects using the private PostgreSQL URL. Database-owner/superuser connections can bypass RLS; therefore every protected server page/action must invoke the authorization service, and future data mutations must be exposed only through audited server-side commands.
- Do not create broad RLS policies just to make the client work. Design a policy per table and operation, and test against anon, authenticated, and privileged roles.
