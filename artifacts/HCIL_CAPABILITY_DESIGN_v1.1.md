# HCIL Capability Domain v1.1 (final proficiency and evidence model)

**Status:** frozen for MVP. Supersedes `HCIL_CAPABILITY_DESIGN_v1.md`. Schema: `src/db/schema/capability.ts`; integrity SQL: `custom-migrations/0002_capability_integrity.sql`.

## Purpose

The `capability` module answers four questions:

1. What can a worker currently demonstrate, per capability?
2. What evidence supports that?
3. What assessments exist, and what happened in each attempt?
4. What language proficiency can a worker demonstrate, per modality?

It never produces a universal talent score. Suitability for a particular piece of work is decided by `work` (requirements) and `matching` (fit).

## Ownership

Owns: evidence, worker capability and language projections, assessment definitions, versions, attempts and results.

Reads: `reference` (capabilities, languages) and `identity` (profiles).

Schema files may import `reference` and `identity` tables **only to declare foreign keys**. Application code in this module reaches those modules through their query functions. `capability` declares no foreign keys into `work`, `matching` or `payments`; evidence and attempts point at work context through opaque `context_type` / `context_id` columns (both set or both null).

## Core rules

1. Current state is a projection. `worker_capabilities` and `worker_language_proficiency` are rebuildable from evidence.
2. Evidence is append-only. Nothing is updated or deleted. Mistakes are corrected with a retraction plus new evidence.
3. Projections are written only by the capability projector, in the same transaction as the evidence they derive from. An administrator's adjustment is recorded as evidence of kind `admin_adjustment`.
4. Evidence attaches only to `active` capabilities and `active` languages.
5. No `overall_level` and no per-worker aggregate score anywhere.
6. History tables reference profiles with ON DELETE RESTRICT. Profiles are anonymized, never deleted.

## Scales

**Capability level, 0 to 5** (one rubric for evidence, projection and, later, work requirements):

| Level | Meaning |
|---|---|
| 0 | Attempted, not demonstrated |
| 1 | Foundational: knows the concepts, needs guidance |
| 2 | Working: routine tasks with some supervision |
| 3 | Proficient: independent and reliable on standard work |
| 4 | Advanced: complex or novel work, reviews others |
| 5 | Expert: sets standards, handles edge cases, teaches |

A missing projection row means "not established" (unassessed). Level 0 exists only as evidence of an attempt that did not demonstrate level 1, so a failed assessment can lower a projection. Evidence stores whole levels. Projections store a decimal 0.00 to 5.00 (languages 0.00 to 6.00). Per-capability anchor descriptions are added later, before assessments are authored for that capability.

**Language level, 0 to 6** per modality: 0 none, 1 A1, 2 A2, 3 B1, 4 B2, 5 C1, 6 C2. Stored as integers; codes are mapped in the app. Null means unknown. Languages without a validated CEFR-style framework use the same descriptors with lower default confidence. Acquisition (`native` / `learned`) never defaults any modality level: native does not imply literate.

**Confidence**, 0.00 to 1.00, belongs to projections only. Evidence rows carry a `weight` instead.

## Evidence

`evidence`: `id`, `worker_id`, `kind`, `title`, `description`, `context_type`, `context_id`, `issued_at` (NOT NULL, default now: when the demonstrated thing happened, and the time basis for decay), `expires_at`, `recorded_by` (null = system), `metadata` jsonb, `created_at`.

`kind` is text with a CHECK (code branches on it): `assessment_result`, `work_outcome`, `certification`, `education`, `experience`, `portfolio`, `peer_review`, `client_review`, `self_declared`, `admin_adjustment`. `admin_adjustment` requires a description. There is no status column: expiry is a fact (`expires_at`) evaluated at read time; revocation is a retraction.

`evidence_capabilities` (PK evidence, capability): `context_level` (difficulty of the task or assessment, 0 to 5, nullable), `demonstrated_level` (0 to 5), `quality` (0 to 1, nullable), `weight` (greater than 0, at most 1), `notes`. A CHECK enforces `demonstrated_level <= context_level` when context is set: scoring 100% on a level-2 task proves level 2, not level 5.

`evidence_languages` (PK evidence, language, modality): `modality` (reading, writing, listening, speaking), `context_level` (0 to 6, nullable), `demonstrated_level` (0 to 6), `weight`, `notes`. Same CHECK.

`evidence_retractions` (PK evidence): `reason`, `retracted_by`, `retracted_at`. Retracted evidence is ignored by projections; retraction triggers a recompute.

## Projections

`worker_capabilities` (PK worker, capability): `level`, `confidence`, `evidence_count`, `last_evidence_at`, `projection_version`, `updated_at`.

`worker_languages` (PK worker, language): `acquisition`, `is_primary` (at most one primary per worker), timestamps. A declared fact, not derived.

`worker_language_proficiency` (PK worker, language, modality): same columns as `worker_capabilities`. Composite FK to `worker_languages`. One projector serves both.

### Projection rules, version 1 (final constants)

For one (worker, capability) or (worker, language, modality), take all evidence rows that are not retracted and not expired. For each row *i*:

- base weight *b* from the kind: `assessment_result` 1.0, `work_outcome` 1.0, `certification` 0.6, `client_review` 0.5, `peer_review` 0.4, `experience` 0.3, `education` 0.3, `portfolio` 0.3, `self_declared` 0.1, `admin_adjustment` 1.0 (explicit weight allowed).
- the stored row `weight` is *b* multiplied by `quality` when quality is present. It is fixed at insert time.
- recency factor *d* = 0.5 ^ (age in months / 24), age measured from `issued_at`.
- effective weight *e* = weight x *d*.

Then:

- **Level** = sum(*e* x demonstrated_level) / sum(*e*). Failures (level 0) count.
- **Confidence** = 1 - exp(-sum(*e*) / 2). If the only evidence is `self_declared`, confidence is capped at 0.20.
- **evidence_count** = rows used. **last_evidence_at** = latest `issued_at` among them.
- If no usable evidence remains, the projector deletes the projection row.
- Level and confidence are rounded to 2 decimals. Every row stores `projection_version` (currently 1). Changing any constant above creates version 2, applied by recomputation. Evidence rows are never rewritten.
- Concurrent recomputes for the same worker and capability (or language) are serialized with a transaction-scoped advisory lock.
- A capability deprecated in `reference` keeps its projection rows. Readers resolve through `replaced_by_id`; consolidating rows is a controlled migration.

### Derived status (not stored)

In order:

1. no evidence other than `self_declared` -> `unverified`
2. newest non-self-declared `issued_at` older than 24 months -> `stale`
3. confidence >= 0.35 -> `verified`
4. otherwise -> `unverified`

One fresh assessment (effective weight 1.0) gives confidence 0.39, so it verifies. Level descriptors such as "strong" are levels, not states.

## Assessments

`assessments`: `id`, `key` (unique), `name`, `kind` (CHECK: knowledge_quiz, practical_task, work_sample, interview, cognitive, language_test), `status` (active, retired).

`assessment_versions`: `id`, `assessment_id`, `version`, `status` (draft, published, retired), `content` jsonb, `duration_minutes`, `published_at`. Unique on (assessment, version). Immutable once published; only publish -> retire is allowed.

`assessment_translations` (PK version, language): delivery-language content: `title`, `instructions`, `content` jsonb, plus the standard translation metadata. Translations may be added after publication; a change of meaning is a new version.

`assessment_capabilities` (PK version, capability): `required`, `weight`, `context_level` (1 to 5), `cut_scores` jsonb. Cut scores are an ascending list of `{min, level}`; the demonstrated level is the highest level whose `min` is at or below the raw score. Validated in the app.

`assessment_lang_targets` (PK version, language, modality): `weight`, `context_level` (1 to 6), `cut_scores`. For language tests, which measure language modalities, not capabilities.

Both link tables are frozen once their version leaves `draft`.

`assessment_attempts`: `id`, `version_id`, `worker_id`, `delivery_language_id`, `status` (invited, in_progress, submitted, scored, expired, voided), `context_type`, `context_id`, `started_at`, `submitted_at`, `scored_at`, `scored_by`, `raw_score` (informational only, never feeds a projection), `evaluation` jsonb, `evidence_id` (unique; required when status is `scored`). A scored attempt can only change to `voided`, which retracts its evidence.

`assessment_results` (PK attempt, capability): `raw_score` (0 to 1), `demonstrated_level`, `passed`, `evaluation` jsonb.

`assessment_lang_results` (PK attempt, language, modality): same columns.

Results are append-only. Delivery language is chosen per attempt (default: the worker's UI language), except where language is what is being measured.

## Synchronous transaction

```text
attempt scored
  -> results written (capability and/or language)
  -> one evidence record (kind assessment_result) + its junction rows
  -> attempt.evidence_id set, status = scored
  -> projections recomputed for the affected pairs
  -> outbox events inserted
COMMIT
  -> drainer: Qdrant sync, AI, notifications
```

Outbox events: `capability.evidence_recorded`, `capability.evidence_retracted`, `capability.projection_updated` (worker id and changed capability / language-modality keys). Handlers are idempotent.

## Integrity rules (database)

- Triggers block UPDATE and DELETE on `evidence`, `evidence_capabilities`, `evidence_languages`, `evidence_retractions`, `assessment_results` and `assessment_lang_results`.
- Triggers on the evidence junction tables reject capabilities and languages that are not `active`.
- A trigger freezes published `assessment_versions` and, through their parent, the two link tables.
- A trigger restricts scored attempts to the `voided` transition.
- CHECK constraints bound all levels, confidence, quality and weights.
- Foreign keys into `reference` and from history to profiles are ON DELETE RESTRICT. Projections cascade from profiles.
- RLS enabled, no policies yet.

## Work-context boundary

`capability` supplies level, confidence, recency and evidence. `work` defines requirements and context. `matching` combines them with availability and language requirements into a fit for one piece of work. Nothing in this module ranks people.

## Invariants

1. Reference rows are never deleted by normal behavior.
2. Every projection row traces to evidence (including `admin_adjustment`).
3. Historical attempts keep their assessment version and delivery language.
4. Assessment results are per capability or per language modality, never only one aggregate.
5. No universal score exists in storage.
6. Qdrant holds derived representations only and is rebuildable from PostgreSQL.

## Deferred

Adaptive assessment, AI assessment generation, learning-provider integrations, calibrated decay and confidence models, multiple language frameworks, per-capability level anchors, occupation and industry models, Qdrant collection design.