// src/db/schema/capability.ts
// CAPABILITY module — see HCIL_CAPABILITY_DESIGN_v1.1.md (frozen).
//
//   evidence (append-only) --> projections (worker_capabilities, worker_language_proficiency)
//   assessments -> versions -> attempts -> results --> evidence
//
// Rules enforced here or by custom-migrations/0002_capability_integrity.sql:
//  - Evidence and results are append-only (triggers). Corrections are retractions + new evidence.
//  - Projections are written only by the capability projector, in the evidence transaction.
//  - History tables reference profiles ON DELETE RESTRICT; projections cascade.
//  - This module declares no foreign keys into work / matching / payments. Work context is an
//    opaque (context_type, context_id) pair.
//  - Schema files may import reference and identity tables ONLY to declare foreign keys.
//  - No overall_level and no per-worker aggregate score exists in storage.

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, translationMeta, updatedAt, valuesIn } from "./_shared";
import { profiles } from "./identity";
import { capabilities, languages } from "./reference";

export const EVIDENCE_KINDS = [
  "assessment_result",
  "work_outcome",
  "certification",
  "education",
  "experience",
  "portfolio",
  "peer_review",
  "client_review",
  "self_declared",
  "admin_adjustment",
] as const;
export const MODALITIES = [
  "reading",
  "writing",
  "listening",
  "speaking",
] as const;
export const ASSESSMENT_KINDS = [
  "knowledge_quiz",
  "practical_task",
  "work_sample",
  "interview",
  "cognitive",
  "language_test",
] as const;
export const ATTEMPT_STATUSES = [
  "invited",
  "in_progress",
  "submitted",
  "scored",
  "expired",
  "voided",
] as const;

// Ascending thresholds: the demonstrated level is the highest level whose `min` <= raw score.
export type CutScore = { min: number; level: number };

const dec = (name: string, precision: number, scale: number) =>
  numeric(name, { precision, scale, mode: "number" });
const ts = (name: string) => timestamp(name, { withTimezone: true });

/* ------------------------------------------------------------------ */
/* Evidence (append-only)                                              */
/* ------------------------------------------------------------------ */

export const evidence = pgTable(
  "evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workerId: uuid("worker_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    // Opaque pointer to where this came from (e.g. a milestone). No FK by design.
    contextType: text("context_type"),
    contextId: uuid("context_id"),
    // When the demonstrated thing happened; time basis for recency decay.
    issuedAt: ts("issued_at").notNull().defaultNow(),
    expiresAt: ts("expires_at"),
    recordedBy: uuid("recorded_by").references(() => profiles.id, {
      onDelete: "restrict",
    }), // null = system
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: createdAt(),
  },
  (t) => [
    index("evidence_worker_idx").on(t.workerId, t.issuedAt),
    index("evidence_context_idx").on(t.contextType, t.contextId),
    valuesIn("evidence_kind_ck", t.kind, EVIDENCE_KINDS),
    check(
      "evidence_context_ck",
      sql`(${t.contextType} is null) = (${t.contextId} is null)`,
    ),
    check(
      "evidence_expiry_ck",
      sql`${t.expiresAt} is null or ${t.expiresAt} > ${t.issuedAt}`,
    ),
    check(
      "evidence_admin_ck",
      sql`${t.kind} <> 'admin_adjustment' or ${t.description} is not null`,
    ),
  ],
);

export const evidenceCapabilities = pgTable(
  "evidence_capabilities",
  {
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => evidence.id, { onDelete: "restrict" }),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    contextLevel: smallint("context_level"), // difficulty of the task / assessment, 0..5
    demonstratedLevel: smallint("demonstrated_level").notNull(), // 0..5
    quality: dec("quality", 3, 2), // 0..1
    weight: dec("weight", 4, 3).notNull().default(1), // (0, 1], fixed at insert from kind x quality
    notes: text("notes"),
  },
  (t) => [
    primaryKey({ columns: [t.evidenceId, t.capabilityId] }),
    index("evidence_capabilities_capability_idx").on(t.capabilityId),
    check(
      "evidence_capabilities_demonstrated_ck",
      sql`${t.demonstratedLevel} between 0 and 5`,
    ),
    check(
      "evidence_capabilities_context_ck",
      sql`${t.contextLevel} is null or ${t.contextLevel} between 0 and 5`,
    ),
    check(
      "evidence_capabilities_within_context_ck",
      sql`${t.contextLevel} is null or ${t.demonstratedLevel} <= ${t.contextLevel}`,
    ),
    check(
      "evidence_capabilities_quality_ck",
      sql`${t.quality} is null or ${t.quality} between 0 and 1`,
    ),
    check(
      "evidence_capabilities_weight_ck",
      sql`${t.weight} > 0 and ${t.weight} <= 1`,
    ),
  ],
);

export const evidenceLanguages = pgTable(
  "evidence_languages",
  {
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => evidence.id, { onDelete: "restrict" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    modality: text("modality").notNull(),
    contextLevel: smallint("context_level"), // 0..6
    demonstratedLevel: smallint("demonstrated_level").notNull(), // 0..6 (0 none, 1 A1 ... 6 C2)
    weight: dec("weight", 4, 3).notNull().default(1),
    notes: text("notes"),
  },
  (t) => [
    primaryKey({ columns: [t.evidenceId, t.languageId, t.modality] }),
    index("evidence_languages_language_idx").on(t.languageId, t.modality),
    valuesIn("evidence_languages_modality_ck", t.modality, MODALITIES),
    check(
      "evidence_languages_demonstrated_ck",
      sql`${t.demonstratedLevel} between 0 and 6`,
    ),
    check(
      "evidence_languages_context_ck",
      sql`${t.contextLevel} is null or ${t.contextLevel} between 0 and 6`,
    ),
    check(
      "evidence_languages_within_context_ck",
      sql`${t.contextLevel} is null or ${t.demonstratedLevel} <= ${t.contextLevel}`,
    ),
    check(
      "evidence_languages_weight_ck",
      sql`${t.weight} > 0 and ${t.weight} <= 1`,
    ),
  ],
);

// A retraction ignores the evidence in projections. The evidence row itself never changes.
export const evidenceRetractions = pgTable("evidence_retractions", {
  evidenceId: uuid("evidence_id")
    .primaryKey()
    .references(() => evidence.id, { onDelete: "restrict" }),
  reason: text("reason").notNull(),
  retractedBy: uuid("retracted_by").references(() => profiles.id, {
    onDelete: "restrict",
  }),
  retractedAt: ts("retracted_at").notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Projections (rebuildable from evidence; written only by the projector) */
/* ------------------------------------------------------------------ */

export const workerCapabilities = pgTable(
  "worker_capabilities",
  {
    workerId: uuid("worker_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    level: dec("level", 3, 2).notNull(), // 0.00..5.00
    confidence: dec("confidence", 3, 2).notNull(), // 0.00..1.00
    evidenceCount: integer("evidence_count").notNull(),
    lastEvidenceAt: ts("last_evidence_at").notNull(),
    projectionVersion: integer("projection_version").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.workerId, t.capabilityId] }),
    index("worker_capabilities_lookup_idx").on(t.capabilityId, t.level),
    check("worker_capabilities_level_ck", sql`${t.level} between 0 and 5`),
    check(
      "worker_capabilities_confidence_ck",
      sql`${t.confidence} between 0 and 1`,
    ),
    check("worker_capabilities_count_ck", sql`${t.evidenceCount} >= 1`),
  ],
);

// Declared facts about a worker's relationship to a language. Levels live in the table below.
export const workerLanguages = pgTable(
  "worker_languages",
  {
    workerId: uuid("worker_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    acquisition: text("acquisition").notNull(), // native | learned. Never implies any modality level.
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.workerId, t.languageId] }),
    uniqueIndex("worker_languages_one_primary_uq")
      .on(t.workerId)
      .where(sql`${t.isPrimary} = true`),
    valuesIn("worker_languages_acquisition_ck", t.acquisition, [
      "native",
      "learned",
    ]),
  ],
);

export const workerLanguageProficiency = pgTable(
  "worker_language_proficiency",
  {
    workerId: uuid("worker_id").notNull(),
    languageId: uuid("language_id").notNull(),
    modality: text("modality").notNull(),
    level: dec("level", 3, 2).notNull(), // 0.00..6.00
    confidence: dec("confidence", 3, 2).notNull(),
    evidenceCount: integer("evidence_count").notNull(),
    lastEvidenceAt: ts("last_evidence_at").notNull(),
    projectionVersion: integer("projection_version").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.workerId, t.languageId, t.modality] }),
    foreignKey({
      name: "wlp_worker_language_fk",
      columns: [t.workerId, t.languageId],
      foreignColumns: [workerLanguages.workerId, workerLanguages.languageId],
    }).onDelete("cascade"),
    index("worker_language_proficiency_lookup_idx").on(
      t.languageId,
      t.modality,
      t.level,
    ),
    valuesIn("worker_language_proficiency_modality_ck", t.modality, MODALITIES),
    check(
      "worker_language_proficiency_level_ck",
      sql`${t.level} between 0 and 6`,
    ),
    check(
      "worker_language_proficiency_confidence_ck",
      sql`${t.confidence} between 0 and 1`,
    ),
    check("worker_language_proficiency_count_ck", sql`${t.evidenceCount} >= 1`),
  ],
);

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("active"), // active | retired
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("assessments_key_uq").on(t.key),
    check("assessments_key_ck", sql`${t.key} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    valuesIn("assessments_kind_ck", t.kind, ASSESSMENT_KINDS),
    valuesIn("assessments_status_ck", t.status, ["active", "retired"]),
  ],
);

// Immutable once published (trigger). What an assessment measures is declared per version.
export const assessmentVersions = pgTable(
  "assessment_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    status: text("status").notNull().default("draft"), // draft | published | retired
    content: jsonb("content")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    durationMinutes: integer("duration_minutes"),
    publishedAt: ts("published_at"),
    createdBy: uuid("created_by").references(() => profiles.id, {
      onDelete: "restrict",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("assessment_versions_uq").on(t.assessmentId, t.version),
    check("assessment_versions_version_ck", sql`${t.version} >= 1`),
    valuesIn("assessment_versions_status_ck", t.status, [
      "draft",
      "published",
      "retired",
    ]),
    check(
      "assessment_versions_published_ck",
      sql`${t.status} = 'draft' or ${t.publishedAt} is not null`,
    ),
  ],
);

// Delivery-language content. One version, many languages, so calibration is not split by copy.
export const assessmentTranslations = pgTable(
  "assessment_translations",
  {
    versionId: uuid("version_id")
      .notNull()
      .references(() => assessmentVersions.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    instructions: text("instructions"),
    content: jsonb("content")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    ...translationMeta(),
  },
  (t) => [
    primaryKey({ columns: [t.versionId, t.languageId] }),
    valuesIn("assessment_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
  ],
);

export const assessmentCapabilities = pgTable(
  "assessment_capabilities",
  {
    versionId: uuid("version_id")
      .notNull()
      .references(() => assessmentVersions.id, { onDelete: "restrict" }),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    required: boolean("required").notNull().default(true),
    weight: dec("weight", 4, 3).notNull().default(1),
    contextLevel: smallint("context_level").notNull(), // difficulty, 1..5
    cutScores: jsonb("cut_scores").$type<CutScore[]>().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.versionId, t.capabilityId] }),
    check(
      "assessment_capabilities_context_ck",
      sql`${t.contextLevel} between 1 and 5`,
    ),
    check("assessment_capabilities_weight_ck", sql`${t.weight} > 0`),
  ],
);

// For language tests: which language modalities a version measures.
export const assessmentLangTargets = pgTable(
  "assessment_lang_targets",
  {
    versionId: uuid("version_id")
      .notNull()
      .references(() => assessmentVersions.id, { onDelete: "restrict" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    modality: text("modality").notNull(),
    weight: dec("weight", 4, 3).notNull().default(1),
    contextLevel: smallint("context_level").notNull(), // 1..6
    cutScores: jsonb("cut_scores").$type<CutScore[]>().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.versionId, t.languageId, t.modality] }),
    valuesIn("assessment_lang_targets_modality_ck", t.modality, MODALITIES),
    check(
      "assessment_lang_targets_context_ck",
      sql`${t.contextLevel} between 1 and 6`,
    ),
    check("assessment_lang_targets_weight_ck", sql`${t.weight} > 0`),
  ],
);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    versionId: uuid("version_id")
      .notNull()
      .references(() => assessmentVersions.id, { onDelete: "restrict" }),
    workerId: uuid("worker_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    // Language the worker took it in (default: their UI language, unless language is what is measured).
    deliveryLanguageId: uuid("delivery_language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("invited"),
    // Opaque pointer to what triggered the attempt (e.g. a work package). No FK by design.
    contextType: text("context_type"),
    contextId: uuid("context_id"),
    startedAt: ts("started_at"),
    submittedAt: ts("submitted_at"),
    scoredAt: ts("scored_at"),
    scoredBy: text("scored_by"), // "auto", "ai:<model>", or a reviewer profile id
    rawScore: dec("raw_score", 5, 4), // informational only; never feeds a projection
    evaluation: jsonb("evaluation").$type<Record<string, unknown>>(),
    evidenceId: uuid("evidence_id").references(() => evidence.id, {
      onDelete: "restrict",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("assessment_attempts_worker_idx").on(t.workerId, t.createdAt),
    index("assessment_attempts_version_idx").on(t.versionId),
    uniqueIndex("assessment_attempts_evidence_uq").on(t.evidenceId),
    valuesIn("assessment_attempts_status_ck", t.status, ATTEMPT_STATUSES),
    check(
      "assessment_attempts_context_ck",
      sql`(${t.contextType} is null) = (${t.contextId} is null)`,
    ),
    check(
      "assessment_attempts_scored_ck",
      sql`${t.status} <> 'scored' or (${t.scoredAt} is not null and ${t.evidenceId} is not null)`,
    ),
  ],
);

export const assessmentResults = pgTable(
  "assessment_results",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "restrict" }),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    rawScore: dec("raw_score", 5, 4).notNull(), // 0..1
    demonstratedLevel: smallint("demonstrated_level").notNull(), // 0..5
    passed: boolean("passed").notNull(),
    evaluation: jsonb("evaluation").$type<Record<string, unknown>>(),
  },
  (t) => [
    primaryKey({ columns: [t.attemptId, t.capabilityId] }),
    check("assessment_results_score_ck", sql`${t.rawScore} between 0 and 1`),
    check(
      "assessment_results_level_ck",
      sql`${t.demonstratedLevel} between 0 and 5`,
    ),
  ],
);

export const assessmentLangResults = pgTable(
  "assessment_lang_results",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "restrict" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    modality: text("modality").notNull(),
    rawScore: dec("raw_score", 5, 4).notNull(),
    demonstratedLevel: smallint("demonstrated_level").notNull(), // 0..6
    passed: boolean("passed").notNull(),
    evaluation: jsonb("evaluation").$type<Record<string, unknown>>(),
  },
  (t) => [
    primaryKey({ columns: [t.attemptId, t.languageId, t.modality] }),
    valuesIn("assessment_lang_results_modality_ck", t.modality, MODALITIES),
    check(
      "assessment_lang_results_score_ck",
      sql`${t.rawScore} between 0 and 1`,
    ),
    check(
      "assessment_lang_results_level_ck",
      sql`${t.demonstratedLevel} between 0 and 6`,
    ),
  ],
);
