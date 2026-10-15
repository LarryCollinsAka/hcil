import { and, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  accessRoles,
  organizations,
  organizationMembers,
  profiles,
  userRoleAssignments,
} from "@/db/schema";
import { getAuthenticatedPrincipal, hasPermission } from "./authorization";

export class RoleManagementError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "RoleManagementError";
  }
}

const PLATFORM_ADMIN_ASSIGNABLE = [
  "operations_manager",
  "staff_coordinator",
  "support_agent",
  "content_editor",
  "community_moderator",
  "finance_manager",
] as const;

const PLATFORM_SUPERADMIN_ASSIGNABLE = [
  "platform_admin",
  "chief_operating_officer",
  ...PLATFORM_ADMIN_ASSIGNABLE,
] as const;

export type OrganizationManagementContext = {
  organizationId: string;
  organizationType: string;
  actorRoleKeys: string[];
};

export async function getActiveRoleKeys(profileId: string, organizationId?: string) {
  const now = new Date();
  const conditions = [
    eq(userRoleAssignments.profileId, profileId),
    isNull(userRoleAssignments.revokedAt),
    or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now))!,
    organizationId
      ? and(eq(accessRoles.scope, "organization"), eq(userRoleAssignments.organizationId, organizationId))!
      : and(eq(accessRoles.scope, "platform"), isNull(userRoleAssignments.organizationId))!,
  ];

  const rows = await db
    .select({ roleKey: accessRoles.roleKey })
    .from(userRoleAssignments)
    .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
    .where(and(...conditions));
  return [...new Set(rows.map((row) => row.roleKey))];
}

export function getAssignablePlatformRoleKeys(actorRoleKeys: string[]): string[] {
  if (actorRoleKeys.includes("super_admin")) return [...PLATFORM_SUPERADMIN_ASSIGNABLE];
  if (actorRoleKeys.includes("platform_admin")) return [...PLATFORM_ADMIN_ASSIGNABLE];
  return [];
}

export function getAssignableOrganizationRoleKeys(
  organizationType: string,
  actorRoleKeys: string[],
): string[] {
  const isAgency = organizationType === "staffing_agency" || organizationType === "recruitment_agency";
  if (isAgency) {
    if (actorRoleKeys.includes("super_admin")) {
      return ["agency_admin", "agency_manager", "talent_coordinator", "recruiter", "agency_finance"];
    }
    if (actorRoleKeys.includes("agency_owner")) {
      return ["agency_admin", "agency_manager", "talent_coordinator", "recruiter", "agency_finance"];
    }
    if (actorRoleKeys.includes("agency_admin")) {
      return ["agency_manager", "talent_coordinator", "recruiter", "agency_finance"];
    }
    return [];
  }
  if (actorRoleKeys.includes("super_admin")) return ["org_admin", "org_manager", "org_staff", "org_viewer"];
  if (actorRoleKeys.includes("org_owner")) return ["org_admin", "org_manager", "org_staff", "org_viewer"];
  if (actorRoleKeys.includes("org_admin")) return ["org_manager", "org_staff", "org_viewer"];
  return [];
}

export async function getOrganizationManagementContexts(profileId: string) {
  const platformRoleKeys = await getActiveRoleKeys(profileId);
  const organizationsInScope = platformRoleKeys.includes("super_admin")
    ? await db.select({
        organizationId: organizations.id,
        organizationName: organizations.name,
        organizationType: organizations.organizationType,
      }).from(organizations)
    : await db
        .select({
          organizationId: organizations.id,
          organizationName: organizations.name,
          organizationType: organizations.organizationType,
        })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(eq(organizationMembers.profileId, profileId));

  const contexts: Array<OrganizationManagementContext & { organizationName: string }> = [];
  for (const organization of organizationsInScope) {
    // A super-admin is globally authorized and needs no per-organization permission lookup.
    // This avoids an N+1 query over every organization in the platform-admin workspace.
    if (platformRoleKeys.includes("super_admin")) {
      contexts.push({ ...organization, actorRoleKeys: platformRoleKeys });
      continue;
    }
    const allowed = await hasPermission(profileId, "organization.members.manage", organization.organizationId);
    if (!allowed) continue;
    const orgRoleKeys = await getActiveRoleKeys(profileId, organization.organizationId);
    const actorRoleKeys = [...new Set([...platformRoleKeys, ...orgRoleKeys])];
    if (getAssignableOrganizationRoleKeys(organization.organizationType, actorRoleKeys).length === 0) continue;
    contexts.push({ ...organization, actorRoleKeys });
  }
  return contexts;
}

export async function assignRole(input: {
  targetEmail: string;
  roleKey: string;
  organizationId?: string;
  reason?: string;
}) {
  const actor = await getAuthenticatedPrincipal();
  if (!actor) throw new RoleManagementError("unauthenticated");
  const targetEmail = input.targetEmail.trim().toLowerCase();
  const roleKey = input.roleKey.trim();
  const reason = input.reason?.trim().slice(0, 240) || null;
  if (!targetEmail || !roleKey) throw new RoleManagementError("invalid-input");

  const [target] = await db
    .select({ id: profiles.id, email: profiles.email })
    .from(profiles)
    .where(sql`lower(${profiles.email}) = ${targetEmail}`)
    .limit(1);
  if (!target) throw new RoleManagementError("target-not-found");
  if (target.id === actor.id) throw new RoleManagementError("self-change-not-allowed");

  const [targetRole] = await db
    .select({ id: accessRoles.id, roleKey: accessRoles.roleKey, scope: accessRoles.scope })
    .from(accessRoles)
    .where(eq(accessRoles.roleKey, roleKey))
    .limit(1);
  if (!targetRole) throw new RoleManagementError("role-not-found");

  if (targetRole.scope === "platform") {
    if (input.organizationId) throw new RoleManagementError("scope-mismatch");
    const canAssign = await hasPermission(actor.id, "platform.roles.assign_non_superadmin");
    if (!canAssign || targetRole.roleKey === "super_admin") throw new RoleManagementError("forbidden");
    const actorRoleKeys = await getActiveRoleKeys(actor.id);
    if (!getAssignablePlatformRoleKeys(actorRoleKeys).includes(targetRole.roleKey)) {
      throw new RoleManagementError("role-not-assignable");
    }
  } else {
    if (!input.organizationId) throw new RoleManagementError("organization-required");
    const organizationId = input.organizationId;
    const canManageMembers = await hasPermission(actor.id, "organization.members.manage", organizationId);
    if (!canManageMembers) throw new RoleManagementError("forbidden");

    const [organization] = await db
      .select({ id: organizations.id, organizationType: organizations.organizationType })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    if (!organization) throw new RoleManagementError("organization-not-found");

    const actorRoleKeys = [...new Set([
      ...await getActiveRoleKeys(actor.id),
      ...await getActiveRoleKeys(actor.id, organizationId),
    ])];
    const allowedKeys = getAssignableOrganizationRoleKeys(organization.organizationType, actorRoleKeys);
    if (!allowedKeys.includes(targetRole.roleKey)) throw new RoleManagementError("role-not-assignable");

    const isAgencyRole = targetRole.roleKey.startsWith("agency_") || targetRole.roleKey === "talent_coordinator" || targetRole.roleKey === "recruiter";
    const isAgencyOrg = organization.organizationType === "staffing_agency" || organization.organizationType === "recruitment_agency";
    if (isAgencyRole !== isAgencyOrg) throw new RoleManagementError("scope-mismatch");
  }

  const now = new Date();
  const expiredAssignments = await db
    .select({ id: userRoleAssignments.id })
    .from(userRoleAssignments)
    .where(
      and(
        eq(userRoleAssignments.profileId, target.id),
        eq(userRoleAssignments.roleId, targetRole.id),
        input.organizationId
          ? eq(userRoleAssignments.organizationId, input.organizationId)
          : isNull(userRoleAssignments.organizationId),
        isNull(userRoleAssignments.revokedAt),
        // Only expired rows are closed here; active or scheduled assignments remain untouched.
        sql`${userRoleAssignments.expiresAt} is not null and ${userRoleAssignments.expiresAt} <= ${now}`,
      ),
    );
  if (expiredAssignments.length) {
    await db
      .update(userRoleAssignments)
      .set({
        revokedAt: now,
        revocationReason: "Expired role closed before a new assignment",
      })
      .where(inArray(userRoleAssignments.id, expiredAssignments.map((row) => row.id)));
  }

  const duplicate = await db
    .select({ id: userRoleAssignments.id })
    .from(userRoleAssignments)
    .where(
      and(
        eq(userRoleAssignments.profileId, target.id),
        eq(userRoleAssignments.roleId, targetRole.id),
        input.organizationId
          ? eq(userRoleAssignments.organizationId, input.organizationId)
          : isNull(userRoleAssignments.organizationId),
        isNull(userRoleAssignments.revokedAt),
      ),
    )
    .limit(1);
  if (duplicate.length) throw new RoleManagementError("already-assigned");

  await db.transaction(async (tx) => {
    if (targetRole.scope === "organization" && input.organizationId) {
      await tx
        .insert(organizationMembers)
        .values({ organizationId: input.organizationId, profileId: target.id, role: "member" })
        .onConflictDoNothing();
    }
    await tx.insert(userRoleAssignments).values({
      profileId: target.id,
      roleId: targetRole.id,
      organizationId: targetRole.scope === "organization" ? input.organizationId : null,
      grantedBy: actor.id,
      reason: reason ?? `Granted by ${actor.email}`,
    });
  });
}

export async function revokeRole(input: {
  assignmentId: string;
  reason?: string;
}) {
  const actor = await getAuthenticatedPrincipal();
  if (!actor) throw new RoleManagementError("unauthenticated");
  if (!input.assignmentId || !/^[0-9a-f-]{36}$/i.test(input.assignmentId)) {
    throw new RoleManagementError("invalid-input");
  }

  const [assignment] = await db
    .select({
      id: userRoleAssignments.id,
      profileId: userRoleAssignments.profileId,
      roleId: userRoleAssignments.roleId,
      organizationId: userRoleAssignments.organizationId,
      roleKey: accessRoles.roleKey,
      scope: accessRoles.scope,
    })
    .from(userRoleAssignments)
    .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
    .where(and(eq(userRoleAssignments.id, input.assignmentId), isNull(userRoleAssignments.revokedAt)))
    .limit(1);
  if (!assignment) throw new RoleManagementError("assignment-not-found");
  if (assignment.profileId === actor.id || assignment.roleKey === "super_admin" || assignment.roleKey === "org_owner" || assignment.roleKey === "agency_owner") {
    throw new RoleManagementError("role-not-revocable");
  }

  if (assignment.scope === "platform") {
    const canAssign = await hasPermission(actor.id, "platform.roles.assign_non_superadmin");
    const actorKeys = await getActiveRoleKeys(actor.id);
    if (!canAssign || !getAssignablePlatformRoleKeys(actorKeys).includes(assignment.roleKey)) {
      throw new RoleManagementError("forbidden");
    }
  } else {
    if (!assignment.organizationId) throw new RoleManagementError("scope-mismatch");
    const canManageMembers = await hasPermission(actor.id, "organization.members.manage", assignment.organizationId);
    const [organization] = await db
      .select({ organizationType: organizations.organizationType })
      .from(organizations)
      .where(eq(organizations.id, assignment.organizationId))
      .limit(1);
    const actorKeys = [...new Set([
      ...await getActiveRoleKeys(actor.id),
      ...await getActiveRoleKeys(actor.id, assignment.organizationId),
    ])];
    const allowedKeys = organization
      ? getAssignableOrganizationRoleKeys(organization.organizationType, actorKeys)
      : [];
    if (!canManageMembers || !allowedKeys.includes(assignment.roleKey)) {
      throw new RoleManagementError("forbidden");
    }
  }

  await db
    .update(userRoleAssignments)
    .set({
      revokedAt: new Date(),
      revokedBy: actor.id,
      revocationReason: input.reason?.trim().slice(0, 240) || `Revoked by ${actor.email}`,
    })
    .where(and(eq(userRoleAssignments.id, assignment.id), isNull(userRoleAssignments.revokedAt)));
}

export async function listAssignableRoleDefinitions(roleKeys: string[]) {
  if (!roleKeys.length) return [];
  return db
    .select({ roleKey: accessRoles.roleKey, label: accessRoles.label, scope: accessRoles.scope })
    .from(accessRoles)
    .where(inArray(accessRoles.roleKey, roleKeys));
}
