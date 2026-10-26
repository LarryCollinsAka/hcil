# HCIL AI event catalog

## Contract

Each AI-enabled event definition identifies:

- a stable event type and prompt ID;
- a prompt version;
- one existing orchestration task type;
- the expected input fields and output shape;
- a data-sensitivity category;
- whether human review is required.

The event catalog is not a domain event bus. A domain service must authorize the operation, commit the canonical PostgreSQL mutation and its outbox row atomically, and only then let a worker consume the event. Prompt content and retrieved documents are untrusted data.

## Event lifecycle

1. Domain service validates actor, scope, and business invariants.
2. Domain mutation and outbox event commit in one PostgreSQL transaction.
3. Worker claims the outbox event with an idempotency key and lease.
4. Worker loads only authorized, minimal context from PostgreSQL.
5. Registry selects prompt ID/version and task policy.
6. Model returns a draft result.
7. Runtime schema validation and domain validation run.
8. High-impact results enter human review; they do not directly mutate canonical decisions.
9. Result metadata is audited and derived-index updates are separately emitted when needed.

## Evaluation cases

Every prompt version should be evaluated against at least:

- valid and complete evidence;
- empty or missing evidence;
- contradictory evidence;
- self-reported claim presented alongside verified evidence;
- malicious instructions embedded in a source document;
- unknown evidence IDs;
- English and French inputs with equivalent meaning;
- oversized and malformed input;
- provider timeout, rate limit, malformed JSON, and fallback model;
- requests attempting to decide hiring, legal eligibility, payment, or milestone acceptance.
