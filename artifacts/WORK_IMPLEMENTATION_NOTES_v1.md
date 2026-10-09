# Work implementation notes v1

`work.ts` is designed for the current HCIL module layout and assumes these exports exist:

- `identity.ts`: `profiles`, `workerProfiles`, `organizations`
- `reference.ts`: `languages`, `capabilities`
- `_shared.ts`: `createdAt`, `updatedAt`, `valuesIn`

Before migration generation, run TypeScript compilation. If the identity module uses different export names, only the import symbols in `work.ts` should need adjustment; the database model itself does not change.

## Important implementation choices

- `package_type` is intentionally absent. Leaf status is derived from children.
- `work_package_language_requirements` uses one row per language modality.
- `assignments` belongs to Work and uses an opaque `source_match_id` instead of a Matching FK.
- `submissions` are immutable and contain only `assignment_id`, not a duplicated `work_package_id`.
- `acceptances.quality` is constrained to 0..1.
- Cross-row invariants are implemented in `0002_work_guards.sql`.
- The milestone budget invariant is deferred to transaction commit.
- Assignment payout amount is authoritative in Work; Payments should read it when handling `work.deliverable_accepted`.
- Event names follow `module.event` snake_case convention.
