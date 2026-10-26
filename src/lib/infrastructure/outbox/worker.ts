import "server-only";
import { and, eq, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { outboxEvents, processedEvents } from "@/db/schema/platform";
import { deleteVectorPoints, upsertVectors, type VectorRecord } from "../qdrant/client";
import { queryGraph } from "../falkordb/client";

const HANDLER = "infrastructure.search_and_graph_projection.v1";
const MAX_ATTEMPTS = 12;
const LEASE_SECONDS = 90;

type EventPayload = Record<string, unknown>;
type ClaimedEvent = {
  id: string; type: string; aggregateType: string; aggregateId: string;
  schemaVersion: number; payload: EventPayload; attempts: number;
};
type GraphStatement = { query: string; params?: Record<string, string | number | boolean | null> };

async function project(event: ClaimedEvent): Promise<void> {
  const payload = event.payload;
  if (event.type === "infrastructure.vector_upsert") {
    const records = payload.records;
    if (!Array.isArray(records)) throw new Error("vector_upsert payload.records must be an array");
    await upsertVectors(records as VectorRecord[]);
  } else if (event.type === "infrastructure.vector_delete") {
    const ids = payload.ids;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string" && typeof id !== "number")) throw new Error("vector_delete payload.ids must be an array of Qdrant point IDs");
    await deleteVectorPoints(ids as Array<string | number>);
  }

  if (event.type === "infrastructure.graph_project") {
    const statements = payload.statements;
    if (!Array.isArray(statements) || statements.length > 25) throw new Error("graph_project requires 1-25 statements");
    for (const item of statements) {
      const statement = item as GraphStatement;
      if (typeof statement.query !== "string" || !/^\s*(MERGE|UNWIND|MATCH|CREATE|SET|DELETE|WITH|RETURN)\b/i.test(statement.query)) throw new Error("Invalid graph statement in event payload");
      await queryGraph(statement.query, statement.params ?? {});
    }
  }
  if (!["infrastructure.vector_upsert", "infrastructure.vector_delete", "infrastructure.graph_project"].includes(event.type)) {
    throw new Error(`Unsupported outbox event type: ${event.type}`);
  }
}

/** Claims a batch with SKIP LOCKED so multiple worker invocations can safely overlap. */
async function claimBatch(limit: number): Promise<ClaimedEvent[]> {
  const result = await db.execute(sql`
    UPDATE outbox_events AS target
       SET locked_until = now() + (${LEASE_SECONDS} * interval '1 second')
     WHERE target.id IN (
       SELECT id FROM outbox_events
        WHERE processed_at IS NULL AND dead_at IS NULL
          AND available_at <= now()
          AND (locked_until IS NULL OR locked_until < now())
        ORDER BY available_at, created_at
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
     )
     RETURNING target.id, target.type, target.aggregate_type AS "aggregateType",
               target.aggregate_id AS "aggregateId", target.schema_version AS "schemaVersion",
               target.payload, target.attempts
  `);
  return Array.from(result as unknown as Iterable<ClaimedEvent>);
}

async function recordSuccess(event: ClaimedEvent): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(processedEvents).values({ handler: HANDLER, eventId: event.id }).onConflictDoNothing();
    await tx.update(outboxEvents).set({ processedAt: new Date(), lockedUntil: null, lastError: null }).where(eq(outboxEvents.id, event.id));
  });
}

async function recordFailure(event: ClaimedEvent, error: unknown): Promise<void> {
  const attempts = event.attempts + 1;
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 2000);
  const dead = attempts >= MAX_ATTEMPTS;
  const delaySeconds = Math.min(3600, 5 * (2 ** Math.min(attempts, 9)));
  await db.update(outboxEvents).set({
    attempts,
    lastError: message,
    lockedUntil: null,
    availableAt: dead ? new Date() : new Date(Date.now() + delaySeconds * 1000),
    ...(dead ? { deadAt: new Date() } : {}),
  }).where(eq(outboxEvents.id, event.id));
}

export async function drainOutbox(batchSize = 10) {
  const limit = Math.max(1, Math.min(25, Math.trunc(batchSize)));
  const events = await claimBatch(limit);
  let processed = 0;
  let failed = 0;
  for (const event of events) {
    try { await project(event); await recordSuccess(event); processed += 1; }
    catch (error) {
      failed += 1;
      console.error("[HCIL][outbox] projection failed", { eventId: event.id, type: event.type, error: error instanceof Error ? error.message : String(error) });
      await recordFailure(event, error);
    }
  }
  return { claimed: events.length, processed, failed };
}
