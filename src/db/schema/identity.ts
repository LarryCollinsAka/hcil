// src/db/schema/identity.ts
// IDENTITY v1 — people and organizations.
//
//   Supabase auth.users
//        |
//     profiles ------------- worker_profiles        (has a row  => participates as a worker)
//        |
//        +---- organization_members ---- organizations   (membership + org-scoped authority)
//        |
//        +---- staff_roles                           (PLATFORM staff: editors, moderators, admins)
//
// Principles:
//  - Role is contextual authority, not a permanent identity attribute. There is no profiles.role.
//  - A derived relationship is identity, not permission. Having a worker_profiles row does not
//    let you read other workers' records; membership does not grant org permissions by itself.
//    Authorization chain: authenticated user -> profile -> relationship -> role/policy -> permission.
//  - Two different scopes of authority, never merged:
//      organization_members.role = authority INSIDE one organization (owner / admin / member)
//      staff_roles               = authority over the PLATFORM (content, moderation, admin)
//  - No generic "actor" supertable and no polymorphic actor_id. Every table that needs a person
//    points at profiles; every table that needs an organization points at organizations. Work
//    records carry both: organization_id (who owns the work) and created_by (which human did it).
//  - Profiles are anonymized, never deleted: evidence, payments and audit records reference them.

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./_shared";
import { platformLocales } from "./reference";

// Code branches on these, so they are enums (unlike taxonomy vocabularies).
export const staffRole = pgEnum("staff_role", ["admin", "editor", "moderator"]);
export const orgMemberRole = pgEnum("org_member_role", [
  "owner",
  "admin",
  "member",
]);

// id equals Supabase auth.users.id (no FK declared across schemas; add in raw SQL if desired,
// but do NOT cascade deletes from auth.users into profiles: anonymize instead).
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"), // WhatsApp / mobile money number, E.164
    // UI language. Must be an enabled platform locale; app falls back to the default locale when null.
    localeId: uuid("locale_id").references(() => platformLocales.id, {
      onDelete: "restrict",
    }),
    timezone: text("timezone"), // IANA name, e.g. "Africa/Douala"
    // Set when the person asks to be forgotten: personal fields are scrubbed, the row stays.
    anonymizedAt: timestamp("anonymized_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("profiles_email_uq").on(sql`lower(${t.email})`),
    // One person per phone number (it is the WhatsApp identity). NULLs may repeat.
    uniqueIndex("profiles_phone_uq").on(t.phone),
    check(
      "profiles_phone_ck",
      sql`${t.phone} is null or ${t.phone} ~ '^\\+[1-9][0-9]{6,14}$'`,
    ),
  ],
);

// Platform-wide staff powers. Separate from marketplace participation: an admin may also be a worker.
export const staffRoles = pgTable(
  "staff_roles",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: staffRole("role").notNull(),
    grantedBy: uuid("granted_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.role] })],
);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    industry: text("industry"),
    countryCode: text("country_code").notNull().default("CM"), // ISO 3166-1 alpha-2
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("organizations_country_ck", sql`${t.countryCode} ~ '^[A-Z]{2}$'`),
  ],
);

// Person <-> organization, with authority scoped to that organization.
// Invariant (enforced by trigger in custom-migrations/0001_*.sql): an organization always keeps
// at least one owner. Account deletion / anonymization must transfer ownership first.
export const organizationMembers = pgTable(
  "organization_members",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: orgMemberRole("role").notNull().default("member"),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.profileId] }),
    index("organization_members_profile_idx").on(t.profileId), // "which organizations am I in?"
  ],
);

// Having a row here is what makes a person a worker. 1:1 with profiles.
export const workerProfiles = pgTable(
  "worker_profiles",
  {
    profileId: uuid("profile_id")
      .primaryKey()
      .references(() => profiles.id, { onDelete: "cascade" }),
    headline: text("headline"),
    bio: text("bio"),
    countryCode: text("country_code"),
    city: text("city"),
    availableHoursPerWeek: integer("available_hours_per_week"), // availability windows still to be designed
    minHourlyRate: integer("min_hourly_rate"), // XAF per hour
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check(
      "worker_profiles_country_ck",
      sql`${t.countryCode} is null or ${t.countryCode} ~ '^[A-Z]{2}$'`,
    ),
    check(
      "worker_profiles_hours_ck",
      sql`${t.availableHoursPerWeek} is null or ${t.availableHoursPerWeek} between 0 and 168`,
    ),
    check(
      "worker_profiles_rate_ck",
      sql`${t.minHourlyRate} is null or ${t.minHourlyRate} >= 0`,
    ),
  ],
);
