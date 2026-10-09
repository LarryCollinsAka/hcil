# HCIL Work Domain Design v1.1

**Status:** Schema-ready
**Bounded context:** `work`
**Depends on:** `reference`, `identity`, `capability`
**Does not own:** `matching` decisions, payment ledger/escrow, chat, learning

## 1. Purpose

The Work context models **economic demand as structured work**, not as a conventional job advertisement.

Its central question is:

> **What outcome does an organization need, what work must be performed to achieve it, and what measurable conditions define completion?**

Work owns the durable commercial commitment created from that demand. Matching recommends who should do the work; Payments owns money movement.

---

## 2. Locked decisions

### 2.1 One hierarchical package model

There is no separate `work_units` table.

A `work_package` may have children through `parent_id`:

```text
Work Request
  |
  +-- Data preparation (container)
  |     +-- Clean dataset (leaf)
  |     +-- Validate dataset (leaf)
  |
  +-- Analysis (container)
        +-- Pivot analysis (leaf)
        +-- Business insights (leaf)
```

**Leaf-ness is derived from the absence of children.** It is not stored as a `package_type` field.

A leaf package is the executable unit of work for MVP purposes.

### 2.2 Milestones group packages, never assignments

A milestone is an employer outcome/funding checkpoint. Leaf packages may belong to at most one milestone.

`milestone_packages` enforces that relationship.

Changing a worker does not change the milestone's outcome structure.

### 2.3 Assignment is a Work record

An assignment is a durable commitment between a worker and an executable package.

Matching decides **who should do the work**. Work records the commitment:

- worker
- package
- agreed amount
- hours/availability commitment
- due date
- lifecycle
- optional opaque `source_match_id`

Work never creates a foreign key into Matching.

### 2.4 Payout is triggered by package acceptance

The payout unit is the accepted worker package, not the entire milestone.

```text
milestone.budget_amount
    >=
SUM(assignment.agreed_amount)
for assignments whose packages belong to that milestone
```

The flow is:

```text
payments.milestone_funded
        -> Work marks milestone as funded

work.deliverable_accepted
        -> Payments releases the assignment's agreed amount once
           (idempotent by assignment)
```

Payments does not own the assignment; it owns the financial movement.

---

## 3. Work Request

A Work Request is the employer's original business need. It may be vague before AI/human structuring.

Fields:

- `id`
- `organization_id`
- `created_by_profile_id`
- `title`
- `problem_statement`
- `desired_outcome`
- `source_language_id` nullable
- `status`
- `created_at`
- `updated_at`

Initial lifecycle:

```text
DRAFT -> SUBMITTED -> DECOMPOSING -> STRUCTURED
                                  \-> CANCELLED
```

The `origin` of individual packages is tracked separately because AI decomposition is not automatically trusted.

---

## 4. Work Package

A Work Package is a structured piece of work or outcome within a request. It supports hierarchical decomposition via `parent_id`.

Fields:

- `id`
- `work_request_id`
- `parent_id` nullable
- `title`
- `description`
- `sequence`
- `status`
- `origin`
- `estimated_hours` nullable
- `starts_at` nullable
- `due_at` nullable
- `acceptance_criteria` nullable for containers, required before a leaf becomes assignable
- `created_at`
- `updated_at`

### Status

Initial values:

```text
proposed
confirmed
matching
in_progress
completed
cancelled
```

AI-generated packages begin as `proposed`.

Only employer-confirmed packages become eligible for matching/assignment.

### Origin

```text
human
ai
```

`ai` means an AI process created the proposal. It does not imply acceptance or correctness.

### Leaf invariants

- A package with children cannot receive an assignment.
- A package with children cannot receive a submission.
- A package with an assignment, submission, or milestone membership cannot gain children.
- A package parent must belong to the same Work Request.
- Package hierarchy cycles are rejected.
- A leaf must have non-empty `acceptance_criteria` before it can be assigned.

These rules are enforced with database triggers because leaf-ness is relational state.

---

## 5. Capability Requirements

`work_package_capabilities` describes the capability context required by a package.

Fields:

- `work_package_id`
- `capability_id`
- `minimum_level` — integer `1..5`
- `weight` — numeric `0..1`
- `is_critical`
- `required_confidence` nullable, numeric `0..1`
- `notes` nullable

Unique key:

```text
(work_package_id, capability_id)
```

Example:

```text
Pivot Tables       minimum 3   weight .25   critical
Data Analysis      minimum 3   weight .40   critical
Reporting          minimum 2   weight .20   non-critical
Excel Formatting   minimum 2   weight .15   non-critical
```

Requirements belong to Work. Worker capability evidence belongs to Capability.

---

## 6. Language Requirements

Language requirements are intentionally **one row per modality**.

`work_package_language_requirements` fields:

- `work_package_id`
- `language_id`
- `modality` — `reading | writing | listening | speaking`
- `minimum_level` — integer `1..6`
- `weight` — numeric `0..1`
- `is_critical`

The language scale is mapped to:

```text
1 = A1
2 = A2
3 = B1
4 = B2
5 = C1
6 = C2
```

Unique key:

```text
(work_package_id, language_id, modality)
```

This keeps language requirements structurally consistent with the Capability context without pretending language is an ordinary technical skill.

---

## 7. Milestones

Milestones are Work-owned outcome/funding checkpoints.

Fields:

- `id`
- `work_request_id`
- `sequence`
- `title`
- `description`
- `budget_amount`
- `currency`
- `due_at`
- `status`
- `acceptance_criteria` nullable
- `created_at`
- `updated_at`

Initial states:

```text
draft
funded
in_progress
completed
cancelled
```

Funding state is changed by handling `payments.milestone_funded`.

Progress/completion is derived from the milestone's packages and assignments, with explicit state transitions performed by the Work application layer.

### Milestone package membership

`milestone_packages` links a milestone to executable leaf packages.

Constraints:

- package must be a leaf
- package may belong to **at most one** milestone
- a package already assigned/submitted should not be moved into a different milestone without an explicit controlled transition

---

## 8. Assignments

Assignments are Work records representing durable execution commitments.

Fields:

- `id`
- `work_package_id`
- `worker_profile_id`
- `source_match_id` nullable, opaque reference to Matching
- `engagement_role` nullable
- `agreed_amount`
- `currency`
- `agreed_hours` nullable
- `due_at` nullable
- `status`
- `offered_at` nullable
- `accepted_at` nullable
- `started_at` nullable
- `completed_at` nullable
- `declined_at` nullable
- `withdrawn_at` nullable
- `terminated_at` nullable
- `created_at`
- `updated_at`

Lifecycle:

```text
offered -> accepted -> active -> completed
     \-> declined
     \-> withdrawn
active -> terminated
```

An executable package may have only one **active commitment** at a time. Reassignment is supported by retaining historical assignments with terminal states and creating a new assignment.

Matching may create an assignment only through the Work application's command/interface; it does not write this table directly.

---

## 9. Commercial invariant

For every milestone:

```text
budget_amount >=
sum(agreed_amount)
for assignments whose work packages belong to the milestone
```

The check must run whenever any of these change:

- milestone budget
- milestone/package membership
- assignment amount
- assignment package

It is implemented as a **deferred constraint trigger** so a valid multi-row transaction can temporarily be incomplete and still commit successfully when its final state satisfies the invariant.

---

## 10. Submissions

Submissions are append-only records of worker deliverable attempts.

A submission always belongs to a real assignment. There is no nullable `assignment_id` and no duplicate `work_package_id`.

Fields:

- `id`
- `assignment_id`
- `version`
- `summary`
- `storage_path` nullable
- `external_url` nullable
- `content_hash` nullable
- `submitted_at`
- `created_at`

Unique key:

```text
(assignment_id, version)
```

A submission never changes state after creation.

A new attempt is another submission version.

---

## 11. Acceptance

Acceptance records the decision about a submission.

Fields:

- `id`
- `submission_id`
- `decision`
- `quality` — numeric `0..1`
- `feedback` nullable
- `decided_by_profile_id` nullable
- `decided_at`
- `created_at`

Decisions:

```text
accepted
rejected
revision_requested
```

The current submission state is derived from its latest acceptance decision. Historical decisions remain intact.

### Why `quality` is required

`quality` becomes one input to the Capability context when accepted work is converted into performance evidence.

The evidence layer can preserve the context:

```text
required capability level
+
accepted work quality
+
other performance signals
```

rather than turning acceptance into a universal worker score.

---

## 12. Package acceptance and payout event

When an acceptance decision is `accepted`, the Work transaction creates:

```text
work.deliverable_accepted
```

The event identifies the durable commitment:

```json
{
  "assignment_id": "...",
  "work_package_id": "...",
  "accepted_at": "..."
}
```

Payments retrieves the authoritative `agreed_amount` from the Work assignment. An event payload must not be able to override the financial agreement.

Payments then releases that assignment's agreed payout **once**, idempotently by `assignment_id`.

The accepted package does not wait for other packages in its milestone.

---

## 13. Domain events

Initial Work event names are snake_case and follow the outbox convention:

```text
work.work_request_submitted
work.work_request_structured
work.work_package_created
work.work_package_confirmed
work.work_package_cancelled
work.milestone_created
work.submission_received
work.revision_requested
work.deliverable_accepted
work.work_package_completed
work.work_request_completed
work.work_request_cancelled
```

Inbound integration event:

```text
payments.milestone_funded
```

It causes Work to mark the corresponding milestone as funded through an idempotent handler.

---

## 14. Synchronous vs asynchronous

### Same transaction

- create/update request
- confirm package
- attach requirements
- create milestone
- assign a package through Work command
- record submission
- record acceptance
- update assignment state associated with the acceptance
- write the corresponding outbox event

### Outbox side effects

- AI decomposition
- Qdrant indexing
- recommendation refresh
- notifications
- analytics
- asynchronous capability-evidence projection

The Work database remains authoritative for Work state.

---

## 15. Module ownership

### Work owns

- work requests
- work package hierarchy
- capability requirements
- language requirements
- milestones
- milestone/package membership
- assignments
- submissions
- acceptance decisions

### Capability owns

- canonical capabilities and worker capability evidence
- language proficiency evidence
- assessment results and capability projections

### Matching owns

- match calculations
- candidate recommendations
- team proposals
- Qdrant derived indexes

It may reference Work through commands/query interfaces and may provide an opaque `source_match_id` when asking Work to create an assignment.

### Payments owns

- escrow
- ledger entries
- payout execution
- provider/mobile-money integrations
- refund/chargeback state

Payments refers to Work IDs but Work never depends on Payments by foreign key.

---

## 16. MVP invariants

1. Leaf-ness is derived from children; there is no stored `package_type`.
2. Only leaf packages are executable.
3. A leaf must have acceptance criteria before assignment.
4. AI-created packages start as `proposed`.
5. Only confirmed packages are matchable.
6. A package belongs to at most one milestone.
7. A package cannot gain children after assignment, submission, or milestone membership.
8. A submission requires a durable assignment.
9. Submissions are append-only.
10. Acceptance decisions are append-only.
11. An accepted package produces one payout request for its assignment.
12. Payout is not blocked by slower teammates.
13. `milestone.budget_amount` cannot be below the sum of assignment commitments for its packages.
14. Work does not directly mutate Capability state.
15. Money movement remains exclusively Payments-owned.
16. Matching recommendations are not assignments until Work records the commitment.
