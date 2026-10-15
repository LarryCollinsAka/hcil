import { and, eq, gt, isNull, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { accessPermissions, accessRoles, accessRolePermissions, profiles, userRoleAssignments } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

export type AuthenticatedPrincipal = {
  id: string;
  email: string;
};

export async function getAuthenticatedPrincipal(): Promise<AuthenticatedPrincipal | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
}

export async function hasPermission(
  profileId: string,
  permissionKey: string,
  organizationId?: string,
): Promise<boolean> {
  const now = new Date();
  const scopeCondition = organizationId
    ? or(
        and(eq(accessRoles.scope, "platform"), isNull(userRoleAssignments.organizationId)),
        and(eq(accessRoles.scope, "organization"), eq(userRoleAssignments.organizationId, organizationId)),
      )
    : and(eq(accessRoles.scope, "platform"), isNull(userRoleAssignments.organizationId));

  const result = await db
    .select({ permissionKey: accessPermissions.permissionKey })
    .from(userRoleAssignments)
    .innerJoin(accessRoles, eq(userRoleAssignments.roleId, accessRoles.id))
    .innerJoin(accessRolePermissions, eq(accessRolePermissions.roleId, accessRoles.id))
    .innerJoin(accessPermissions, eq(accessRolePermissions.permissionId, accessPermissions.id))
    .where(
      and(
        eq(userRoleAssignments.profileId, profileId),
        eq(accessPermissions.permissionKey, permissionKey),
        isNull(userRoleAssignments.revokedAt),
        or(isNull(userRoleAssignments.expiresAt), gt(userRoleAssignments.expiresAt, now)),
        scopeCondition,
      ),
    )
    .limit(1);

  return result.length > 0;
}

export async function requireAuthenticatedPrincipal(localeValue: string): Promise<AuthenticatedPrincipal> {
  const locale: Locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
  const principal = await getAuthenticatedPrincipal();
  if (!principal) redirect(`/${locale}/auth/sign-in`);

  const profile = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, principal.id)).limit(1);
  if (!profile.length) redirect(`/${locale}/auth/sign-in?error=profile-setup`);
  return principal;
}

/** Use on every protected server action, route handler, or page data query. */
export async function requirePermission(
  localeValue: string,
  permissionKey: string,
  organizationId?: string,
): Promise<AuthenticatedPrincipal> {
  const locale: Locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE;
  const principal = await requireAuthenticatedPrincipal(locale);
  const allowed = await hasPermission(principal.id, permissionKey, organizationId);
  if (!allowed) redirect(`/${locale}/workspace?error=forbidden`);
  return principal;
}
