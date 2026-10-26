import type { HcilModelKey, HcilTaskType } from "./types";

export interface ModelDefinition {
  key: HcilModelKey;
  id: string;
  enabled: boolean;
}

const modelDefinitions: Record<HcilModelKey, ModelDefinition> = {
  nemotron: {
    key: "nemotron",
    id: process.env.HCIL_NEMOTRON_MODEL ?? "nvidia/nemotron-3.5-lightning-30b-a3b",
    enabled: process.env.HCIL_AI_NEMOTRON_ENABLED !== "false",
  },
  museGlimmer: {
    key: "museGlimmer",
    id: process.env.HCIL_MUSE_MODEL ?? "meta/muse-glimmer-30b",
    enabled: process.env.HCIL_AI_MUSE_ENABLED === "true",
  },
  gemma: {
    key: "gemma",
    id: process.env.HCIL_GEMMA_MODEL ?? "google/gemma-4-31b-it",
    enabled: process.env.HCIL_AI_GEMMA_ENABLED !== "false",
  },
};

export function getModel(key: HcilModelKey): ModelDefinition {
  const model = modelDefinitions[key];
  if (!model.enabled) throw new Error("AI_MODEL_DISABLED");
  return model;
}

/** Routing is deliberately explicit and versionable. Change only after evaluation. */
export function chooseModel(taskType: HcilTaskType): HcilModelKey {
  switch (taskType) {
    case "TEXT_SYNTHESIS":
    case "CAPABILITY_EXTRACTION":
      return "nemotron";
    case "LANGUAGE_TRANSFORM":
    case "LEARNING_PATHWAY_DRAFT":
    case "MATCHING_ASSISTANCE":
      return "gemma";
    default: {
      const exhaustive: never = taskType;
      return exhaustive;
    }
  }
}

export function chooseFallback(primary: HcilModelKey): HcilModelKey | null {
  const candidates: HcilModelKey[] = ["gemma", "nemotron", "museGlimmer"];
  for (const key of candidates) {
    if (key === primary) continue;
    try {
      return getModel(key).key;
    } catch {
      // Skip models disabled by environment configuration.
    }
  }
  return null;
}
