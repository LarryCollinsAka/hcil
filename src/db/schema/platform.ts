// src/db/schema/platform.ts
// Shared infrastructure: transactional outbox + handler idempotency.
// Not owned by a business module. Any module records an event by inserting into
// outbox_events inside its own transaction (via an emit(tx, event) helper).
//
// How the drainer should work (any runtime: cron route, Edge Function, job service):
//  1. Claim a batch with a short lease, safe under concurrency:
//       update outbox_events set locked_until = now() + interval '2 minutes'
//       where id in (
//         select id from outbox_events
//         where processed_at is null and dead_at is null
//           and available_at <= now() and (locked_until is null or locked_until < now())
//         order by available_at
//         limit 50
//         for update skip locked
//       )
//       returning *;
//  2. For each event, run every registered handler for its type. Before a handler does work, insert
//     (handler, event_id) into processed_events; if it already exists, skip that handler.
//  3. All handlers succeeded -> set processed_at.
//     A handler failed -> attempts += 1, last_error, available_at = now() + backoff, release the lease.
//     attempts over the limit -> set dead_at (needs a human; never silently dropped).
//  4. Purge old processed rows on a schedule (processed_events cascades).

import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt } from "./_shared";

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(), // "<module>.<event>", e.g. "capability.assessment_passed"
    aggregateType: text("aggregate_type").notNull(), // e.g. "assessment_attempt"
    aggregateId: uuid("aggregate_id").notNull(),
    schemaVersion: integer("schema_version").notNull().default(1),
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    availableAt: timestamp("available_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    deadAt: timestamp("dead_at", { withTimezone: true }), // gave up; needs attention
    createdAt: createdAt(),
  },
  (t) => [
    // Keeps the "what is pending?" query cheap as processed rows accumulate.
    index("outbox_events_pending_idx")
      .on(t.availableAt)
      .where(sql`${t.processedAt} is null and ${t.deadAt} is null`),
    index("outbox_events_aggregate_idx").on(t.aggregateType, t.aggregateId),
    check("outbox_events_type_ck", sql`${t.type} ~ '^[a-z_]+\\.[a-z_]+$'`),
    check("outbox_events_attempts_ck", sql`${t.attempts} >= 0`),
    check(
      "outbox_events_final_state_ck",
      sql`not (${t.processedAt} is not null and ${t.deadAt} is not null)`,
    ),
  ],
);

// One row per (handler, event) that has completed, so a retried event never repeats finished work.
export const processedEvents = pgTable(
  "processed_events",
  {
    handler: text("handler").notNull(), // e.g. "matching.reindex_worker"
    eventId: uuid("event_id")
      .notNull()
      .references(() => outboxEvents.id, { onDelete: "cascade" }),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.handler, t.eventId] })],
);
