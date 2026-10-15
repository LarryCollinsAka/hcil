import { config as loadEnv } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { accessRoles, profiles, userRoleAssignments } from "../src/db/schema";

// Match drizzle.config.ts: repository-local overrides first, then .env fallback. Values
// already provided by the private shell/environment always take precedence.
loadEnv({ path: ".env.local", override: false });
loadEnv({ path: ".env", override: false });

/**
 * One-time, server-side bootstrap. There is intentionally no public super-admin registration UI.
 * Refuses to assign the role if any active super-admin already exists.
 * A transaction-scoped advisory lock prevents concurrent bootstrap invocations from racing.
 *
 * Required env: POSTGRES_URL_NON_POOLING (preferred; POSTGRES_URL fallback) and
 * HCIL_BOOTSTRAP_SUPERADMIN_EMAIL. Do not commit .env files.
 */
async function main() {
  const databaseUrl = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
  const targetEmail = process.env.HCIL_BOOTSTRAP_SUPERADMIN_EMAIL?.trim().toLowerCase();
  if (!databaseUrl || !targetEmail) {
    throw new Error("Set POSTGRES_URL_NON_POOLING (preferred; POSTGRES_URL fallback) and HCIL_BOOTSTRAP_SUPERADMIN_EMAIL in the private environment.");
  }

  const client = postgres(databaseUrl, { prepare: false, max: 1 });
  const db = drizzle({ client, schema });
  try {
    const result = await db.transaction(async (tx) => {
      // Serialize bootstrap attempts. Application role-management actions cannot grant super_admin.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(781092, 1)`);
      const now = new Date();

      // The unique active-assignment indexes use revoked_at, not wall-clock time, so materialize
      // expired temporary super-admin assignments before applying the one-time guard.
      const expiredSuperadmins = await tx
        .select({ id: userRoleAssignments.id })
        .from(userRoleAssignments)
        .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
        .where(and(
          eq(accessRoles.roleKey, "super_admin"),
          isNull(userRoleAssignments.revokedAt),
          sql`${userRoleAssignments.expiresAt} is not null and ${userRoleAssignments.expiresAt} <= ${now}`,
        ));
      if (expiredSuperadmins.length) {
        await tx.update(userRoleAssignments)
          .set({ revokedAt: now, revocationReason: "Expired super-admin assignment closed during bootstrap check" })
          .where(inArray(userRoleAssignments.id, expiredSuperadmins.map((item) => item.id)));
      }

      const [target] = await tx
        .select({ id: profiles.id, email: profiles.email })
        .from(profiles)
        .where(sql`lower(${profiles.email}) = ${targetEmail}`)
        .limit(1);
      if (!target) {
        throw new Error("No HCIL profile matches the bootstrap email. Sign up, confirm the email, then retry.");
      }

      const activeSuperadmins = await tx
        .select({ profileId: userRoleAssignments.profileId })
        .from(userRoleAssignments)
        .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
        .where(and(eq(accessRoles.roleKey, "super_admin"), isNull(userRoleAssignments.revokedAt)))
        .limit(1);

      if (activeSuperadmins.length > 0) {
        if (activeSuperadmins[0].profileId === target.id) {
          return { outcome: "already-active" as const, email: target.email };
        }
        throw new Error("An active super-admin already exists. Do not use bootstrap to bypass normal role governance.");
      }

      const [role] = await tx
        .select({ id: accessRoles.id })
        .from(accessRoles)
        .where(eq(accessRoles.roleKey, "super_admin"))
        .limit(1);
      if (!role) throw new Error("RBAC seed roles are missing. Apply the auth/RBAC migration first.");

      await tx.insert(userRoleAssignments).values({
        profileId: target.id,
        roleId: role.id,
        grantedBy: target.id,
        reason: "One-time initial platform bootstrap via private operator command",
      });
      return { outcome: "bootstrapped" as const, email: target.email };
    });

    if (result.outcome === "already-active") {
      process.stdout.write("This profile is already the active super-admin; no change made.\n");
    } else {
      process.stdout.write(`Bootstrapped super-admin for ${result.email}. Remove HCIL_BOOTSTRAP_SUPERADMIN_EMAIL from the environment now.\n`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown bootstrap failure";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
