// src/db/schema/reference.ts
// REFERENCE DATA — Taxonomy v1 (languages, locales, capability taxonomy) + audit log.
//
// Governance rules (also in HCIL_ARCHITECTURE_v1.md):
//  1. Extensible vocabularies are data, never Postgres enums.
//  2. Canonical rows (languages, platform locales, capability domains, capabilities) are
//     deprecated, never deleted: every FK that points AT a canonical row from another entity
//     is ON DELETE RESTRICT. A row that never left 'draft' may be removed by a controlled,
//     audited admin operation.
//  3. Translation rows are subordinate to their parent and CASCADE with it. Their link to
//     platform_locales is still RESTRICT.
//  4. Language aliases may be ambiguous ("Pidgin", "Fula", "Arabic"): unique per
//     (alias, language). Search returns candidate languages; the user disambiguates.
//  5. Capability aliases are unique per language, plus unique among language-neutral aliases
//     (language_id NULL, e.g. "Excel", "SQL"). Within one language an alias maps to exactly one
//     capability. Resolution order: language-specific alias first, then language-neutral.
//  6. replaced_by_id must point to an ACTIVE replacement, never another deprecated row.
//     Enforced in the admin service, not by a CHECK.
//  7. Locale fallback chains must be acyclic and end at the default locale. Enforced in the
//     locale-management service; the resolver also caps chain length (e.g. 5) as a safety net.
//  8. Evidence may attach only to ACTIVE capabilities.
//  9. Every INSERT / UPDATE / DELETE is recorded by a trigger (custom-migrations/0001_*.sql),
//     including changes made in the Supabase dashboard or raw SQL.

import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  slugFormat,
  translationMeta,
  updatedAt,
  valuesIn,
} from "./_shared";

/* ------------------------------------------------------------------ */
/* Languages                                                           */
/* ------------------------------------------------------------------ */

export const languages = pgTable(
  "languages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    iso6393: text("iso_639_3").notNull(), // canonical identifier
    iso6391: text("iso_639_1"), // optional: many languages have no 2-letter code
    name: text("name").notNull(), // reference name (default content language)
    nativeName: text("native_name"),
    family: text("family"),
    scope: text("scope").notNull().default("individual"), // individual | macrolanguage
    status: text("status").notNull().default("draft"), // draft | active | deprecated
    replacedById: uuid("replaced_by_id").references(
      (): AnyPgColumn => languages.id,
      { onDelete: "restrict" },
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("languages_iso_639_3_uq").on(t.iso6393),
    uniqueIndex("languages_iso_639_1_uq").on(t.iso6391), // NULLs are allowed to repeat
    check("languages_iso_639_3_ck", sql`${t.iso6393} ~ '^[a-z]{3}$'`),
    check(
      "languages_iso_639_1_ck",
      sql`${t.iso6391} is null or ${t.iso6391} ~ '^[a-z]{2}$'`,
    ),
    valuesIn("languages_scope_ck", t.scope, ["individual", "macrolanguage"]),
    valuesIn("languages_status_ck", t.status, [
      "draft",
      "active",
      "deprecated",
    ]),
    check(
      "languages_replaced_ck",
      sql`${t.replacedById} is null or (${t.status} = 'deprecated' and ${t.replacedById} <> ${t.id})`,
    ),
  ],
);

// Rule 4: unique per (alias, language), so one alias may legitimately point at several languages.
// Accent variants ("Français" / "Francais") are simply separate aliases.
export const languageAliases = pgTable(
  "language_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").generatedAlwaysAs(
      sql`lower(btrim(alias))`,
    ),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("language_aliases_norm_lang_uq").on(
      t.normalizedAlias,
      t.languageId,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Platform locales (what the UI and site content can be shown in)     */
/* ------------------------------------------------------------------ */

export const platformLocales = pgTable(
  "platform_locales",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
    tag: text("tag").notNull(), // BCP 47 in canonical casing: "fr", "fr-CM", "en-GB", "ar"
    // Case-insensitive identity: "fr-CM", "FR-cm" and "fr-cm" are the same locale.
    normalizedTag: text("normalized_tag").generatedAlwaysAs(
      sql`lower(btrim(tag))`,
    ),
    label: text("label").notNull(), // shown in the language switcher, in its own language
    direction: text("direction").notNull().default("ltr"), // ltr | rtl (Arabic, etc.)
    status: text("status").notNull().default("draft"), // draft | active | deprecated
    isDefault: boolean("is_default").notNull().default(false),
    // Rule 7: requested -> fallback -> default. Must be acyclic (checked in the service).
    fallbackLocaleId: uuid("fallback_locale_id").references(
      (): AnyPgColumn => platformLocales.id,
      {
        onDelete: "restrict",
      },
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("platform_locales_normalized_tag_uq").on(t.normalizedTag),
    // At most one default locale.
    uniqueIndex("platform_locales_one_default_uq")
      .on(t.isDefault)
      .where(sql`${t.isDefault} = true`),
    check(
      "platform_locales_tag_ck",
      sql`${t.tag} ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'`,
    ),
    valuesIn("platform_locales_direction_ck", t.direction, ["ltr", "rtl"]),
    valuesIn("platform_locales_status_ck", t.status, [
      "draft",
      "active",
      "deprecated",
    ]),
    check(
      "platform_locales_default_active_ck",
      sql`not ${t.isDefault} or ${t.status} = 'active'`,
    ),
    check(
      "platform_locales_fallback_ck",
      sql`${t.fallbackLocaleId} is null or ${t.fallbackLocaleId} <> ${t.id}`,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Capability taxonomy                                                 */
/* ------------------------------------------------------------------ */

export const capabilityDomains = pgTable(
  "capability_domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references(
      (): AnyPgColumn => capabilityDomains.id,
      { onDelete: "restrict" },
    ),
    slug: text("slug").notNull(),
    name: text("name").notNull(), // reference name (default content language)
    description: text("description"),
    status: text("status").notNull().default("draft"), // draft | active | deprecated
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("capability_domains_slug_uq").on(t.slug),
    index("capability_domains_parent_idx").on(t.parentId),
    slugFormat("capability_domains_slug_ck", t.slug),
    valuesIn("capability_domains_status_ck", t.status, [
      "draft",
      "active",
      "deprecated",
    ]),
    check(
      "capability_domains_parent_ck",
      sql`${t.parentId} is null or ${t.parentId} <> ${t.id}`,
    ),
  ],
);

export const capabilityDomainTranslations = pgTable(
  "capability_domain_translations",
  {
    domainId: uuid("domain_id")
      .notNull()
      .references(() => capabilityDomains.id, { onDelete: "cascade" }), // rule 3
    localeId: uuid("locale_id")
      .notNull()
      .references(() => platformLocales.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    ...translationMeta(),
  },
  (t) => [
    primaryKey({ columns: [t.domainId, t.localeId] }),
    valuesIn("capability_domain_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
  ],
);

// Capabilities keep a richer lifecycle than languages on purpose: a capability needs semantic
// review before it becomes canonical, whereas a language registry entry is plain reference data.
export const capabilities = pgTable(
  "capabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domainId: uuid("domain_id")
      .notNull()
      .references(() => capabilityDomains.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(), // reference name (default content language)
    description: text("description"),
    // draft -> review -> active -> deprecated. Evidence may only attach to active rows (rule 8).
    status: text("status").notNull().default("draft"),
    replacedById: uuid("replaced_by_id").references(
      (): AnyPgColumn => capabilities.id,
      { onDelete: "restrict" },
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("capabilities_slug_uq").on(t.slug),
    index("capabilities_domain_idx").on(t.domainId),
    slugFormat("capabilities_slug_ck", t.slug),
    valuesIn("capabilities_status_ck", t.status, [
      "draft",
      "review",
      "active",
      "deprecated",
    ]),
    check(
      "capabilities_replaced_ck",
      sql`${t.replacedById} is null or (${t.status} = 'deprecated' and ${t.replacedById} <> ${t.id})`,
    ),
  ],
);

// Rule 5. languageId says which language the alias is written in. The same string can mean
// different things in different languages (false friends such as "formation"), so uniqueness is
// per language. NULL language = language-neutral alias ("Excel", "SQL"), unique on its own.
export const capabilityAliases = pgTable(
  "capability_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "restrict" }),
    languageId: uuid("language_id").references(() => languages.id, {
      onDelete: "restrict",
    }),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").generatedAlwaysAs(
      sql`lower(btrim(alias))`,
    ),
    createdAt: createdAt(),
  },
  (t) => [
    // Language-specific aliases (NULLs never collide in a plain unique index, so this only
    // constrains rows that have a language).
    uniqueIndex("capability_aliases_lang_norm_uq").on(
      t.languageId,
      t.normalizedAlias,
    ),
    // Language-neutral aliases.
    uniqueIndex("capability_aliases_neutral_norm_uq")
      .on(t.normalizedAlias)
      .where(sql`${t.languageId} is null`),
    index("capability_aliases_cap_idx").on(t.capabilityId),
  ],
);

export const capabilityTranslations = pgTable(
  "capability_translations",
  {
    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "cascade" }), // rule 3
    localeId: uuid("locale_id")
      .notNull()
      .references(() => platformLocales.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    ...translationMeta(),
  },
  (t) => [
    primaryKey({ columns: [t.capabilityId, t.localeId] }),
    valuesIn("capability_translations_status_ck", t.status, [
      "draft",
      "review",
      "published",
    ]),
  ],
);

/* ------------------------------------------------------------------ */
/* Governance                                                          */
/* ------------------------------------------------------------------ */

// Filled by the taxonomy_audit() trigger, so changes made in the Supabase
// dashboard or SQL editor are captured too, including DELETEs. actor_id is NULL for those.
// entity_id is NULL for composite-key tables; before/after hold the full row.
export const taxonomyAuditLog = pgTable(
  "taxonomy_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id"), // deliberately no FK: the log must outlive profiles
    entityType: text("entity_type").notNull(), // table name
    entityId: uuid("entity_id"),
    action: text("action").notNull(),
    beforeData: jsonb("before_data"),
    afterData: jsonb("after_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("taxonomy_audit_entity_idx").on(
      t.entityType,
      t.entityId,
      t.createdAt,
    ),
    valuesIn("taxonomy_audit_action_ck", t.action, [
      "INSERT",
      "UPDATE",
      "DELETE",
    ]),
  ],
);
