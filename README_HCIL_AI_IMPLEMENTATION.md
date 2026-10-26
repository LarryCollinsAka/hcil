# HCIL AI orchestration — implementation patch

This patch targets the supplied HCIL snapshot (`hcil(2).zip`): Next.js App Router, TypeScript, Supabase Auth, Drizzle ORM, and PostgreSQL. It adds actual server-side orchestration code rather than another architecture-only document.

## Included

- `src/app/api/ai/orchestrate/route.ts` — authenticated, permission-checked HTTP entry point.
- `src/ai/orchestration/controller.ts` — one controller, bounded input, route selection, optional fallback, structured-output handling.
- `src/ai/orchestration/registry.ts` — central model registry and task routing.
- `src/ai/orchestration/providers/nvidia-compatible.ts` — server-side NVIDIA-compatible API adapter using native `fetch`; no new npm package required.
- `src/ai/orchestration/prompts.ts` — shared policy plus task-specific instructions.
- `src/ai/orchestration/types.ts` — shared task and provider contracts.
- `scripts/artifacts/0008_ai_orchestration_permission.sql` — creates the permission key without granting it to any role.
- `.env.hcil-ai.example` — configuration template with no secrets.

## Apply the patch

1. Make a backup/commit of your current repository.
2. Extract the ZIP into the repository root, preserving the `src/` and `scripts/` folders. It adds files; it does not overwrite existing files in this snapshot.
3. Add `NVIDIA_API_KEY` and the `HCIL_AI_*` settings to your local `.env.local` and Vercel server-side environment variables. Do not commit the real key.
4. Apply `scripts/artifacts/0008_ai_orchestration_permission.sql` using the same approved database migration workflow as the other HCIL SQL artifacts. This only inserts the permission definition.
5. Grant `ai.orchestration.use` only to a role that should access the pilot. The patch deliberately does not guess which role is authorized. A role needs a row in `access_role_permissions` linking its `access_roles.id` to this permission's `access_permissions.id`.
6. Run `npm run build` and resolve any repository-specific build errors before deploying.

## Request example

`POST /api/ai/orchestrate`

```json
{
  "taskType": "TEXT_SYNTHESIS",
  "language": "en",
  "input": {
    "sourceText": "Paste authorized text here",
    "goal": "Summarize key capability evidence and gaps"
  },
  "useFallback": true
}
```

The request must come from a signed-in user whose HCIL profile exists and who has the `ai.orchestration.use` permission. The response includes a trace ID, model ID, route policy version, output, and warnings.

## Current limits — important

- This first implementation handles text tasks. It does **not yet** send images/video to Muse or Gemma; Muse is disabled by default. Multimodal payload support should be implemented only after the exact NVIDIA endpoint contract is tested.
- Routing is deliberately simple and provisional. Nemotron is selected for text synthesis and capability extraction; Gemma is selected for language transformation, learning-pathway drafts, and matching assistance. This is a test route, not a benchmark conclusion.
- `CAPABILITY_EXTRACTION`, `LEARNING_PATHWAY_DRAFT`, and `MATCHING_ASSISTANCE` require JSON. Invalid JSON is returned as `NEEDS_REVIEW` with raw text and must not be persisted as structured data.
- This patch does not persist AI results, write to Qdrant/FalkorDB, invoke arbitrary tools, or change hiring/payment/eligibility decisions. Those should be added through narrow domain services after the first route is tested.
- A model fallback is marked `NEEDS_REVIEW`; the fallback is not considered equivalent or verified.
- The permission seed is intentionally not granted to a role automatically. Choose the authorized role explicitly.

## Pilot smoke test

1. Sign in as an account that has an HCIL profile and the permission.
2. Call the route with `TEXT_SYNTHESIS` and non-sensitive sample text.
3. Confirm the response contains `status`, `traceId`, `model.modelId`, `output`, and `warnings`.
4. Test an unauthenticated request (must return 401) and a user without permission (must return 403).
5. Test missing `NVIDIA_API_KEY`, a timeout, invalid task type, and malformed structured output.
6. Review provider availability, rate limits, model parameters, and hosted-service terms before enabling for real users.
