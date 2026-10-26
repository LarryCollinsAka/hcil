import type { User } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  accessRoles,
  organizationMembers,
  organizations,
  profiles,
  userRoleAssignments,
  workerProfiles,
} from "@/db/schema";
import { isLocale, type Locale } from "@/lib/i18n";

const ACCOUNT_TYPES = new Set(["talent", "business", "agency", "both"]);
const ORGANIZATION_TYPES = new Set([
  "employer",
  "staffing_agency",
  "recruitment_agency",
  "ngo",
  "public_sector",
  "educational_institution",
  "artisan_association",
  "cooperative",
  "other",
]);

type UserMetadata = Record<string, unknown>;

function asText(value: unknown, maxLength = 200): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : null;
}

function isWorkerAccount(accountType: string) {
  return accountType === "talent" || accountType === "both";
}

function needsOrganization(accountType: string) {
  return accountType === "business" || accountType === "agency" || accountType === "both";
}

/**
 * Idempotently creates the HCIL identity projection after Supabase Auth confirms the user.
 * Auth user_metadata is used only for self-service onboarding choices. It never grants platform
 * roles or representation rights; sensitive roles must be assigned through explicit RBAC flows.
 */
export async function provisionAccountForUser(user: User, fallbackLocale: Locale) {
  const email = user.email?.trim().toLowerCase();
  if (!email) throw new Error("A Supabase Auth account with an email address is required to provision an HCIL profile.");

  const metadata = (user.user_metadata ?? {}) as UserMetadata;
  const fullName = asText(metadata.full_name, 120) ?? email.split("@")[0] ?? "HCIL member";
  const preferredLocale = asText(metadata.locale, 8);
  const locale = preferredLocale && isLocale(preferredLocale) ? preferredLocale : fallbackLocale;
  const accountTypeRaw = asText(metadata.account_type, 32) ?? "talent";
  const accountType = ACCOUNT_TYPES.has(accountTypeRaw) ? accountTypeRaw : "talent";
  const organizationName = asText(metadata.organization_name, 160);
  const organizationTypeRaw = asText(metadata.organization_type, 48) ?? "employer";
  // The agency portal permits only the allow-listed agency types validated at signup.
  const organizationType = ORGANIZATION_TYPES.has(organizationTypeRaw) ? organizationTypeRaw : "employer";

  await db.transaction(async (tx) => {
    await tx
      .insert(profiles)
      .values({ id: user.id, fullName, email })
      .onConflictDoUpdate({
        target: profiles.id,
        set: { email, updatedAt: new Date() },
      });

    if (isWorkerAccount(accountType)) {
      await tx
        .insert(workerProfiles)
        .values({ profileId: user.id, countryCode: "CM" })
        .onConflictDoNothing();
    }

    // Registration may be retried after an email confirmation callback. Only create an initial
    // organization when the user has no memberships, so retrying cannot duplicate the organization.
    if (needsOrganization(accountType) && organizationName) {
      const existingMembership = await tx
        .select({ organizationId: organizationMembers.organizationId })
        .from(organizationMembers)
        .where(eq(organizationMembers.profileId, user.id))
        .limit(1);

      if (existingMembership.length === 0) {
        const [organization] = await tx
          .insert(organizations)
          .values({ name: organizationName, organizationType, countryCode: "CM" })
          .returning({ id: organizations.id });

        if (!organization) throw new Error("Could not create the organization workspace.");

        await tx.insert(organizationMembers).values({
          organizationId: organization.id,
          profileId: user.id,
          role: "owner",
        });

        const roleKey = organizationType === "staffing_agency" || organizationType === "recruitment_agency"
          ? "agency_owner"
          : "org_owner";
        const [role] = await tx
          .select({ id: accessRoles.id })
          .from(accessRoles)
          .where(and(eq(accessRoles.roleKey, roleKey), eq(accessRoles.scope, "organization")))
          .limit(1);

        if (!role) throw new Error("RBAC roles are not seeded. Apply the HCIL access-control migration first.");

        await tx.insert(userRoleAssignments).values({
          profileId: user.id,
          roleId: role.id,
          organizationId: organization.id,
          grantedBy: user.id,
          reason: "Self-service organization registration",
        });
      }
    }
  });

  return { profileId: user.id, locale, accountType };
}

