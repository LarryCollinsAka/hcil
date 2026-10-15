# HCIL Drizzle ORM 0.45.3 RLS compatibility fix

## Why the build failed

The HCIL repository's `package.json` / lockfile use `drizzle-orm@0.45.3` and `drizzle-kit@0.31.11`. The RBAC overlay used `pgTable.withRLS(...)`, which belongs to the Drizzle v1 API line and is not exposed by the installed 0.45.x API. The failed table-builder call also removed contextual typing from table callback parameters, which caused the many TS7006 implicit-any errors.

## Fix

For this repository's current dependency line, the eight schema files now declare RLS tables using the compatible v0 syntax:

```ts
export const example = pgTable(
  "example",
  { /* columns */ },
  (t) => [ /* indexes and checks */ ],
).enableRLS();
```

This preserves the intended RLS table metadata while avoiding a major Drizzle dependency upgrade. Do not upgrade to Drizzle v1 just to address this error without a deliberate migration and broader compatibility review.

## Apply the narrow patch

1. Unzip this archive at your HCIL project root.
2. Allow the files under `src/db/schema/` to overwrite the corresponding current files.
3. Run:

```bash
npx tsc --noEmit
npm run build
```

This is a TypeScript API compatibility fix; it does not change the generated RLS SQL or add permissive policies. No new database migration is required solely for this syntax change. Do not regenerate or reapply `0006_auth_rbac.sql` as part of this fix. If that migration has not yet been applied, follow the original RBAC installation guide and test it in staging first.

## Validation performed here

- Converted all 55 `pgTable.withRLS(...)` declarations across eight schema files.
- Transpiled all 30 TypeScript/TSX files in the corrected RBAC overlay; no syntax errors.
- Verified no `pgTable.withRLS` references remain in the schema folder.
- A dependency-aware `tsc` / Next production build could not be run in this environment; please run these checks in the project with its actual dependencies.
