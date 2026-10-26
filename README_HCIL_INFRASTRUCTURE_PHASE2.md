# HCIL Infrastructure Phase 2 — Qdrant, Redis Cloud, FalkorDB Cloud

This is an incremental patch for the HCIL Next.js App Router + Supabase Auth + Drizzle/PostgreSQL repository. It does not replace the authentication system or make any of the three external stores authoritative. PostgreSQL remains the system of record.

## Included

- Server-only Qdrant adapter: collection check/create, validated vector upsert, semantic search, point deletion.
- Server-only Redis Cloud adapter: ping, namespaced JSON cache, TTL, delete, fixed-window rate limiting.
- Server-only FalkorDB adapter over its Redis-compatible TLS endpoint: graph query and read-only graph health probe.
- `GET /api/health/infrastructure`: checks all three dependencies and reports status/latency without leaking URLs, credentials, or raw provider errors.
- `POST /api/internal/outbox/drain`: bearer-secret protected outbox drainer, capped batch size, lease/`SKIP LOCKED`, retries with backoff, dead-letter state, and processed-event record.
- Drizzle migration for `outbox_events` and `processed_events` (the source schema already declares these tables, but the supplied migration journal did not include their creation).

## 1. Apply patch safely

1. Commit or create a Git branch before applying.
2. Extract this ZIP into the repository root and allow the new files to merge. Merge the dependency entries/scripts from `package.json` into your existing file rather than replacing any project-specific scripts. Add the `0008_infrastructure_outbox` entry to your existing `drizzle/meta/_journal.json`; preserve any later entries that may exist in your working copy. Do not replace the repository with this patch.
3. Install/update dependencies using `npm install` (not `npm ci` yet, because this patch intentionally does not replace the existing lockfile):

   ```bash
   npm install
   ```

   Review the resulting `package-lock.json` diff and commit it.

## 2. Configure managed providers

Create Qdrant Cloud, Redis Cloud, and FalkorDB Cloud instances. Add the values from each provider's dashboard to `.env.local` for local development and to Vercel Project → Settings → Environment Variables for the environments where this code runs.

Copy `.env.infrastructure.example` as a reference only; never commit real secrets. Configure:

- `QDRANT_URL`, `QDRANT_API_KEY`, `QDRANT_VECTOR_SIZE`, optional `QDRANT_COLLECTION`.
- `REDIS_URL` with the exact TLS connection URL provided by Redis Cloud; optional `REDIS_KEY_PREFIX`.
- `FALKORDB_URL` with the separate FalkorDB Cloud TLS URL; optional `FALKORDB_GRAPH`.
- `OUTBOX_WORKER_SECRET` as a high-entropy secret shared with the trusted scheduler.

`QDRANT_VECTOR_SIZE` must match the selected embedding model. The patch does not generate embeddings; provide vectors from the embedding adapter/model chosen by the application. Qdrant point IDs must be valid UUIDs or unsigned integer IDs as required by Qdrant.

Do not expose any of these variables with a `NEXT_PUBLIC_` prefix.

## 3. Apply database migration

This adds only the infrastructure outbox tables; it does not alter business records. Back up the database and check the target environment before applying:

```bash
npm run db:migrate
```

The migration is journal entry `0008_infrastructure_outbox`. The schema already declares the outbox tables, so do not run `npm run db:generate` before reconciling the migration snapshot; that may generate a duplicate table migration. If your live database uses a different Drizzle migration history than the supplied repository snapshot, inspect the existing `drizzle.__drizzle_migrations` state and reconcile it before applying; do not blindly mark migrations as applied.

## 4. Schedule outbox draining on Vercel

The worker endpoint is `POST /api/internal/outbox/drain` and requires `Authorization: Bearer <OUTBOX_WORKER_SECRET>`. Configure a trusted scheduler/cron to call it on a suitable interval. If using Vercel Cron, add the cron configuration supported by your Vercel plan and send the required authorization header using the platform's supported secure mechanism; do not put the secret in a URL. Alternatively use an external scheduler that can securely set an Authorization header. Keep each invocation within the route's 60-second execution budget. For sustained or high-volume workloads, move this same `drainOutbox` worker to a persistent worker service rather than relying on request-triggered serverless execution.

Example local request (run from a shell where the secret is already set):

```bash
curl -X POST http://localhost:3000/api/internal/outbox/drain \
  -H "Authorization: Bearer $OUTBOX_WORKER_SECRET"
```

PowerShell:

```powershell
$headers = @{ Authorization = "Bearer $env:OUTBOX_WORKER_SECRET" }
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/internal/outbox/drain" -Headers $headers
```

## 5. Validate

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Then start the app and call:

```bash
curl -i http://localhost:3000/api/health/infrastructure
```

PowerShell:

```powershell
Invoke-WebRequest http://localhost:3000/api/health/infrastructure
```

HTTP 200 means all three provider checks succeeded. HTTP 503 means at least one is degraded or unconfigured. This endpoint deliberately returns only dependency status and latency.

To exercise the outbox end-to-end, insert an event in the same PostgreSQL transaction as the business change. Example payloads:

- `type = 'infrastructure.vector_upsert'`: `{ "records": [{ "id": "<valid-uuid>", "vector": [/* exactly QDRANT_VECTOR_SIZE floats */], "payload": { "tenant_id": "...", "kind": "capability" } }] }`
- `type = 'infrastructure.vector_delete'`: `{ "ids": ["<valid-uuid>"] }`
- `type = 'infrastructure.graph_project'`: `{ "statements": [{ "query": "MERGE (c:Capability {id: $id}) SET c.name = $name", "params": { "id": "...", "name": "..." } }] }`

Use only application-authored Cypher query templates and bind values through `params`; do not let users submit raw graph query text. Use `MERGE`/idempotent graph writes so retries are safe. `aggregate_id` must be a UUID. The outbox is not wired automatically to every domain mutation: add event inserts inside the same Drizzle transaction as each specific PostgreSQL write that should be projected.

## Design and operational cautions

- PostgreSQL is authoritative. Qdrant/FalkorDB are rebuildable projections; Redis is disposable cache/ephemeral state.
- Do not use Redis rate limits as an authorization or payment control.
- Health checks can incur provider requests; avoid frequent public polling. Consider putting the route behind your monitoring policy if needed.
- The outbox worker currently supports only the three documented `infrastructure.*` event types. Unsupported types retry and eventually enter `dead_at`; monitor and review dead-letter rows.
- Qdrant payloads and graph nodes should store only necessary data. Avoid secrets, raw identity documents, or unrestricted personal data in search indexes.
- The outbox tables are RLS-enabled without client policies. Ensure only the trusted server-side database role can perform worker operations.

## Verification status

This patch was assembled against the supplied `hcil(2).zip` snapshot. Dependency installation/lockfile generation timed out in the packaging environment, so no TypeScript check, lint, build, provider connection, or migration was run successfully here. Run the validation commands above in the actual repository and resolve any errors before deploying.
