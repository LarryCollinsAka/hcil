// src/db/schema/_shared.ts
// Helpers reused by every schema module.

import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// $onUpdate covers writes made through Drizzle. Writes made in the Supabase
// dashboard or raw SQL are covered by the touch_updated_at trigger in
// custom-migrations/0001_triggers_and_rls.sql.
export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// Columns every *_translations table carries.
// source_hash = hash of the source-locale content this translation was made from.
// When the source changes and the hash no longer matches, the translation is stale.
export const translationMeta = () => ({
  status: text("status").notNull().default("draft"), // draft | review | published
  isMachineTranslated: boolean("is_machine_translated")
    .notNull()
    .default(false),
  sourceHash: text("source_hash"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const TRANSLATION_STATUSES = ["draft", "review", "published"] as const;

// Extensible vocabularies are text + CHECK, not Postgres enums, so changing the
// allowed values is a cheap constraint change rather than an enum migration.
export const valuesIn = (
  name: string,
  col: AnyPgColumn,
  values: readonly string[],
) =>
  check(
    name,
    sql`${col} in (${sql.join(
      values.map((v) => sql.raw(`'${v}'`)),
      sql`, `,
    )})`,
  );

export const slugFormat = (name: string, col: AnyPgColumn) =>
  check(name, sql`${col} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`);
