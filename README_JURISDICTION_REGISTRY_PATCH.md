# HCIL jurisdiction registry foundation patch

This patch adds the first jurisdiction reference schema and a safe, local-only repair for the missing Drizzle `0008` snapshot.

## 1. Copy the files

Extract this patch into the HCIL repository root, preserving paths. It adds:

- `src/db/schema/jurisdiction.ts`
- `drizzle.baseline.config.ts`
- `drizzle.baseline.schema.ts` (excludes the new jurisdiction tables while reconstructing the historical 0008 snapshot)
- `scripts/reconcile-drizzle-snapshots.mjs`
- this README

It also updates `src/db/schema/index.ts` to export the new schema.

## 2. Reconcile the missing snapshot first

Run from the repository root in PowerShell:

```powershell
node scripts/reconcile-drizzle-snapshots.mjs
```

The script generates a complete schema snapshot into the isolated `.drizzle-baseline` directory. It validates that the only tables missing from `0007_snapshot.json` are the five tables already created by `0008_capability_intelligence.sql`. It then creates `0008_snapshot.json` and rebuilds `0009_snapshot.json` as the same schema state, since `0009_guard_assessment_identity_updates.sql` changes only a trigger function.

The script does not connect to Postgres and does not run SQL. It preserves the original `0009_snapshot.json` as `0009_snapshot.json.before-reconcile`.

If validation fails, it stops before changing the migration snapshots. Do not bypass the validation.

## 3. Generate the country/jurisdiction migration

After snapshot reconciliation succeeds, run:

```powershell
npx.cmd drizzle-kit generate --name=country_jurisdiction_registry
```

Review the generated SQL. It should contain only these three new tables and their indexes/constraints:

- `countries`
- `jurisdictions`
- `country_onboarding_schemas`

It must not recreate the five capability-intelligence tables or alter existing identity, organization, or worker-profile records. If it does, stop and share the generated SQL and terminal output.

## 4. Validate locally

```powershell
npx.cmd tsc --noEmit
npm.cmd run lint
```

Do not run `drizzle-kit migrate`, `db:migrate`, or any production SQL during this phase. Country reference-data seeding will be a separate, reviewed migration after the schema is validated.

## Model decisions

- Country code is ISO 3166-1 alpha-2.
- Jurisdictions are hierarchical and country-scoped; their type is reference data, not an authorization role.
- Onboarding schemas are versioned per country and store a JSON object definition. The schema is not itself proof of statutory eligibility and does not make statutory identifiers mandatory for general HCIL participation.
- Country registry data, country onboarding configuration, a worker's current residence, nationality, and an organization's registration country remain separate concepts.
- All three tables have RLS enabled and are intended for trusted server-side access until the platform's read-access policy model is explicitly reviewed.
