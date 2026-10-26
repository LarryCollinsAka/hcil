# HCIL Event-Specific Prompt Catalog — Phase 1

## Purpose

This overlay extends the existing HCIL AI orchestration implementation with a versioned event catalog and an event-aware prompt registry. It keeps the existing five `HcilTaskType` values and the current NVIDIA-compatible provider adapter.

## What this patch changes

- Adds `src/ai/events/catalog.ts` with the first ten event/task definitions, prompt IDs, versions, intended input fields, output contracts, sensitivity labels, and human-review requirements.
- Adds `src/ai/orchestration/prompt-registry.ts` with shared safety policy plus task-specific and event-specific instructions.
- Adds optional `eventType` to the existing orchestration request contract and route validation.
- Returns `prompt.id` and `prompt.version` in the orchestration response so a caller can identify which prompt definition was used.
- Rejects event/task mismatches.

## Event catalog in this first iteration

| Event | Task | Important boundary |
|---|---|---|
| `candidate.profile.updated` | `CAPABILITY_EXTRACTION` | Profile claims are not automatically verified |
| `evidence.record.submitted` | `CAPABILITY_EXTRACTION` | Expects text already extracted by a trusted service; no OCR is implemented here |
| `assessment.attempt.completed` | `CAPABILITY_EXTRACTION` | Does not replace deterministic assessment scoring |
| `capability.profile.recompute.requested` | `CAPABILITY_EXTRACTION` | Does not write canonical capability records |
| `matching.requested` | `MATCHING_ASSISTANCE` | Advisory only; no hiring or eligibility decision |
| `development.pathway.requested` | `LEARNING_PATHWAY_DRAFT` | Draft only; no guaranteed outcome |
| `work.package.draft.requested` | `TEXT_SYNTHESIS` | Draft analysis only; does not create/approve a work package |
| `milestone.submission.review.requested` | `TEXT_SYNTHESIS` | Summarizes evidence; cannot accept/reject a milestone |
| `team.formation.requested` | `MATCHING_ASSISTANCE` | No inference of consent, availability, or commitment |
| `language.evidence.submitted` | `CAPABILITY_EXTRACTION` | Does not infer proficiency from nationality or location |

These are **AI task event contracts**, not a claim that each underlying domain operation currently emits an event. The current repository snapshot has PostgreSQL outbox tables, but the domain-service producers must be reviewed and added in the same transaction as each canonical mutation before this catalog is treated as an automated event pipeline.

## Apply

1. Commit or back up the current HCIL repository.
2. Extract this ZIP into the repository root and merge the `src/` tree. It updates the existing AI orchestration `types.ts`, `controller.ts`, and `src/app/api/ai/orchestrate/route.ts`; it adds the event catalog and prompt registry.
3. Ensure the previous AI orchestration patch is already applied, including `src/ai/orchestration/registry.ts`, `src/ai/orchestration/providers/nvidia-compatible.ts`, and the protected orchestration route's dependencies. This overlay is not a standalone app.
4. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build` locally. Do not deploy until all pass.

## Request example

```json
{
  "taskType": "CAPABILITY_EXTRACTION",
  "eventType": "candidate.profile.updated",
  "language": "en",
  "input": {
    "candidateProfile": { "headline": "Customer support specialist" },
    "evidenceRecords": []
  },
  "useFallback": false
}
```

Use the exact task paired with the event in `src/ai/events/catalog.ts`. Omitting `eventType` retains the generic task prompt for backward compatibility.

## Important implementation limits

- Event input contracts are currently descriptive metadata; runtime per-event input validation is not implemented yet.
- The existing controller parses JSON for structured tasks but does not validate every field against a formal schema. Do not persist AI output as canonical records until Zod/JSON Schema validation and domain validation are added.
- The route is still a user-invoked orchestration endpoint. This patch does not subscribe to or drain the PostgreSQL outbox, add domain-event producers, persist AI execution audit rows, or synchronize Qdrant/FalkorDB.
- `TEXT_SYNTHESIS` remains text output. A milestone review is advisory text, not a machine-readable acceptance decision.
- Prompt versions are returned in the response, but durable audit persistence must be added before relying on long-term traceability.
- No build, typecheck, lint, live provider call, or database migration has been run against the user's local repository as part of producing this patch.
