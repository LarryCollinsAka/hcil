export const HCIL_TASK_TYPES = [
  "TEXT_SYNTHESIS",
  "CAPABILITY_EXTRACTION",
  "LANGUAGE_TRANSFORM",
  "LEARNING_PATHWAY_DRAFT",
  "MATCHING_ASSISTANCE",
] as const;

export type HcilTaskType = (typeof HCIL_TASK_TYPES)[number];
export type HcilLanguage = "en" | "fr";
export type HcilModelKey = "nemotron" | "museGlimmer" | "gemma";

export interface HcilTaskRequest {
  taskType: HcilTaskType;
  eventType?: import("../events/catalog").HcilAiEventType;
  input: unknown;
  language?: HcilLanguage;
  useFallback?: boolean;
}

export interface ModelCallInput {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
}

export interface ModelCallOutput {
  text: string;
  provider: "nvidia";
  model: string;
  requestId?: string;
  latencyMs: number;
}

export interface HcilOrchestrationResult {
  status: "SUCCEEDED" | "NEEDS_REVIEW";
  taskType: HcilTaskType;
  output: unknown;
  warnings: string[];
  traceId: string;
  model: { provider: string; modelId: string; route: string };
  prompt: { id: string; version: string };
}
