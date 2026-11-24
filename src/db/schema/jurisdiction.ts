// src/db/schema/jurisdiction.ts
// Country and jurisdiction reference data plus versioned country onboarding schemas.
// Country codes identify residence jurisdictions; they are not nationality or organization country.

import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  char,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt, valuesIn } from "./_shared";

export const countries = pgTable(
  "countries",
  {
    code: char("code", { length: 2 }).primaryKey(), // ISO 3166-1 alpha-2
    alpha3: char("alpha_3", { length: 3 }), // ISO 3166-1 alpha-3
    numericCode: char("numeric_code", { length: 3 }), // ISO 3166-1 numeric, zero-padded
    name: text("name").notNull(),
    nativeName: text("native_name"),
    status: text("status").notNull().default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("countries_alpha3_uq").on(t.alpha3),
    uniqueIndex("countries_numeric_code_uq").on(t.numericCode),
    check("countries_code_ck", sql`${t.code} ~ '^[A-Z]{2}$'`),
    check(
      "countries_alpha3_ck",
      sql`${t.alpha3} is null or ${t.alpha3} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "countries_numeric_code_ck",
      sql`${t.numericCode} is null or ${t.numericCode} ~ '^[0-9]{3}$'`,
    ),
    valuesIn("countries_status_ck", t.status, ["active", "inactive"]),
  ],
).enableRLS();

export const jurisdictions = pgTable(
  "jurisdictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    countryCode: char("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    code: text("code").notNull(), // Stable country-scoped code, e.g. CM-CENTRE
    name: text("name").notNull(),
    jurisdictionType: text("jurisdiction_type").notNull(),
    timezone: text("timezone"),
    status: text("status").notNull().default("active"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("jurisdictions_country_code_uq").on(t.countryCode, t.code),

    index("jurisdictions_country_type_idx").on(
      t.countryCode,
      t.jurisdictionType,
    ),
    index("jurisdictions_parent_idx").on(t.parentId),

    check(
      "jurisdictions_code_ck",
      sql`${t.code} ~ '^[A-Z0-9]+([_-][A-Z0-9]+)*$'`,
    ),
    check(
      "jurisdictions_parent_ck",
      sql`${t.parentId} is null or ${t.parentId} <> ${t.id}`,
    ),
    valuesIn("jurisdictions_type_ck", t.jurisdictionType, [
      "national",
      "regional",
      "state",
      "provincial",
      "county",
      "municipal",
      "local",
      "special",
    ]),
    valuesIn("jurisdictions_status_ck", t.status, ["active", "inactive"]),
  ],
).enableRLS();

export const countryOnboardingSchemas = pgTable(
  "country_onboarding_schemas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    countryCode: char("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    schemaKey: text("schema_key").notNull(),
    name: text("name").notNull(),
    definition: jsonb("definition").notNull().default({}),
    status: text("status").notNull().default("draft"),
    effectiveFrom: timestamp("effective_from", { withTimezone: true }),
    effectiveTo: timestamp("effective_to", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("country_onboarding_schemas_country_version_uq").on(
      t.countryCode,
      t.version,
    ),
    uniqueIndex("country_onboarding_schemas_country_key_version_uq").on(
      t.countryCode,
      t.schemaKey,
      t.version,
    ),
    index("country_onboarding_schemas_country_status_idx").on(
      t.countryCode,
      t.status,
    ),

    check("country_onboarding_schemas_version_ck", sql`${t.version} > 0`),
    check(
      "country_onboarding_schemas_definition_object_ck",
      sql`jsonb_typeof(${t.definition}) = 'object'`,
    ),
    check(
      "country_onboarding_schemas_effective_range_ck",
      sql`${t.effectiveTo} is null or ${t.effectiveFrom} is null or ${t.effectiveTo} > ${t.effectiveFrom}`,
    ),

    // Published schemas must have a publication timestamp and start date.
    check(
      "country_onboarding_schemas_published_ck",
      sql`${t.status} <> 'published' or (${t.publishedAt} is not null and ${t.effectiveFrom} is not null)`,
    ),

    valuesIn("country_onboarding_schemas_status_ck", t.status, [
      "draft",
      "review",
      "published",
      "retired",
    ]),
  ],
).enableRLS();
