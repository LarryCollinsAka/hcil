// WORK BOUNDED CONTEXT
//
// Work models economic demand as structured packages, milestones, assignments,
// submissions, and acceptance decisions. Matching recommends who should do the
// work; Payments owns money movement; Capability owns worker capability state.

import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt, valuesIn } from "./_shared";
import { languages } from "./reference";
import { capabilities } from "./reference";
import { organizations, profiles, workerProfiles } from "./identity";

const WORK_REQUEST_STATUSES = [
  "draft",
  "submitted",
  "decomposing",
  "structured",
  "cancelled",
  "completed",
] as const;

const WORK_PACKAGE_STATUSES = [
  "proposed",
  "confirmed",
  "matching",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const PACKAGE_ORIGINS = ["human", "ai"] as const;

const MILESTONE_STATUSES = [
  "draft",
  "funded",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const ASSIGNMENT_STATUSES = [
  "offered",
  "accepted",
  "active",
  "completed",
  "declined",
  "withdrawn",
  "terminated",
] as const;

const ACCEPTANCE_DECISIONS = [
  "accepted",
  "rejected",
  "revision_requested",
] as const;

const LANGUAGE_MODALITIES = [
  "reading",
  "writing",
  "listening",
  "speaking",
] as const;

export const WORK_EVENT_TYPES = [
  "work.work_request_submitted",
  "work.work_request_structured",
  "work.work_package_created",
  "work.work_package_confirmed",
  "work.work_package_cancelled",
  "work.milestone_created",
  "work.submission_received",
  "work.revision_requested",
  "work.deliverable_accepted",
  "work.work_package_completed",
  "work.work_request_completed",
  "work.work_request_cancelled",
] as const;

export const workRequests = pgTable(
  "work_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    createdByProfileId: uuid("created_by_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    problemStatement: text("problem_statement").notNull(),
    desiredOutcome: text("desired_outcome").notNull(),
    sourceLanguageId: uuid("source_language_id").references(
      () => languages.id,
      {
        onDelete: "restrict",
      },
    ),
    status: text("status").notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("work_requests_organization_idx").on(t.organizationId),
    index("work_requests_created_by_idx").on(t.createdByProfileId),
    valuesIn("work_requests_status_ck", t.status, WORK_REQUEST_STATUSES),
  ],
);

export const workPackages = pgTable(
  "work_packages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workRequestId: uuid("work_request_id")
      .notNull()
      .references(() => workRequests.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => workPackages.id, {
      onDelete: "restrict",
    }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    sequence: integer("sequence").notNull().default(1),
    status: text("status").notNull().default("proposed"),
    origin: text("origin").notNull().default("human"),
    estimatedHours: numeric("estimated_hours", {
      precision: 8,
      scale: 2,
    }),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    // Containers may leave this null. A leaf must have a non-empty JSON array
    // before it can receive an assignment.
    acceptanceCriteria: jsonb("acceptance_criteria"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("work_packages_request_idx").on(t.workRequestId),
    index("work_packages_parent_idx").on(t.parentId),
    index("work_packages_status_idx").on(t.status),
    valuesIn("work_packages_status_ck", t.status, WORK_PACKAGE_STATUSES),
    valuesIn("work_packages_origin_ck", t.origin, PACKAGE_ORIGINS),
    check("work_packages_sequence_ck", sql`${t.sequence} > 0`),
    check(
      "work_packages_estimated_hours_ck",
      sql`${t.estimatedHours} is null or ${t.estimatedHours} >= 0`,
    ),
    check(
      "work_packages_dates_ck",
      sql`${t.startsAt} is null or ${t.dueAt} is null or ${t.startsAt} <= ${t.dueAt}`,
    ),
    check(
      "work_packages_acceptance_criteria_shape_ck",
      sql`${t.acceptanceCriteria} is null or jsonb_typeof(${t.acceptanceCriteria}) = 'array'`,
    ),
  ],
);

export const workPackageCapabilities = pgTable(
  "work_package_capabilities",
  {
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "restrict" }),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    minimumLevel: integer("minimum_level").notNull(),
    weight: numeric("weight", { precision: 5, scale: 4 })
      .notNull()
      .default("1"),
    isCritical: boolean("is_critical").notNull().default(false),
    requiredConfidence: numeric("required_confidence", {
      precision: 5,
      scale: 4,
    }),
    notes: text("notes"),
  },
  (t) => [
    primaryKey({ columns: [t.workPackageId, t.capabilityId] }),
    index("work_package_capabilities_capability_idx").on(t.capabilityId),
    check(
      "work_package_capabilities_level_ck",
      sql`${t.minimumLevel} between 1 and 5`,
    ),
    check(
      "work_package_capabilities_weight_ck",
      sql`${t.weight} >= 0 and ${t.weight} <= 1`,
    ),
    check(
      "work_package_capabilities_confidence_ck",
      sql`${t.requiredConfidence} is null or (${t.requiredConfidence} >= 0 and ${t.requiredConfidence} <= 1)`,
    ),
  ],
);

export const workPackageLanguageRequirements = pgTable(
  "work_package_language_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "restrict" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    modality: text("modality").notNull(),
    minimumLevel: integer("minimum_level").notNull(), // 1=A1 ... 6=C2
    weight: numeric("weight", { precision: 5, scale: 4 })
      .notNull()
      .default("1"),
    isCritical: boolean("is_critical").notNull().default(false),
  },
  (t) => [
    uniqueIndex("work_package_language_req_uq").on(
      t.workPackageId,
      t.languageId,
      t.modality,
    ),
    index("work_package_language_req_language_idx").on(t.languageId),
    valuesIn(
      "work_package_language_req_modality_ck",
      t.modality,
      LANGUAGE_MODALITIES,
    ),
    check(
      "work_package_language_req_level_ck",
      sql`${t.minimumLevel} between 1 and 6`,
    ),
    check(
      "work_package_language_req_weight_ck",
      sql`${t.weight} >= 0 and ${t.weight} <= 1`,
    ),
  ],
);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workRequestId: uuid("work_request_id")
      .notNull()
      .references(() => workRequests.id, { onDelete: "restrict" }),
    sequence: integer("sequence").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    budgetAmount: numeric("budget_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    currency: text("currency").notNull().default("USD"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    status: text("status").notNull().default("draft"),
    acceptanceCriteria: jsonb("acceptance_criteria"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("milestones_request_idx").on(t.workRequestId),
    uniqueIndex("milestones_request_sequence_uq").on(
      t.workRequestId,
      t.sequence,
    ),
    valuesIn("milestones_status_ck", t.status, MILESTONE_STATUSES),
    check("milestones_sequence_ck", sql`${t.sequence} > 0`),
    check("milestones_budget_ck", sql`${t.budgetAmount} >= 0`),
    check(
      "milestones_acceptance_criteria_shape_ck",
      sql`${t.acceptanceCriteria} is null or jsonb_typeof(${t.acceptanceCriteria}) = 'array'`,
    ),
  ],
);

export const milestonePackages = pgTable(
  "milestone_packages",
  {
    milestoneId: uuid("milestone_id")
      .notNull()
      .references(() => milestones.id, { onDelete: "restrict" }),
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.milestoneId, t.workPackageId] }),
    uniqueIndex("milestone_packages_one_milestone_per_package_uq").on(
      t.workPackageId,
    ),
    index("milestone_packages_milestone_idx").on(t.milestoneId),
  ],
);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workPackageId: uuid("work_package_id")
      .notNull()
      .references(() => workPackages.id, { onDelete: "restrict" }),
    workerProfileId: uuid("worker_profile_id")
      .notNull()
      .references(() => workerProfiles.profileId, { onDelete: "restrict" }),
    // Opaque Matching reference. Work never takes a FK dependency on Matching.
    sourceMatchId: uuid("source_match_id"),
    engagementRole: text("engagement_role"),
    agreedAmount: numeric("agreed_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    currency: text("currency").notNull().default("USD"),
    agreedHours: numeric("agreed_hours", { precision: 8, scale: 2 }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    status: text("status").notNull().default("offered"),
    offeredAt: timestamp("offered_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    declinedAt: timestamp("declined_at", { withTimezone: true }),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    terminatedAt: timestamp("terminated_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("assignments_package_idx").on(t.workPackageId),
    index("assignments_worker_idx").on(t.workerProfileId),
    index("assignments_source_match_idx").on(t.sourceMatchId),
    uniqueIndex("assignments_one_active_per_package_uq")
      .on(t.workPackageId)
      .where(sql`${t.status} in ('offered', 'accepted', 'active')`),
    valuesIn("assignments_status_ck", t.status, ASSIGNMENT_STATUSES),
    check("assignments_amount_ck", sql`${t.agreedAmount} > 0`),
    check(
      "assignments_hours_ck",
      sql`${t.agreedHours} is null or ${t.agreedHours} > 0`,
    ),
  ],
);

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    summary: text("summary").notNull(),
    storagePath: text("storage_path"),
    externalUrl: text("external_url"),
    contentHash: text("content_hash"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("submissions_assignment_version_uq").on(
      t.assignmentId,
      t.version,
    ),
    index("submissions_assignment_idx").on(t.assignmentId),
    check("submissions_version_ck", sql`${t.version} > 0`),
  ],
);

export const acceptances = pgTable(
  "acceptances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "restrict" }),
    decision: text("decision").notNull(),
    quality: numeric("quality", { precision: 5, scale: 4 }).notNull(),
    feedback: text("feedback"),
    decidedByProfileId: uuid("decided_by_profile_id").references(
      () => profiles.id,
      {
        onDelete: "restrict",
      },
    ),
    decidedAt: timestamp("decided_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [
    index("acceptances_submission_idx").on(t.submissionId),
    valuesIn("acceptances_decision_ck", t.decision, ACCEPTANCE_DECISIONS),
    check(
      "acceptances_quality_ck",
      sql`${t.quality} >= 0 and ${t.quality} <= 1`,
    ),
  ],
);

// Event names intentionally follow the outbox module.event convention.
export const WORK_EVENTS = {
  workRequestSubmitted: "work.work_request_submitted",
  workRequestStructured: "work.work_request_structured",
  workPackageCreated: "work.work_package_created",
  workPackageConfirmed: "work.work_package_confirmed",
  workPackageCancelled: "work.work_package_cancelled",
  milestoneCreated: "work.milestone_created",
  submissionReceived: "work.submission_received",
  revisionRequested: "work.revision_requested",
  deliverableAccepted: "work.deliverable_accepted",
  workPackageCompleted: "work.work_package_completed",
  workRequestCompleted: "work.work_request_completed",
  workRequestCancelled: "work.work_request_cancelled",
} as const;

export type WorkEventType = (typeof WORK_EVENT_TYPES)[number];
