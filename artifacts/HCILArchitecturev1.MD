# HCIL Architecture v1

Status: baseline for MVP

## Decision

HCIL starts as a **modular monolith** with clear domain boundaries, domain events, and a transactional outbox. No microservices at MVP.

Order of decisions: domain boundaries → module contracts → communication style → deployment boundary.

A module becomes a separate service only when there is a concrete operational reason.

## MVP modules

| Module | Owns |
|---|---|
| reference | languages, aliases, platform locales, capability domains, capabilities, capability aliases/translations |
| identity | profiles, organizations, staff roles |
| content | pages, blog, forums |
| capability | assessments, evidence, worker capability vector, language proficiency |
| work | work requests/packages, requirements, milestones, submissions, acceptance |
| matching | matches, micro-team formation, Qdrant synchronization |
| payments | escrow ledger, payment-provider calls |

Shared infrastructure (not a business module): `outbox_events`, `processed_events`.

Deferred: learning/development, until the capability → work → performance loop is proven.

## Ownership rules

1. A module owns its tables and is the only module that writes them.
2. One code folder per module, with a small public interface (commands, queries, events).
3. Modules do not import another module's table definitions. Enforce with an ESLint import-boundary rule.
4. All tables stay in the `public` schema; ownership is enforced in code, not with Postgres schemas.
5. Cross-module reads go through the owning module's query functions. Direct reads are a documented exception for proven hot paths only.
6. PostgreSQL is the source of truth. Qdrant is a derived index and can be rebuilt.

## Synchronous vs asynchronous

- **Synchronous, one transaction:** anything that must be consistent together. Example: assessment passed → evidence written → worker capability vector updated.
- **Outbox (eventual):** Qdrant indexing, AI work decomposition, notifications, analytics, external integrations.

## Event rule

A domain operation changes authoritative state and inserts an `outbox_events` row in the same transaction. A separate drainer runs the side effects.

- Delivery is at-least-once, so every handler is idempotent (guarded by `processed_events`).
- Failed events retry with backoff. After the attempt limit they are marked dead for human attention, never silently dropped.
- The outbox table is the contract. The drainer technology is replaceable.

## Running the drainer

The drainer must be small, resumable and safe to run concurrently (claim rows with `FOR UPDATE SKIP LOCKED` and a lease). Options:

- **Supabase `pg_cron` calling an Edge Function:** works on any Vercel plan, and is the safest default for per-minute draining.
- **Vercel Cron to a protected route:** every plan allows up to 100 cron jobs per project, but on the Hobby plan each job can run at most once a day with imprecise timing (expressions that run more often fail at deploy). Per-minute draining needs Pro. Cron is UTC-only.
- **Next.js `after()`:** drain opportunistically right after a write, as a complement to a scheduled drain.
- **A dedicated job service:** later, if volume or retries demand it.

Supabase Queues (PGMQ) is documented as a Postgres-native durable queue, but check its current release status before depending on it. The outbox abstraction keeps HCIL independent of it either way.

## Extraction criteria

Extract a module into a service only if one or more is true:

- it has materially different scaling or runtime needs;
- it needs an independent release cadence;
- its data ownership boundary is already proven in production;
- it needs specialized infrastructure or compliance isolation;
- independent failure isolation materially improves the platform.

Likely first extraction: AI inference and background processing (slow, costly, operationally different). Payments is a separate module for strict ownership and auditability, but not a separate deployment initially.

## Reference data governance

1. Canonical rows (languages, platform locales, capability domains, capabilities) are deprecated, never deleted. Foreign keys pointing at them are `ON DELETE RESTRICT`. A row that never left `draft` may be removed by a controlled, audited admin operation.
2. Translation rows are subordinate to their parent and cascade with it.
3. Language aliases may be ambiguous across languages; uniqueness is per (alias, language) and search returns candidates.
4. Capability aliases are unique per language, and unique among language-neutral aliases. Resolution prefers a language-specific alias over a neutral one.
5. `replaced_by_id` must point to an active row. Enforced in the admin service.
6. Locale fallback chains are acyclic and end at the default locale. Enforced in the locale-management service; the resolver caps chain length.
7. Evidence attaches only to active capabilities.
8. Every insert, update and delete on taxonomy tables is audited by trigger, including edits made outside the app.

## Capability principle

HCIL never represents human capability as a single aggregate employability or intelligence score. Capability is multidimensional, contextual, evidence-backed and time-dependent.

## Core rule

HCIL is modular in design before it is distributed in deployment. Extracting a service later is a deployment choice, not a domain rewrite.