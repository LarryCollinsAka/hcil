// ACCESS / RBAC v1
// Role names and permissions are data, not Postgres enums, so they can evolve without a schema
// migration for every new staff position. A role's title never implies permissions by itself:
// the access_role_permissions rows are authoritative.

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./_shared";
import { organizations, profiles } from "./identity";

export const accessRoles = pgTable(
  "access_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roleKey: text("role_key").notNull(),
    scope: text("scope").notNull(), // platform | organization
    label: text("label").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("access_roles_role_key_uq").on(t.roleKey),
    check("access_roles_scope_ck", sql`${t.scope} in ('platform', 'organization')`),
    check("access_roles_key_ck", sql`${t.roleKey} ~ '^[a-z][a-z0-9_]*$'`),
  ],
).enableRLS();

export const accessPermissions = pgTable(
  "access_permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    permissionKey: text("permission_key").notNull(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    description: text("description").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("access_permissions_permission_key_uq").on(t.permissionKey),
    check(
      "access_permissions_key_ck",
      sql`${t.permissionKey} ~ '^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+$'`,
    ),
  ],
).enableRLS();

export const accessRolePermissions = pgTable(
  "access_role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => accessRoles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => accessPermissions.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
).enableRLS();

export const userRoleAssignments = pgTable(
  "user_role_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => accessRoles.id, { onDelete: "restrict" }),
    // NULL for platform roles; required for organization roles (enforced by DB trigger).
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    grantedBy: uuid("granted_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
    reason: text("reason"),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: uuid("revoked_by").references(() => profiles.id, { onDelete: "set null" }),
    revocationReason: text("revocation_reason"),
  },
  (t) => [
    index("user_role_assignments_profile_idx").on(t.profileId, t.revokedAt),
    index("user_role_assignments_org_idx").on(t.organizationId, t.revokedAt),
    uniqueIndex("user_role_assignments_platform_active_uq")
      .on(t.profileId, t.roleId)
      .where(sql`${t.organizationId} is null and ${t.revokedAt} is null`),
    uniqueIndex("user_role_assignments_org_active_uq")
      .on(t.profileId, t.roleId, t.organizationId)
      .where(sql`${t.organizationId} is not null and ${t.revokedAt} is null`),
    check(
      "user_role_assignments_expiry_ck",
      sql`${t.expiresAt} is null or ${t.expiresAt} > ${t.grantedAt}`,
    ),
  ],
).enableRLS();
