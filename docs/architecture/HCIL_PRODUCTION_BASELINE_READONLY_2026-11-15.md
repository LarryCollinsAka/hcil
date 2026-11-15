# HCIL Production Read-only Baseline Findings

Date: 2026-11-15
Project: HCIL Supabase project `abkqhpkcpnlhwlcjdwkg`
Repository: `LarryCollinsAka/hcil`
Feature branch: `feat/jurisdiction-onboarding-baseline`
Repository base commit: `642a20615a1d6a40943126ce95c02bf476e862b6`

## Scope and safety

This inspection used SELECT-only SQL against the production database and read-only GitHub fetches. No production DDL, DML, permission changes, seeds, migration application, or deployment were performed. Supabase database branching is unavailable on the current plan; no database branch exists.

## Confirmed migration state

The production Drizzle ledger `drizzle.__drizzle_migrations` contains ten rows, IDs 1–10, corresponding to the repository journal entries 0000–0009. The latest row is migration 0009 with timestamp `1794617714189`. The ledger includes migration 0008 at `1793000000000`.

The current repository journal has entries 0000 through 0009. The repository snapshot set has 0000–0007 and 0009, with no 0008 snapshot. The current 0009 snapshot therefore needs reconciliation with the schema created by migration 0008 before generating another Drizzle migration. Do not edit the production ledger or generate a new migration from an unverified snapshot chain.

## Confirmed RLS and table grants

A catalog query found 60 ordinary tables in the public schema. All 60 have RLS enabled and zero policies.

The role grant summary from `information_schema.role_table_grants` is:

| Role | Tables with any grant | SELECT grants | Total table grants |
|---|---:|---:|---:|
| anon | 60 | 60 | 420 |
| authenticated | 60 | 60 | 420 |
| service_role | 60 | 60 | 420 |

Interpretation:
- RLS enabled with no policies means ordinary `anon` and `authenticated` access through RLS is denied for those tables, despite table privileges.
- The broad table grants are still a least-privilege concern and increase the importance of confirming exposed schemas, role memberships, RPC functions, views, and all direct database access paths.
- Do not add broad RLS policies to make the advisor quiet. Determine the intended server-only access architecture and define the minimum grants/policies required by actual app behavior.
- Confirm service-role credentials never reach browser bundles or client-side code. Inspect every database import boundary and route/server action.

## Function security observations

### `public.taxonomy_audit()`

- SECURITY DEFINER: true.
- Function-level setting: `search_path = ''`.
- Owner: postgres.
- Catalog reports EXECUTE granted to anon and authenticated.
- Definition writes to `public.taxonomy_audit_log` and obtains actor identity from `auth.uid()`.
- This is a trigger function; PostgreSQL trigger functions cannot be invoked as ordinary scalar RPC functions. The EXECUTE grant alone does not establish that a PostgREST caller can invoke it as an RPC. Still verify trigger attachment, exposed function behavior, grants, and audit integrity. Revoke unnecessary execute grants only after validating trigger semantics and deployment role ownership.

### `public.hcil_guard_assessment_identity()`

- SECURITY DEFINER: false.
- No fixed function-level search_path setting.
- Owner: postgres.
- Catalog reports EXECUTE granted to anon and authenticated.
- It is a trigger function that protects formal assessment status transitions by requiring a valid, consented identity-verification record for the candidate.
- Inspect trigger attachment and dependencies before changing its search path or ACL. Do not repurpose this table or guard for tax, national-ID, or social-insurance registration.

## Application source observations

Current repository source confirms:
- Database access is initialized in `src/db/index.ts` using the Postgres.js driver and `POSTGRES_URL`.
- Supabase SSR client in `src/lib/supabase/server.ts` uses the public publishable/anon key for Auth session handling.
- Account provisioning currently hardcodes `countryCode: "CM"` for worker profiles and organizations.
- The current auth portal list is `talent`, `business`, and `agency`; NGO and Government do not yet have separate portal contexts.
- Existing `identity_verifications` are explicitly intended for formal capability assessments and store provider references/decisions, not raw document numbers.
- `learning_roadmaps` and the other capability-intelligence tables are RLS-enabled in Drizzle source.

## Required next investigations

1. Inventory effective privileges, including inherited role memberships, schema USAGE, sequences, views, materialized views, and function EXECUTE.
2. Inventory public-schema RPC exposure and all SECURITY DEFINER functions, including function ACLs and search_path.
3. Map every server/client import of `@/db`, `postgres`, Supabase clients, and any service-role key use.
4. Inspect all table triggers and verify audit/guard triggers are attached to the intended tables.
5. Reconstruct and validate the missing 0008 Drizzle snapshot and reconcile 0009 snapshot with live production schema.
6. Obtain a verified recovery method before any production DDL or DML. Current project recovery/backup capability has not been established.
7. Ask for safe local command outputs (working tree status and HEAD) before instructing local branch integration or overwriting files.

## Stop conditions

No production migration, data seed, privilege change, RLS policy change, function replacement, or deployment until:
- the local and remote working states are known;
- schema/migration parity is established;
- a tested backup/restore or other recovery plan is available;
- the change has passed disposable-database validation;
- the exact release artifact and rollback plan have been reviewed.
