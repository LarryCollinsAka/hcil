# HCIL Work Domain v1.1

**Status:** frozen for MVP. Supersedes `HCIL_WORK_DESIGN_v1.md`. Schema: `src/db/schema/work.ts`; integrity SQL: `custom-migrations/0003_work_integrity.sql`; checks: `db/tests/work_checks.sql`.

## Purpose

`work` represents economic demand as work to be accomplished, not as a job advertisement:

> What outcome does an organization need, what work achieves it, and what acceptance conditions define completion?

It records the commitment between a worker and a piece of work, and the deliverables and decisions that follow. It does not decide who should do the work (`matching`), move money (`payments`), or change what a worker can demonstrate (`capability`).

## Core model

```text
Organization
   |
   v
Work Request --- Milestones (funding / progress checkpoints)
   |                  ^
   v                  | each leaf in at most one milestone
Work Package tree ----+
   |  (leaf = executable)
   +-- Requirements: capability (0-5 scale), language by modality (1-6)
   +-- Assignments (worker <-> leaf, with agreed terms)
          +-- Submissions (append-only, versioned)
                 +-- Acceptance (one decision per submission)
```

## Decisions

1. **Milestones group leaf packages, not assignments.** A milestone is the employer's outcome checkpoint and funding unit. It does not change when a worker is replaced. A leaf belongs to at most one milestone (`work_packages.milestone_id`).
2. **The assignment is a Work record (`assignments`).** Matching decides who; Work records the commitment. Matching calls a Work command to create it and leaves an opaque `source_match_id`. Payments never owns it but points at it.
3. **Worker payout releases on package acceptance;** escrow is funded per milestone. A teammate's pace never delays another worker's pay. The alternative (release on milestone acceptance) was rejected for micro-teams.
4. **Leaf-ness is derived** (a package with no children), not stored.
5. **No `work_units` table.** Leaf packages are the executable units.
6. **No durable `micro_teams` table in Work.** A team is the set of workers with assignments under one request. Matching keeps team proposals as recommendations.

## Tables

**`work_requests`**: `organization_id`, `created_by`, `title`, `problem_statement`, `desired_outcome`, `source_language_id`, `status` (draft, submitted, decomposing, structured, cancelled). The problem statement is never rewritten. Completion is derived from packages.

**`milestones`**: `work_request_id`, `sequence`, `title`, `description`, `acceptance_criteria`, `due_at`, `budget_amount`, `currency`, `status` (planned, funded, in_progress, completed, cancelled). Budget is the employer's commercial commitment; the escrow ledger is Payments'. Status `funded` is set by Work when it consumes `payments.milestone_funded`.

**`work_packages`**: `work_request_id`, `parent_id`, `milestone_id`, `title`, `description`, `acceptance_criteria`, `sequence`, `status` (draft, proposed, confirmed, in_progress, completed, cancelled), `origin` (human, ai), `created_by` (null for ai), `estimated_hours`, `starts_at`, `due_at`. Composite foreign keys guarantee a package's parent and milestone belong to the same request. AI decomposition creates `proposed` packages; only employer-confirmed leaves are matchable.

**`work_package_capabilities`** (package, capability): `minimum_level` (1 to 5), `weight`, `is_critical` (independent of weight), `required_confidence` (optional floor), `notes`.

**`work_package_languages`** (package, language, modality): `minimum_level` (1 to 6 = A1 to C2), `weight`, `is_critical`. One row per modality, mirroring `worker_language_proficiency`.

**`assignments`**: `work_package_id`, `worker_id` (must have a `worker_profiles` row), `status` (offered, accepted, active, completed, declined, withdrawn, terminated), `agreed_amount`, `currency`, `agreed_hours`, `due_at`, `source_match_id` (opaque), `offered_by`, timestamps. At most one open assignment per package. Terminal statuses never change.

**`submissions`** (append-only): `assignment_id`, `version`, `summary`, `storage_path`, `external_url`, `submitted_at`. Versions are sequential; a new one is allowed only after the previous received a decision. State is derived from the decision.

**`acceptances`** (append-only): `submission_id` (unique, one decision each), `decision` (accepted, rejected, revision_requested), `quality` (0 to 1), `feedback`, `decided_by`, `decided_at`. `decided_by` must be a member of the owning organization, or null for a system decision. A revision request leads to a new submission.

## Money flow

```text
milestone.budget_amount  >=  sum(agreed_amount of committed assignments in it)   (trigger)

payments emits  payments.milestone_funded -> Work sets milestone status = funded
Work emits      work.deliverable_accepted  -> Payments releases that assignment's payout once
```

Committed statuses: offered, accepted, active, completed. Currency must match the milestone.

## Lifecycles

- **Assignment:** offered -> accepted -> active -> completed; offered -> declined | withdrawn; accepted or active -> terminated. A package can be reassigned after declined, withdrawn or terminated.
- **Package:** draft or proposed -> confirmed -> in_progress -> completed (or cancelled). A leaf needs acceptance criteria before leaving draft or proposed.
- **Milestone:** completed when all its leaf packages are completed (derived by the service, then stored).

## Synchronous vs asynchronous

Synchronous, one transaction: creating or editing requests, packages, requirements and milestones; offering and responding to assignments; recording submissions and decisions; writing outbox events.

Asynchronous (outbox): AI decomposition, Qdrant indexing, notifications, analytics, capability evidence from accepted work, payment release.

`work.deliverable_accepted` carries a **snapshot** of the package's capability and language requirements, the quality, and the assignment, milestone and amount. The capability module turns that into `work_outcome` evidence (context level = the requirement's minimum level, quality = the decision's quality) without reading Work tables. This is eventually consistent: a worker's projection can lag by a short window.

## Events Work emits (module.event, snake case)

`work.request_submitted`, `work.request_structured`, `work.request_cancelled`, `work.package_proposed`, `work.package_confirmed`, `work.package_requirements_changed`, `work.milestone_created`, `work.milestone_completed`, `work.assignment_offered`, `work.assignment_accepted`, `work.assignment_activated`, `work.assignment_ended`, `work.submission_received`, `work.revision_requested`, `work.deliverable_accepted`, `work.deliverable_rejected`, `work.package_completed`.

Consumes: `payments.milestone_funded`.

## Integrity (database)

- Composite FKs: a package's parent and milestone belong to its request.
- Triggers: leaf-only requirements, milestone and assignments; a package with assignments, requirements or a milestone cannot become a container; no milestone change while money is committed; acceptance criteria required on leaves past draft; requirements only for active capabilities and languages.
- Assignment guard: leaf only, package confirmed, milestone present, budget and currency respected (milestone row locked against concurrent offers), terminal states final, package and worker immutable.
- Submissions and acceptances append-only; sequential versions; one decision per submission; decisions only on active assignments; one accepted submission per assignment; deciders limited to organization members.
- CHECK constraints on levels, weights, amounts, currency codes, dates and statuses. RLS on, no policies yet.

## Foreign key direction

reference and identity are the base; capability and work sit above them; matching and payments sit above work. Schema foreign keys point down this order only. Work points at nothing in matching or payments; it uses opaque columns (`source_match_id`).

## Invariants

1. Only leaf packages are assigned, carry requirements and belong to milestones.
2. Requirements describe the work, not any worker. Work never writes capability or payment state.
3. A submission is immutable history; acceptance never overwrites it.
4. Committed assignment amounts never exceed the milestone budget.
5. Every payout is traceable to an accepted submission through its assignment.

## Deferred

Escrow and payout implementation (payments), team proposals and match scoring (matching), AI decomposition, chat, contracts and legal documents, time tracking, invoicing, dispute handling, milestone-level release option.