// src/db/schema/work.ts
// WORK module — see HCIL_WORK_DESIGN_v1.1.md (frozen).
//
//   work_request -> milestones (funding / progress checkpoints)
//                -> work_packages (tree; LEAF packages are the executable units)
//                     -> requirements (capability, language-by-modality)
//                     -> assignments (who does the leaf, on what terms)
//                          -> submissions (append-only) -> acceptances (one decision each)
//
// Rules enforced here or by custom-migrations/0003_work_integrity.sql:
//  - Milestones group LEAF packages; each leaf belongs to at most one milestone.
//  - Leaf-ness is derived (a package with no children), never stored.
//  - Assignments are Work records: matching decides, Work records the commitment.
//    Money (escrow, payouts) lives in payments, which points at milestones and assignments.
//  - Submissions and acceptances are append-only. A revision is a new submission.
//  - Work never writes capability or payment state; it emits outbox events.
//  - FK direction: work may point at reference and identity; matching and payments point at work.
//    Pointers from Work to matching are opaque columns (assignments.source_match_id).

import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { MODALITIES, createdAt, updatedAt, valuesIn } from "./_shared";
import { organizations, profiles, workerProfiles } from "./identity";
import { capabilities, languages } from "./reference";

export const REQUEST_STATUSES = [
  "draft",
  "submitted",
  "decomposing",
  "structured",
  "cancelled",
] as const;
export const MILESTONE_STATUSES = [
  "planned",
  "funded",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export const PACKAGE_STATUSES = [
  "draft",
  "proposed",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export const PACKAGE_ORIGINS = ["human", "ai"] as const;
export const ASSIGNMENT_STATUSES = [
  "offered",
  "accepted",
  "active",
  "completed",
  "declined",
  "withdrawn",
  "terminated",
] as const;
export const ACCEPTANCE_DECISIONS = [
  "accepted",
  "rejected",
  "revision_requested",
] as const;

const dec = (name: string, precision: number, scale: number) =>
  numeric(name, { precision, scale, mode: "number" });
const ts = (name: string) => timestamp(name, { withTimezone: true });
const money = (name: string) => bigint(name, { mode: "number" }); // whole currency units (XAF has no minor unit)
const currencyCol = () => text("currency").notNull().default("XAF"); // ISO 4217

/* ------------------------------------------------------------------ */
/* Request                                                             */
/* ------------------------------------------------------------------ */

// The employer's problem in their own words. Never rewritten by decomposition.
// Completion is derived from the packages, not stored here.
export const workRequests = pgTable(
  "work_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    problemStatement: text("problem_statement").notNull(),
    desiredOutcome: text("desired_outcome"),
    sourceLanguageId: uuid("source_language_id").references(
      () => languages.id,
      { onDelete: "restrict" },
    ),
    status: text("status").notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("work_requests_org_idx").on(t.organizationId, t.status),
    index("work_requests_creator_idx").on(t.createdBy),
    valuesIn("work_requests_status_ck", t.status, REQUEST_STATUSES),
  ],
);

/* ------------------------------------------------------------------ */
/* Milestones: funding and progress checkpoints over leaf packages     */
/* ------------------------------------------------------------------ */

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workRequestId: uuid("work_request_id")
      .notNull()
      .references(() => workRequests.id, { onDelete: "restrict" }),
    sequence: integer("sequence").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    acceptanceCriteria: text("acceptance_criteria"), // milestone-level outcome; each leaf has its own too
    dueAt: ts("due_at"),
    // The employer's commercial commitment for this checkpoint. The escrow ledger is owned by payments.
    // A trigger keeps the sum of committed assignment amounts within this budget.
    budgetAmount: money("budget_amount").notNull(),
    currency: currencyCol(),
    // planned -> funded (set when payments reports funding) -> in_progress -> completed | cancelled
    status: text("status").notNull().default("planned"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("milestones_request_sequence_uq").on(
      t.workRequestId,
      t.sequence,
    ),
    // Target for the composite FK that proves a package and its milestone share one request.
    // Declared as a constraint (not an index) because Drizzle creates foreign keys before indexes.
    unique("milestones_id_request_uq").on(t.id, t.workRequestId),
    check("milestones_sequence_ck", sql`${t.sequence} >= 1`),
    check("milestones_budget_ck", sql`${t.budgetAmount} >= 0`),
    check("milestones_currency_ck", sql`${t.currency} ~ '^[A-Z]{3}$'`),
    valuesIn("milestones_status_ck", t.status, MILESTONE_STATUSES),
  ],
);

/* ------------------------------------------------------------------ */
/* Packages                                                            */
/* ------------------------------------------------------------------ */

// A tree. A package with no children is a LEAF and is the executable unit.
// Only leaves may carry requirements, a milestone and assignments (triggers).
export const workPackages = pgTable(
  "work_packages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workRequestId: uuid("work_request_id")
      .notNull()
      .references(() => workRequests.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    milestoneId: uuid("milestone_id"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    // What makes a submission acceptable. Required on a leaf before it can leave draft/proposed (trigger).
    acceptanceCriteria: text("acceptance_criteria"),
    sequence: integer("sequence").notNull().default(0),
    // draft (human working) | proposed (AI suggestion awaiting the employer) | confirmed (open for matching)
    // | in_progress | completed | cancelled. Only confirmed leaves are matchable.
    status: text("status").notNull().default("draft"),
    origin: text("origin").notNull().default("human"), // human | ai
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "restrict",
    }), // null for ai
    estimatedHours: integer("estimated_hours"),
    startsAt: ts("starts_at"),
    dueAt: ts("due_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Constraint, not index: the FKs below need it to exist when they are created.
    unique("work_packages_id_request_uq").on(t.id, t.workRequestId),
    // Parent and milestone must belong to the same request. NULL parent / milestone skips the check.
    foreignKey({
      name: "work_packages_parent_fk",
      columns: [t.parentId, t.workRequestId],
      foreignColumns: [t.id, t.workRequestId],
    }).onDelete("restrict"),
    foreignKey({
      name: "work_packages_milestone_fk",
      columns: [t.milestoneId, t.workRequestId],
      foreignColumns: [milestones.id, milestones.workRequestId],
    }).onDelete("restrict"),
    index("work_packages_tree_idx").on(t.workRequestId, t.parentId, t.sequence),
    index("work_packages_parent_idx").on(t.parentId),
    index("work_packages_milestone_idx").on(t.milestoneId),
    index("work_packages_matchable_idx").on(t.status),
    check(
      "work_packages_not_own_parent_ck",
      sql`${t.parentId} is null or ${t.parentId} <> ${t.id}`,
    ),
    check(
      "work_packages_hours_ck",
      sql`${t.estimatedHours} is null or ${t.estimatedHours} >= 0`,
    ),
    check(
      "work_packages_dates_ck",
      sql`${t.startsAt} is null or ${t.dueAt} is null or ${t.dueAt} >= ${t.startsAt}`,
    ),
    valuesIn("work_packages_status_ck", t.status, PACKAGE_STATUSES),
    valuesIn("work_packages_origin_ck", t.origin, PACKAGE_ORIGINS),
  ],
);

/* ------------------------------------------------------------------ */
/* Requirements (what the package needs; matching interprets them)     */
/* ------------------------------------------------------------------ */

// Levels use the capability scale (1..5). Level 0 is never a requirement.
export const workPackageCapabilities = pgTable(
  "work_package_capabilities",
  {
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "cascade" }),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    minimumLevel: smallint("minimum_level").notNull(),
    weight: dec("weight", 4, 3).notNull().default(1),
    isCritical: boolean("is_critical").notNull().default(false), // independent of weight
    requiredConfidence: dec("required_confidence", 3, 2), // optional floor on projection confidence
    notes: text("notes"),
  },
  (t) => [
    primaryKey({ columns: [t.workPackageId, t.capabilityId] }),
    index("work_package_capabilities_lookup_idx").on(
      t.capabilityId,
      t.minimumLevel,
    ),
    check(
      "work_package_capabilities_level_ck",
      sql`${t.minimumLevel} between 1 and 5`,
    ),
    check(
      "work_package_capabilities_weight_ck",
      sql`${t.weight} > 0 and ${t.weight} <= 1`,
    ),
    check(
      "work_package_capabilities_confidence_ck",
      sql`${t.requiredConfidence} is null or ${t.requiredConfidence} between 0 and 1`,
    ),
  ],
);

// One row per modality, mirroring worker_language_proficiency. Levels 1..6 = A1..C2.
export const workPackageLanguages = pgTable(
  "work_package_languages",
  {
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    modality: text("modality").notNull(),
    minimumLevel: smallint("minimum_level").notNull(),
    weight: dec("weight", 4, 3).notNull().default(1),
    isCritical: boolean("is_critical").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.workPackageId, t.languageId, t.modality] }),
    index("work_package_languages_lookup_idx").on(
      t.languageId,
      t.modality,
      t.minimumLevel,
    ),
    valuesIn("work_package_languages_modality_ck", t.modality, MODALITIES),
    check(
      "work_package_languages_level_ck",
      sql`${t.minimumLevel} between 1 and 6`,
    ),
    check(
      "work_package_languages_weight_ck",
      sql`${t.weight} > 0 and ${t.weight} <= 1`,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Assignments: the commitment between a worker and a leaf package     */
/* ------------------------------------------------------------------ */

// Created by Work when matching (or the employer) selects a worker. The worker must have a
// worker_profiles row. At most one open (offered / accepted / active / completed) assignment
// per package. Terminal statuses never change again.
export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "restrict" }),
    workerId: uuid("worker_id")
      .notNull()
      .references(() => workerProfiles.profileId, { onDelete: "restrict" }),
    status: text("status").notNull().default("offered"),
    // Commercial terms. Payments pays out exactly this amount on acceptance of the package.
    agreedAmount: money("agreed_amount").notNull(),
    currency: currencyCol(),
    agreedHours: integer("agreed_hours"),
    dueAt: ts("due_at"),
    // Opaque pointer to the match / team proposal that produced this offer. No FK by design.
    sourceMatchId: uuid("source_match_id"),
    offeredBy: uuid("offered_by").references(() => profiles.id, {
      onDelete: "restrict",
    }),
    offeredAt: ts("offered_at").notNull().defaultNow(),
    respondedAt: ts("responded_at"),
    startedAt: ts("started_at"),
    endedAt: ts("ended_at"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("assignments_one_open_per_package_uq")
      .on(t.workPackageId)
      .where(
        sql`${t.status} in ('offered', 'accepted', 'active', 'completed')`,
      ),
    index("assignments_worker_idx").on(t.workerId, t.status),
    index("assignments_package_idx").on(t.workPackageId),
    valuesIn("assignments_status_ck", t.status, ASSIGNMENT_STATUSES),
    check("assignments_amount_ck", sql`${t.agreedAmount} >= 0`),
    check("assignments_currency_ck", sql`${t.currency} ~ '^[A-Z]{3}$'`),
    check(
      "assignments_hours_ck",
      sql`${t.agreedHours} is null or ${t.agreedHours} >= 0`,
    ),
    check(
      "assignments_ended_ck",
      sql`${t.status} in ('offered', 'accepted', 'active') or ${t.endedAt} is not null`,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Submissions and acceptances (append-only)                           */
/* ------------------------------------------------------------------ */

// A worker's deliverable attempt. Versions are sequential per assignment; a new version is allowed
// only after the previous one received a decision. Current state is derived from the decision.
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    summary: text("summary"),
    storagePath: text("storage_path"), // Supabase Storage path
    externalUrl: text("external_url"),
    submittedAt: ts("submitted_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("submissions_assignment_version_uq").on(
      t.assignmentId,
      t.version,
    ),
    check("submissions_version_ck", sql`${t.version} >= 1`),
    check(
      "submissions_deliverable_ck",
      sql`${t.summary} is not null or ${t.storagePath} is not null or ${t.externalUrl} is not null`,
    ),
    check(
      "submissions_url_ck",
      sql`${t.externalUrl} is null or ${t.externalUrl} ~ '^https?://'`,
    ),
  ],
);

// Exactly one decision per submission. A revision request leads to a NEW submission.
// decided_by is an organization member of the request's organization, or null for a system decision.
// `quality` (0..1) is what the capability module turns into work_outcome evidence.
export const acceptances = pgTable(
  "acceptances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "restrict" }),
    decision: text("decision").notNull(),
    quality: dec("quality", 3, 2),
    feedback: text("feedback"),
    decidedBy: uuid("decided_by").references(() => profiles.id, {
      onDelete: "restrict",
    }),
    decidedAt: ts("decided_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("acceptances_one_per_submission_uq").on(t.submissionId),
    valuesIn("acceptances_decision_ck", t.decision, ACCEPTANCE_DECISIONS),
    check(
      "acceptances_quality_ck",
      sql`${t.quality} is null or ${t.quality} between 0 and 1`,
    ),
  ],
);
