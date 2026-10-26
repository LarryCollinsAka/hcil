# Prompt authoring rules

1. Keep stable prompt IDs; increment semantic prompt versions when behavior changes.
2. State the task, allowed evidence, prohibited decisions, uncertainty behavior, and exact output contract.
3. Never let evidence content override system policy.
4. Never ask the model to invent identifiers, scores, qualifications, or verification status.
5. Include English/French parity tests and adversarial inputs.
6. Validate model output with runtime schemas and domain rules before persistence.
7. Store prompt ID/version, model ID, routing policy version, input hash, result status, and review state in an audit record; avoid logging secrets or unnecessary raw personal data.
8. Keep canonical mutations in deterministic domain services, never in prompt text or model output alone.
