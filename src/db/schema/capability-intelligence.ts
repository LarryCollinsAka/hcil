// Candidate claims, structured AI interviews, contextual gap analyses and learning roadmaps.
// Model output is advisory. Official capability verification remains governed by assessment rules.
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, timestamp, uuid, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./_shared";
import { profiles } from "./identity";
import { capabilities } from "./reference";
import { assessmentAttempts } from "./capability";

export const capabilityClaims = pgTable("capability_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "restrict" }),
  capabilityId: uuid("capability_id").notNull().references(() => capabilities.id, { onDelete: "restrict" }),
  claimedLevel: integer("claimed_level"),
  description: text("description"),
  evidenceReferences: jsonb("evidence_references").$type<Array<{ type: string; reference?: string; description?: string }>>().notNull().default(sql`'[]'::jsonb`),
  status: text("status").notNull().default("self_reported"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index("capability_claims_profile_idx").on(t.profileId, t.createdAt),
  index("capability_claims_capability_idx").on(t.capabilityId, t.status),
  check("capability_claims_level_ck", sql`${t.claimedLevel} is null or ${t.claimedLevel} between 0 and 5`),
  check("capability_claims_status_ck", sql`${t.status} in ('self_reported','evidence_assessed','verified','disputed','withdrawn')`),
]).enableRLS();

export const aiInterviews = pgTable("ai_interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id").notNull().references(() => assessmentAttempts.id, { onDelete: "restrict" }),
  promptKey: text("prompt_key").notNull(),
  promptVersion: text("prompt_version").notNull(),
  modelProvider: text("model_provider"),
  modelId: text("model_id"),
  status: text("status").notNull().default("created"),
  languageCode: text("language_code").notNull().default("en"),
  transcript: jsonb("transcript").$type<Array<{ role: "interviewer" | "candidate"; content: string; questionId?: string; at?: string }>>().notNull().default(sql`'[]'::jsonb`),
  evaluation: jsonb("evaluation").$type<Record<string, unknown>>(),
  reviewStatus: text("review_status").notNull().default("not_required"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  uniqueIndex("ai_interviews_attempt_uq").on(t.attemptId),
  check("ai_interviews_status_ck", sql`${t.status} in ('created','in_progress','completed','interrupted','failed','voided')`),
  check("ai_interviews_review_status_ck", sql`${t.reviewStatus} in ('not_required','pending','approved','rejected','appealed')`),
  check("ai_interviews_language_ck", sql`${t.languageCode} ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'`),
]).enableRLS();

export const capabilityGapAnalyses = pgTable("capability_gap_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "restrict" }),
  targetType: text("target_type").notNull(), // role | work_package | learning_goal
  targetKey: text("target_key").notNull(),
  targetDescription: text("target_description"),
  requirements: jsonb("requirements").$type<Array<{ capabilityKey: string; requiredLevel?: number; importance: "essential" | "preferred"; source?: string }>>().notNull().default(sql`'[]'::jsonb`),
  analysis: jsonb("analysis").$type<Record<string, unknown>>().notNull(),
  promptVersion: text("prompt_version").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index("capability_gap_analyses_profile_idx").on(t.profileId, t.createdAt),
  check("capability_gap_analyses_target_type_ck", sql`${t.targetType} in ('role','work_package','learning_goal')`),
  check("capability_gap_analyses_status_ck", sql`${t.status} in ('draft','ready','review_required','superseded')`),
]).enableRLS();

export const learningRoadmaps = pgTable("learning_roadmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "restrict" }),
  gapAnalysisId: uuid("gap_analysis_id").notNull().references(() => capabilityGapAnalyses.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  targetDate: timestamp("target_date", { withTimezone: true }),
  estimatedHours: integer("estimated_hours"),
  steps: jsonb("steps").$type<Array<{ id: string; title: string; objective: string; activities: string[]; milestone: string; evidenceRequired: string[]; estimatedHours?: number; prerequisites?: string[] }>>().notNull().default(sql`'[]'::jsonb`),
  status: text("status").notNull().default("proposed"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index("learning_roadmaps_profile_idx").on(t.profileId, t.createdAt),
  check("learning_roadmaps_hours_ck", sql`${t.estimatedHours} is null or ${t.estimatedHours} >= 0`),
  check("learning_roadmaps_status_ck", sql`${t.status} in ('proposed','active','paused','completed','superseded')`),
]);
