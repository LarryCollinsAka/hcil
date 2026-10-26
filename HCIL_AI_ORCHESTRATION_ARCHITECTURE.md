# HCIL AI Orchestration Architecture
**Status:** Proposed pilot architecture  
**Scope:** Human Capital Intelligence Lifecycle (HCIL) workforce platform  
**Version:** 0.1  
**Date:** 26 October 2026

---

## 1. Purpose and decision

HCIL will use a single application-level orchestration layer to coordinate a set of model providers and specialist models. The goal is to keep model choice replaceable while maintaining consistent authorization, data governance, output validation, auditability, and business rules.

The initial candidate models are:

- **NVIDIA Nemotron 3.5 Lightning 30B-A3B** — candidate for text-heavy agent workflows, long-context synthesis, and structured task planning.
- **Meta Muse Glimmer 30B** — candidate for visual evidence, screenshots, and document/image interpretation.
- **Google Gemma 4 31B IT** — candidate for general-purpose reasoning, multilingual tasks, coding, and multimodal comparison.

These assignments are **hypotheses for evaluation, not approved production responsibilities**. The pilot must test them against the same task set before roles are fixed.

### Important architectural decision

Nemotron is not the system orchestrator by itself. HCIL's deterministic application controller is the authoritative orchestrator. Nemotron may be selected as the primary **LLM planner** for the pilot if it passes the evaluation gates. Model outputs never independently authorize actions, verify credentials, determine payment eligibility, or commit transactions.

## 2. Design principles

1. **One orchestration entry point.** Product features call HCIL's orchestration API rather than directly calling individual model endpoints.
2. **Deterministic control, model-assisted reasoning.** Application code enforces permissions, eligibility, workflow state, validation, and side effects.
3. **Provider/model replaceability.** Model IDs, provider endpoints, prompts, and routing rules are configuration, not scattered hard-coded choices.
4. **Task-based routing.** Route using task type, required modalities, language, context length, sensitivity, latency target, and evaluation results.
5. **Least privilege.** Models receive only the minimum context needed and access tools through narrow, permission-checked HCIL APIs.
6. **Structured outputs.** Model results must conform to versioned schemas before they can be consumed by application logic.
7. **Evidence provenance.** Every claim about a candidate's capability must distinguish self-reported, inferred, and independently verified evidence.
8. **Observable and auditable.** Record model/provider, prompt version, route, latency, token usage when available, validation outcome, fallback, and task outcome. Avoid storing unnecessary sensitive content.
9. **Graceful failure.** Timeouts, malformed outputs, provider errors, and low-quality results trigger controlled retries, fallback, or a safe human-review state.
10. **Derived indexes are not authoritative.** PostgreSQL remains the source of truth; vector and graph indexes are rebuildable projections.

## 3. Logical architecture

```text
HCIL product feature
    |
    v
Orchestration API / Task Gateway
    |
    v
Deterministic Orchestration Controller
    |-- authenticate actor and authorize task
    |-- classify task and apply policy
    |-- build minimum necessary context
    |-- select route from registry
    |-- call model through provider adapter
    |-- validate schema, provenance, and policy
    |-- retry / fallback / human review
    |-- emit audit record and task outcome
    |
    +--> Nemotron adapter
    +--> Muse Glimmer adapter
    +--> Gemma 4 adapter
    +--> future model/provider adapters
    |
    v
Scoped HCIL tools / domain APIs
    |-- PostgreSQL-backed domain services
    |-- Qdrant retrieval API
    |-- FalkorDB graph query API
    |-- Redis cache / rate-limit / ephemeral state
    |-- approved document and evidence services
    |
    v
Versioned result contract + audit/event record
```

This is a logical architecture, not a requirement to split the pilot into microservices. Start with a modular monolith and well-defined modules. Deploy a separate worker only when workload, isolation, or reliability needs justify it.

## 4. Responsibilities and model roles

### 4.1 Deterministic controller — always authoritative

The controller owns:
- Authentication and authorization checks.
- Task classification and route selection.
- Context minimization and data-access policy.
- Tool allowlists and argument validation.
- JSON/schema validation and domain-level checks.
- Retry limits, timeouts, fallback policy, and budget ceilings.
- Transaction boundaries and idempotency.
- Audit events, trace IDs, and evaluation telemetry.
- Final business decisions and user-visible status.

The controller must not treat model confidence as proof of truth.

### 4.2 Nemotron — candidate planner / text-agent specialist

Evaluate for:
- Planning multi-step text-centric tasks.
- Summarizing long work histories, role requirements, and learning materials.
- Extracting structured capabilities from text documents.
- Producing candidate task plans and tool-call proposals.
- Drafting learning-path recommendations from approved evidence.

Do not permit it to independently:
- Grant access or change account roles.
- Certify a capability or credential.
- Make a binding employment eligibility decision.
- Commit a payment, payout, or contract.
- Override matching policy or write directly to canonical tables.

### 4.3 Muse Glimmer — candidate visual specialist

Evaluate for:
- Reading screenshots, portfolios, and image-based documents.
- Extracting visual evidence with page/region references when supported.
- Interpreting interface screenshots and visual task submissions.
- Flagging uncertainty, illegibility, or conflicting visual evidence.

Do not treat image interpretation as identity verification or proof that a portfolio item was created by the candidate. Any consequential claim needs corroboration and a defined verification process.

### 4.4 Gemma 4 — candidate general-purpose / multilingual specialist

Evaluate for:
- English/French task handling and cross-language consistency.
- General reasoning and structured extraction.
- Coding and workflow assistance.
- Multimodal analysis where the selected endpoint supports the required input.
- Independent challenger/reviewer runs on a sample of high-impact model outputs.

Do not assume a model card's multimodal claims mean every hosted API endpoint accepts every modality. Verify the exact model deployment and API contract.

### 4.5 Routing principle

Do not call all three models for every task. Use one primary model per task, with a second model only where the policy justifies independent review or fallback. Multi-model voting can increase latency and cost and does not guarantee correctness.

## 5. Task routing policy

The routing registry should use a versioned task key and explicit requirements. Example initial policy:

| Task family | Initial candidate | Optional challenger/fallback | Required checks |
|---|---|---|---|
| Long text synthesis | Nemotron | Gemma | Source references, completeness, schema |
| Capability extraction from text | Nemotron or Gemma, selected by evaluation | Other model | Evidence IDs, provenance labels, no invented claims |
| Screenshot / image evidence | Muse or Gemma, based on modality tests | Other supported visual model | Input modality supported, uncertainty, evidence location |
| English/French support | Gemma or Nemotron, based on measured results | Other model | Meaning preservation, language quality, terminology |
| Learning pathway draft | Best-performing evaluated text model | Challenger on sampled cases | Prerequisite rules, evidence linkage, no guaranteed outcomes |
| Coding assistance | Best-performing evaluated model | Optional reviewer | Tests, static checks, sandbox, no direct production writes |
| High-impact matching support | Model produces recommendation only | Independent review if policy requires | Explainable factors, evidence provenance, deterministic policy checks |
| Authorization, payments, eligibility enforcement | No model decision | None | Deterministic domain service only |

Routing decisions should consider:
- `taskType`
- `requiredModalities`
- `language`
- `inputSize` and context limit
- `dataSensitivity`
- `latencyBudgetMs`
- `costBudget`
- `modelEvaluationStatus`
- `providerHealth`
- `fallbackPolicyVersion`

## 6. Request lifecycle

1. A product feature submits a typed task request to the HCIL Task Gateway.
2. The gateway authenticates the caller and assigns a trace ID.
3. The controller checks permissions and whether the task is permitted.
4. The controller fetches the minimum necessary domain context through HCIL services.
5. The router selects a model using the current, versioned routing policy.
6. A provider adapter normalizes the request and calls the selected endpoint.
7. The adapter normalizes provider errors and response metadata.
8. The controller validates the response against the task's versioned output schema.
9. Domain validators check references, evidence IDs, constraints, and prohibited claims.
10. If validation fails, the controller may retry within a strict limit, route to an approved fallback, or send the task for human review.
11. The application persists only permitted, validated results through domain services and normal transaction rules.
12. The system emits an audit event and telemetry record; the caller receives a typed result or safe error state.

Model output must never be executed as arbitrary code or accepted as an unrestricted SQL query.

## 7. Common task contract

Use a stable envelope around model-specific payloads. Illustrative TypeScript contract:

```ts
export type HcilTaskType =
  | "TEXT_SYNTHESIS"
  | "CAPABILITY_EXTRACTION"
  | "VISUAL_EVIDENCE_EXTRACTION"
  | "LANGUAGE_TRANSFORM"
  | "LEARNING_PATHWAY_DRAFT"
  | "MATCHING_ASSISTANCE"
  | "CODING_ASSISTANCE";

export interface HcilTaskRequest<TInput = unknown> {
  taskId: string;
  traceId: string;
  taskType: HcilTaskType;
  input: TInput;
  language?: "en" | "fr";
  requiredModalities?: Array<"text" | "image" | "video">;
  contextRefs?: Array<{ type: string; id: string }>;
  outputSchemaVersion: string;
  latencyBudgetMs?: number;
  dataSensitivity: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL";
}

export interface EvidenceReference {
  evidenceId: string;
  sourceType: "SELF_REPORTED" | "DOCUMENT" | "ASSESSMENT" | "EMPLOYER_VERIFIED" | "PLATFORM_VERIFIED";
  excerpt?: string;
  location?: string;
}

export interface HcilTaskResult<TOutput = unknown> {
  taskId: string;
  traceId: string;
  status: "SUCCEEDED" | "NEEDS_REVIEW" | "FAILED";
  output?: TOutput;
  evidence: EvidenceReference[];
  warnings: string[];
  model: {
    provider: string;
    modelId: string;
    promptVersion: string;
    routePolicyVersion: string;
  };
}
```

This is a starting contract. Define task-specific output schemas separately; do not allow every task to return an untyped generic object in production. Validate runtime payloads with a schema library such as Zod or JSON Schema.

## 8. Provider adapter boundary

Each model adapter implements a common interface. The rest of HCIL should not depend on NVIDIA-specific request parameters.

```ts
export interface ModelRequest {
  modelId: string;
  systemPrompt: string;
  userPayload: unknown;
  temperature?: number;
  maxOutputTokens: number;
  timeoutMs: number;
  responseFormat?: "json";
}

export interface ModelResponse {
  text: string;
  provider: string;
  modelId: string;
  requestId?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  finishReason?: string;
}

export interface ModelProvider {
  generate(request: ModelRequest): Promise<ModelResponse>;
}
```

Adapter responsibilities:
- Read credentials only from deployment environment/secret storage.
- Apply provider-specific URL, headers, and request parameters.
- Use bounded timeouts and retries only for retryable errors.
- Normalize usage, finish reason, request ID, and errors.
- Reject unsupported modalities or options before making a request.
- Never log API keys or unredacted sensitive prompts.
- Avoid exposing internal reasoning traces to end users.

For NVIDIA's OpenAI-compatible API, the base URL supplied for the current candidates is `https://integrate.api.nvidia.com/v1`. Confirm each model's currently supported parameters, input modalities, rate limits, and hosted-service terms before production use. Keep `NVIDIA_API_KEY` in environment/secret storage; never commit it to Git.

## 9. Prompt and schema governance

Keep prompts in a governed directory rather than embedding long prompt strings throughout route handlers. Suggested structure:

```text
src/
  ai/
    orchestration/
      controller.ts
      router.ts
      policy.ts
      registry.ts
      schemas/
        task-request.ts
        capability-extraction.v1.ts
        visual-evidence.v1.ts
        learning-pathway.v1.ts
      prompts/
        shared/
          safety-and-provenance.v1.md
        tasks/
          text-synthesis.v1.md
          capability-extraction.v1.md
          visual-evidence-extraction.v1.md
          language-transform.v1.md
          learning-pathway-draft.v1.md
          matching-assistance.v1.md
      providers/
        types.ts
        nvidia-openai-compatible.ts
        nemotron.ts
        muse-glimmer.ts
        gemma.ts
      evaluation/
        dataset-manifest.md
        metrics.ts
        run-evaluation.ts
      telemetry/
        audit.ts
        metrics.ts
```

The exact path may be adapted to the existing repository. The key rule is one shared orchestration module, one model registry, versioned task prompts, and versioned output schemas. Avoid creating separate standalone orchestration implementations for each model.

Every prompt version should document its task, permitted context, required output shape, evidence rules, refusal/escalation behavior, and evaluation cases. Changes to prompts or model IDs should be traceable in audit records.

## 10. Data and tool boundaries

- **PostgreSQL:** canonical records and transactions for users, capabilities, evidence metadata, work packages, milestones, enrollments, payments, and permissions.
- **Qdrant:** semantic retrieval index; retrieved text is untrusted context and must be checked against source permissions.
- **FalkorDB:** graph relationships and traversal; use narrow, parameterized domain queries.
- **Redis:** caching, rate limits, idempotency support, and ephemeral state—not the canonical record of a completed payment or verified capability.
- **HCIL domain APIs:** the only approved route for model-requested actions.

The model should request a named tool, such as `search_authorized_evidence`, rather than receive database credentials. The controller validates tool name, arguments, actor permissions, query scope, and result size. Mutating tools require explicit policy checks and must be idempotent where appropriate.

Use the transactional outbox pattern for propagating canonical changes to Qdrant/FalkorDB. Derived indexes can be rebuilt from PostgreSQL and should not become a second source of truth.

## 11. Failure handling and fallback

Use bounded, observable failure handling:

- **Timeout / transient provider failure:** retry only when safe, with a small configured limit and jittered backoff.
- **Rate limit / quota exceeded:** route to an approved fallback if the task policy permits; otherwise queue or return a recoverable status.
- **Malformed structured output:** one constrained repair attempt may be allowed; validate again. Never silently accept invalid output.
- **Unsupported modality / context too large:** reject before dispatch or use an approved preprocessing route.
- **Evidence references do not exist:** reject the affected claims and request regeneration or human review.
- **Conflicting model answers:** do not average blindly; preserve disagreement and route according to task impact.
- **Low evaluation status / model withdrawn:** remove the model from eligible routes through configuration.
- **High-impact or ambiguous case:** return `NEEDS_REVIEW` instead of forcing a confident answer.

Fallback must preserve the task's security and data policies. A fallback model cannot be used if it has not been evaluated for the required language, modality, sensitivity, or output schema.

## 12. Security, privacy, and responsible use

1. Keep model API keys in Vercel/server environment variables or a secrets manager. Never place them in browser code, source control, prompts, or logs.
2. Do not send personal data to a model unless necessary for the task and permitted by policy.
3. Minimize and redact sensitive fields where feasible.
4. Apply tenant/user access rules before retrieval, not after model generation.
5. Treat retrieved documents, uploaded files, and tool outputs as untrusted data; they may contain prompt injection.
6. Separate instructions from evidence. Evidence cannot override system policy or grant tool permissions.
7. Require deterministic checks and, where appropriate, human review for consequential decisions.
8. Keep auditable records of what evidence supported a recommendation, but set retention rules and avoid logging secrets or excessive raw content.
9. Do not present inferred capabilities as verified credentials.
10. Provide a clear appeal/correction route for users affected by consequential outputs.

## 13. HCIL Model Evaluation Suite

Do not finalize orchestration roles from model-card benchmarks alone. Run all candidates against the same representative, versioned dataset and scoring rubric.

### Evaluation dimensions

| Dimension | What to measure |
|---|---|
| Capability extraction | Precision/recall, unsupported claims, evidence linkage |
| Candidate-to-work assistance | Ranking quality against reviewed cases, explanation fidelity, policy violations |
| English/French | Meaning preservation, terminology, parity between languages |
| Visual evidence | Extraction accuracy, localization/page references, uncertainty calibration |
| Long-context synthesis | Omission rate, contradiction handling, source attribution |
| Structured output | Schema pass rate, invalid IDs, retry rate |
| Tool use | Correct tool choice, argument validity, refusal of unauthorized actions |
| Reliability | Timeout/error rate, repeatability, safe failure |
| Performance | Median and p95 latency, throughput |
| Cost | Cost per successful task using actual provider billing/usage data |
| Safety and privacy | Data leakage, prompt-injection resistance, prohibited action attempts |

### Pilot process

1. Create a fixed evaluation dataset from representative HCIL tasks; remove or anonymize personal data.
2. Establish expected outputs and reviewer scoring guidance before testing.
3. Test each candidate with identical inputs and task-specific settings.
4. Include adversarial cases: missing evidence, conflicting records, prompt injection, unsupported languages/modalities, and unauthorized tool requests.
5. Record results by model version, prompt version, and route-policy version.
6. Define acceptance thresholds before reviewing results.
7. Run a limited shadow pilot; do not allow model suggestions to trigger consequential actions.
8. Approve task-specific routes only after quality, safety, latency, and cost gates pass.
9. Re-evaluate after material prompt, model, endpoint, or policy changes.

Do not assume a model's self-reported confidence is calibrated. Measure correctness and uncertainty behavior against labelled cases.

## 14. Initial release plan

### Phase 1 — foundation
- Implement the task gateway, deterministic controller, model registry, provider interface, schema validation, and audit metadata.
- Add one low-risk task end to end, such as text summarization over authorized source material.
- Add feature flags to disable model calls without disabling core HCIL workflows.

### Phase 2 — controlled model comparison
- Add Nemotron, Muse, and Gemma adapters only for supported capabilities.
- Run the evaluation suite and compare model/task combinations.
- Keep a single primary route per task; enable challengers selectively.

### Phase 3 — evidence-aware pilot
- Introduce capability extraction and visual-document tasks with provenance fields.
- Persist model outputs as proposals until domain validators and review policies accept them.
- Monitor error rates, cost, latency, and human corrections.

### Phase 4 — limited production
- Enable only task routes that pass predeclared gates.
- Add rate limits, budgets, fallback rules, incident response, and rollback switches.
- Keep authorization, credential verification, employment eligibility enforcement, and payments deterministic.

## 15. Pilot acceptance gates

Before any task is production-enabled, require:
- A named owner and documented user impact.
- A versioned input/output schema.
- An evaluation dataset and predeclared pass thresholds.
- No unresolved critical privacy/security issues.
- Valid evidence references and explicit provenance where evidence is used.
- Bounded latency, retry, and cost behavior.
- A tested fallback or safe failure state.
- Auditable model/prompt/route versions.
- A feature flag and rollback procedure.
- Human review requirements defined for high-impact or ambiguous cases.

Thresholds should be selected from HCIL's actual risk and pilot needs rather than invented in this architecture document.

## 16. Open decisions

These are intentionally unresolved until implementation details and pilot evidence are available:

1. Whether Nemotron is the primary LLM planner after evaluation.
2. Exact model IDs and endpoint features available to HCIL's NVIDIA account.
3. Hosted API rate limits, pricing, retention, and trial terms.
4. Which task families need a second-model review.
5. Output-schema and evaluation thresholds for each task.
6. Whether a separate asynchronous worker is needed for long-running jobs.
7. Audit-data retention periods and redaction policy.
8. Production hosting and monitoring choices.

## 17. Final recommendation

Adopt **one HCIL orchestration layer with a deterministic controller and replaceable model adapters**. Treat Nemotron as the first candidate for text-agent planning, Muse Glimmer as a visual specialist candidate, and Gemma 4 as a general/multilingual challenger—then let the evaluation suite decide the actual routing.

This master architecture should govern all individual model references, prompts, adapters, evaluation results, and deployment instructions. Individual model notes are supporting records, not independent architectures.
