"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { assignRole, revokeRole, RoleManagementError } from "@/modules/identity/application/role-management";

function safeLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function value(formData: FormData, key: string, maxLength = 240) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim().slice(0, maxLength) : "";
}

function safeError(error: unknown) {
  if (error instanceof RoleManagementError) {
    const known = new Set([
      "unauthenticated", "invalid-input", "target-not-found", "self-change-not-allowed",
      "role-not-found", "scope-mismatch", "forbidden", "role-not-assignable",
      "organization-required", "organization-not-found", "already-assigned",
      "assignment-not-found", "role-not-revocable",
    ]);
    return known.has(error.code) ? error.code : "operation-failed";
  }
  return "operation-failed";
}

export async function assignRoleAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = safeLocale(rawLocale);
  const organizationId = value(formData, "organization_id", 64);
  const contextQuery = organizationId ? `&organization_id=${encodeURIComponent(organizationId)}` : "";
  try {
    await assignRole({
      targetEmail: value(formData, "target_email", 254).toLowerCase(),
      roleKey: value(formData, "role_key", 80),
      organizationId: organizationId || undefined,
      reason: value(formData, "reason", 240),
    });
  } catch (error) {
    redirect(`/${locale}/workspace/access?error=${encodeURIComponent(safeError(error))}${contextQuery}`);
  }
  revalidatePath(`/${locale}/workspace/access`);
  redirect(`/${locale}/workspace/access?success=role-assigned${contextQuery}`);
}

export async function revokeRoleAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = safeLocale(rawLocale);
  const organizationId = value(formData, "organization_id", 64);
  const contextQuery = organizationId ? `&organization_id=${encodeURIComponent(organizationId)}` : "";
  try {
    await revokeRole({
      assignmentId: value(formData, "assignment_id", 64),
      reason: value(formData, "reason", 240),
    });
  } catch (error) {
    redirect(`/${locale}/workspace/access?error=${encodeURIComponent(safeError(error))}${contextQuery}`);
  }
  revalidatePath(`/${locale}/workspace/access`);
  redirect(`/${locale}/workspace/access?success=role-revoked${contextQuery}`);
}
