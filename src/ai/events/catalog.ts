import type { HcilTaskType } from "../orchestration/types";

/**
 * HCIL's first prompt-event catalog.
 * These are AI task events, not a claim that every domain mutation currently emits them.
 * Outbox producers must be added transactionally to the relevant domain services.
 */
export const HCIL_AI_EVENTS = {
  "candidate.profile.updated": {
    promptId: "candidate.profile.updated",
    promptVersion: "1.0.0",
    taskType: "CAPABILITY_EXTRACTION",
    purpose: "Organize profile claims and linked evidence without treating claims as verified.",
    inputContract: ["candidateProfile", "evidenceRecords"],
    outputContract: "capabilities, missingEvidence, warnings",
    sensitivity: "personal-data",
    humanReview: true,
  },
  "evidence.record.submitted": {
    promptId: "evidence.record.submitted",
    promptVersion: "1.0.0",
    taskType: "CAPABILITY_EXTRACTION",
    purpose: "Extract evidence-supported facts from authorized text already extracted by a trusted service.",
    inputContract: ["evidenceId", "sourceType", "extractedText", "relatedCapabilities"],
    outputContract: "capabilities, missingEvidence, warnings",
    sensitivity: "personal-data",
    humanReview: true,
  },
  "assessment.attempt.completed": {
    promptId: "assessment.attempt.completed",
    promptVersion: "1.0.0",
    taskType: "CAPABILITY_EXTRACTION",
    purpose: "Summarize capability signals from an assessment and its rubric; do not replace deterministic scoring.",
    inputContract: ["attemptId", "rubric", "assessmentResults", "evidenceReferences"],
    outputContract: "capabilities, missingEvidence, warnings",
    sensitivity: "assessment-data",
    humanReview: true,
  },
  "capability.profile.recompute.requested": {
    promptId: "capability.profile.recompute.requested",
    promptVersion: "1.0.0",
    taskType: "CAPABILITY_EXTRACTION",
    purpose: "Produce an evidence-linked capability summary from approved profile and evidence records.",
    inputContract: ["workerId", "capabilities", "evidenceRecords", "assessmentResults"],
    outputContract: "capabilities, missingEvidence, warnings",
    sensitivity: "personal-data",
    humanReview: true,
  },
  "matching.requested": {
    promptId: "matching.requested",
    promptVersion: "1.0.0",
    taskType: "MATCHING_ASSISTANCE",
    purpose: "Explain evidence-backed alignment and gaps between requirements and candidate capabilities.",
    inputContract: ["workRequirements", "candidateEvidence", "matchingRubric"],
    outputContract: "fitEvidence, gaps, unknowns, recommendation, warnings",
    sensitivity: "employment-related",
    humanReview: true,
  },
  "development.pathway.requested": {
    promptId: "development.pathway.requested",
    promptVersion: "1.0.0",
    taskType: "LEARNING_PATHWAY_DRAFT",
    purpose: "Draft learning and practice steps tied to evidenced gaps and available resources.",
    inputContract: ["learningGoal", "capabilities", "evidenceGaps", "availableResources"],
    outputContract: "goal, steps, assumptions, warnings",
    sensitivity: "personal-data",
    humanReview: true,
  },
  "work.package.draft.requested": {
    promptId: "work.package.draft.requested",
    promptVersion: "1.0.0",
    taskType: "TEXT_SYNTHESIS",
    purpose: "Clarify a proposed work package's scope, deliverables, dependencies, and ambiguities.",
    inputContract: ["requestDescription", "constraints", "proposedMilestones"],
    outputContract: "text summary; not a persisted or approved work package",
    sensitivity: "business-confidential",
    humanReview: true,
  },
  "milestone.submission.review.requested": {
    promptId: "milestone.submission.review.requested",
    promptVersion: "1.0.0",
    taskType: "TEXT_SYNTHESIS",
    purpose: "Summarize submitted evidence against acceptance criteria and flag questions for a human reviewer.",
    inputContract: ["milestoneCriteria", "submissionDescription", "evidenceReferences"],
    outputContract: "text summary; never an acceptance decision",
    sensitivity: "business-confidential",
    humanReview: true,
  },
  "team.formation.requested": {
    promptId: "team.formation.requested",
    promptVersion: "1.0.0",
    taskType: "MATCHING_ASSISTANCE",
    purpose: "Identify complementary evidence-backed capabilities and team coverage gaps.",
    inputContract: ["teamObjective", "requiredCapabilities", "memberEvidence", "constraints"],
    outputContract: "fitEvidence, gaps, unknowns, recommendation, warnings",
    sensitivity: "employment-related",
    humanReview: true,
  },
  "language.evidence.submitted": {
    promptId: "language.evidence.submitted",
    promptVersion: "1.0.0",
    taskType: "CAPABILITY_EXTRACTION",
    purpose: "Organize language evidence and test results without inferring proficiency beyond supplied evidence.",
    inputContract: ["languageId", "modality", "sourceType", "testResults", "evidenceReferences"],
    outputContract: "capabilities, missingEvidence, warnings",
    sensitivity: "personal-data",
    humanReview: true,
  },
} as const satisfies Record<string, {
  promptId: string;
  promptVersion: string;
  taskType: HcilTaskType;
  purpose: string;
  inputContract: readonly string[];
  outputContract: string;
  sensitivity: string;
  humanReview: boolean;
}>;

export type HcilAiEventType = keyof typeof HCIL_AI_EVENTS;
export const HCIL_AI_EVENT_TYPES = Object.keys(HCIL_AI_EVENTS) as HcilAiEventType[];

export function isHcilAiEventType(value: string): value is HcilAiEventType {
  return Object.prototype.hasOwnProperty.call(HCIL_AI_EVENTS, value);
}

export function getHcilAiEvent(eventType: HcilAiEventType) {
  return HCIL_AI_EVENTS[eventType];
}
