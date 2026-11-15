# HCIL Jurisdiction, Institutional Trust and Financial Readiness Implementation Plan

Status: implementation planning baseline
Target branch: `feat/jurisdiction-onboarding-baseline`
Base commit: `642a20615a1d6a40943126ce95c02bf476e862b6`
Production database: read-only during this phase

## 1. Objective

Implement the approved country-aware onboarding, statutory-identifier safeguards, organization verification, institutional authority, public-service facilitation, portal participation, and payment-readiness capabilities without weakening existing authentication, identity, or RBAC.

This plan is deliberately sequenced as vertical slices. Each slice must have a traceable requirement, business rule, data model, service boundary, tests, migration, release check, and rollback procedure.

## 2. Non-negotiable business rules

### COU-001 — Current residence governs onboarding

A talent's current country of residence selects the applicable onboarding schema and local onboarding rules. A residence change creates a new effective-dated residence record; it does not overwrite the prior residence history. Nationality, where relevant, is a separate attribute.

### EQR-001 — Statutory identifiers are not capability signals

The absence of a taxpayer identifier, national identification number, social-insurance registration, or equivalent statutory identifier must not, by itself, reduce capability scores, ranking, visibility, or eligibility for ordinary opportunities. A statutory identifier may be required only for a particular lawful service, engagement, or opportunity.

This rule must be enforced in persistence, service validation, AI prompt construction and output validation, matching/scoring, employer filters, eligibility checks, admin review, and analytics.

### IDV-001 — Formal assessment identity verification is not statutory registration

The existing `identity_verifications` table and `assessment_attempt_identity_guard` protect formal capability assessments. They must not be reused as the statutory identifier vault or as proof of tax/social-insurance registration.

### ORG-001 — Organization KYC and financial readiness are separate

Organization legal/identity verification is distinct from payment-method verification and escrow readiness. Employers and recruitment agencies share the same financial-readiness gate before escrow transactions. Evidence requirements may vary by legal form and activity.

### GOV-001 — Institutional authority is verified and scoped

Government institutions require independent verification. An officer receives only institution-scoped permissions after an authorized assignment. Authority category is classification, never a permission grant.

### PUB-001 — HCIL facilitates public services; authorities issue official outcomes

The workflow is: talent request → explicit consent → institutional routing → officer review → decision → notification → completion. Without an official integration, the service must be labelled assisted referral or information-only, never official submission. Only the competent authority issues statutory registration or official documents.

### FIN-001 — Payment states are not interchangeable

Payment method verified ≠ escrow funded. Escrow funded ≠ milestone accepted. Milestone accepted ≠ funds released. A licensed and supported payment/escrow provider and applicable country constraints must be established before live escrow is enabled. HCIL stores provider references and masked metadata only, never raw card or bank credentials.

### PORTAL-001 — Portal is a participation context, not an identity or role

One HCIL identity may participate in multiple portal contexts. Portal selection does not grant authority. Permissions remain separately scoped through the existing RBAC system.

## 3. Existing-system constraints

- Preserve Supabase Auth identity and current profile IDs.
- Preserve existing organization membership and RBAC assignment semantics.
- Do not infer authority from user metadata, portal choice, organization type, or membership labels.
- Keep the existing assessment identity-verification guard intact.
- Do not use the context-only SQL export as a migration.
- Do not journal or run the duplicate `0008_infrastructure_outbox.sql`; outbox tables already belong to the initial migration.
- Reconcile the missing `0008` Drizzle snapshot before generating a new Drizzle migration. The current `0009_snapshot.json` does not include five capability-intelligence tables that exist in the live schema.
- All 60 production public tables were reported RLS-enabled with no policies by the Supabase security advisor. Before changing policies, establish the actual server-only data access model and inspect grants, exposed schemas, service-role boundaries, and all data paths.
- Inspect and remediate the mutable search path on `hcil_guard_assessment_identity`, SECURITY DEFINER access to `taxonomy_audit()`, and leaked-password protection configuration as separate security work items.

## 4. Delivery sequence

### Phase 0 — Reproducible baseline and safety controls

1. Capture local working-tree status and exact local commit; do not overwrite uncommitted work.
2. Reconcile GitHub migration journal, SQL files, snapshots, and live Drizzle migration ledger.
3. Reconcile current Drizzle schema exports with live production tables, columns, constraints, indexes, functions, and triggers.
4. Document server-only database access and RLS/grant model.
5. Record production recovery limitations and require a tested recovery strategy before production DDL or data writes.
6. Establish local disposable PostgreSQL test instructions and CI checks.

Exit: baseline report reviewed; migration generation is deterministic; no production writes.

### Phase 1 — Jurisdiction reference and residence history

Proposed tables: `countries`, `jurisdictions`, `country_onboarding_schemas`, `talent_residences`, `onboarding_cases`.

- Seed only authoritative country/jurisdiction reference data through a separately reviewed idempotent data migration.
- Validate ISO country codes and effective date ranges.
- Enforce at most one current residence per talent.
- Preserve historical residence rows.
- Make onboarding schema versions immutable once an onboarding case is submitted.
- Keep residence separate from nationality and organization country.
- Change signup provisioning so country is explicitly collected/validated; do not silently default a person's residence to Cameroon.

Exit: tests cover first residence, residence change, overlapping effective dates, schema-version immutability, and idempotent signup. No country-specific statutory field is mandatory unless the applicable lawful service requires it.

### Phase 2 — Statutory identifier vault

Proposed tables: `statutory_identifier_types`, `talent_statutory_identifiers`, `identifier_verification_cases`, `identifier_access_events`.

- Store encrypted/tokenized values only, using a managed key service and key versioning.
- Use a keyed HMAC blind index for duplicate detection; do not use plain hashes for predictable identifiers.
- Restrict decrypt operations to a dedicated server-side service with audited purpose and least privilege.
- Keep raw values out of profile columns, Auth metadata, logs, traces, analytics, AI prompts, Qdrant, and general search indexes.
- Do not activate collection until encryption/KMS configuration, rotation, access audit, retention, and deletion/legal-hold procedures are tested.
- Missing identifiers remain neutral for capability, ranking, visibility, and ordinary opportunity matching.

Exit: security tests prove no raw identifier reaches logs, browser payloads, AI inputs, analytics, or search; equity tests prove missing IDs do not change ordinary opportunity scores.

### Phase 3 — Organization verification and institutional authority

Proposed tables: `regulatory_authorities`, `organization_verification_cases`, `organization_verification_evidence`, `compliance_assessments`, `institution_authorizations`, `institution_officer_assignments`.

- Reuse existing `organizations` and `organization_members`.
- Keep KYC evidence and financial readiness independent.
- Support NGO and public-sector organization types without deriving permissions from type.
- Verify government institutions independently.
- Assign officers to an institution with explicit scope, validity dates, grantor, and revocation audit.
- Map authority categories (general government, social insurance/identity, tax) to service domains only; never treat category as a permission.

Exit: organization owners cannot self-approve institutional authority; officers cannot access another institution's cases; revocation is effective immediately.

### Phase 4 — Public-service facilitation

Proposed tables: `public_services`, `public_service_requests`, `public_service_request_events`.

- Require explicit, purpose-specific consent before routing personal information.
- Use a state machine with append-only events and authorized transitions.
- Distinguish `OFFICIAL_INTEGRATION`, `ASSISTED_REFERRAL`, and `INFORMATION_ONLY`.
- Record authority routing, decision provenance, notifications, and completion.
- Never claim an official submission or statutory issuance without a verified integration and authority response.

Exit: consent withdrawal, rejection, referral, retry, and officer reassignment are tested and auditable.

### Phase 5 — Payment verification and escrow readiness

Proposed tables: `payment_provider_accounts`, `organization_payment_methods`, `payment_verification_cases`, `escrow_accounts`, `escrow_transactions`, `escrow_allocations`, `escrow_events`, `payment_disputes`.

- Select a licensed/supported provider per operating country before enabling transactions.
- Store opaque provider references and masked metadata only.
- Verify signed webhooks, idempotency, reconciliation, refunds, disputes, and allocation concurrency.
- Require the same financial-readiness gate for employers and recruitment agencies.
- Keep funding, milestone acceptance, and release as distinct state transitions.
- Do not represent HCIL as holding client funds unless the legal and provider model explicitly permits it.

Exit: provider sandbox contract tests, webhook replay tests, duplicate-event tests, reconciliation tests, dispute/refund tests, and concurrency tests pass.

### Phase 6 — Portal participation and UX

Proposed tables: `portal_registry`, `profile_portal_contexts`.

- Add distinct NGO and Government portal experiences.
- Preserve existing Talent, Business, and Agency portal paths during migration.
- Portal context is not an RBAC role; context selection never grants permissions.
- Ensure multi-context users can switch context without creating duplicate identities.

Exit: portal authorization tests cover multi-context users, organization-scoped access, institutional officer scope, and revoked memberships.

## 5. Migration and release controls

- Generate migrations only after the journal/snapshot chain is repaired and reproducible.
- Use additive migrations first; avoid destructive rename/drop operations.
- Run migrations against disposable local PostgreSQL and a non-production environment before release.
- Capture pre/post schema inventories and migration ledger hashes.
- Production release requires a verified backup/restore or tested recovery strategy, maintenance/rollback plan, explicit deployment window, and a final approval of the exact migration.
- Never use `drizzle-kit migrate` against production as an exploratory step.
- Do not apply schema or seed changes through the Supabase SQL editor as an untracked shortcut.

## 6. Required verification

For every phase:

- Unit tests for business rules and state transitions.
- Integration tests for database constraints, transaction boundaries, idempotency, and authorization.
- Security tests for RLS/grants, cross-tenant access, privilege escalation, secret/PII leakage, and audit completeness.
- Equity regression tests for statutory-identifier neutrality.
- `npm run lint`, TypeScript typecheck, `npm run build`, and migration consistency checks.
- Review generated SQL and rollback strategy.
- Conventional Commit with Why / Changes / Security / Testing / Deployment sections.
- Production smoke tests after approved release.

## 7. Current execution boundary

The Supabase project is on a plan that does not support database branching. A development branch was not created. Do not upgrade or create paid infrastructure without a separate explicit cost decision. Work may continue in the Git feature branch and local disposable PostgreSQL; no production DDL, DML, seeds, or deployment is authorized by this document.
