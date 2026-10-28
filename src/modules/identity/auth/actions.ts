
"use server";

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { provisionAccountForUser } from "@/modules/identity/application/provision-account";
import {
  authPortalPath,
  isAuthPortal,
  type AuthPortal,
} from "@/modules/identity/auth/portals";

function localeOrDefault(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function textValue(
  formData: FormData,
  key: string,
  maxLength = 200,
): string {
  const value = formData.get(key);
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function rawValue(
  formData: FormData,
  key: string,
  maxLength = 1024,
): string {
  const value = formData.get(key);

  // Passwords are not trimmed because spaces may be intentional credentials.
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function meetsPasswordPolicy(password: string): boolean {
  return (
    password.length >= 8 &&
    /\p{L}/u.test(password) &&
    /\p{N}/u.test(password) &&
    /[^\p{L}\p{N}]/u.test(password)
  );
}

function siteUrl(): string {
  // Configure NEXT_PUBLIC_SITE_URL in production.
  // Do not derive authentication redirects from an untrusted Host header.
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return configuredUrl.replace(/\/+$/, "");
}

function callbackUrl(locale: Locale, nextPath: string): string {
  const callback = new URL(`/${locale}/auth/callback`, siteUrl());

  callback.searchParams.set("next", nextPath);

  return callback.toString();
}

function workspaceUrl(locale: Locale, portal: AuthPortal): string {
  const destination = new URL(
    `/${locale}/workspace`,
    siteUrl(),
  );

  destination.searchParams.set("portal", portal);

  return `${destination.pathname}${destination.search}`;
}

async function signInForPortal(
  rawLocale: string,
  portal: AuthPortal,
  formData: FormData,
): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const signInPath = authPortalPath(locale, portal, "sign-in");

  const email = textValue(formData, "email", 254).toLowerCase();
  const password = rawValue(formData, "password");

  if (!email || !password) {
    redirect(`${signInPath}?error=invalid`);
  }

  const supabase = await createSupabaseServerClient();

  const { error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    redirect(`${signInPath}?error=invalid-credentials`);
  }

  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    console.error(
      "[HCIL AUTH] Authentication succeeded, but the authenticated user could not be retrieved.",
      userError,
    );

    redirect(`${signInPath}?error=invalid-credentials`);
  }

  console.info("[HCIL AUTH] Password sign-in succeeded.", {
    portal,
    userId: data.user.id,
    hasEmail: Boolean(data.user.email),
  });

  try {
    await provisionAccountForUser(data.user, locale);

    console.info("[HCIL AUTH] Profile provisioning succeeded.", {
      portal,
      userId: data.user.id,
    });
  } catch (error) {
    console.error(
      "[HCIL AUTH] Profile provisioning failed during sign-in.",
      {
        portal,
        userId: data.user.id,
        error,
      },
    );

    redirect(`${signInPath}?error=profile-setup`);
  }

  redirect(workspaceUrl(locale, portal));
}

export async function signInTalentAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  return signInForPortal(rawLocale, "talent", formData);
}

export async function signInBusinessAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  return signInForPortal(rawLocale, "business", formData);
}

export async function signInAgencyAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  return signInForPortal(rawLocale, "agency", formData);
}

async function signUpForPortal(
  rawLocale: string,
  portal: AuthPortal,
  formData: FormData,
): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const signUpPath = authPortalPath(locale, portal, "sign-up");
  const signInPath = authPortalPath(locale, portal, "sign-in");

  const fullName = textValue(formData, "full_name", 120);
  const email = textValue(formData, "email", 254).toLowerCase();
  const password = rawValue(formData, "password");
  const confirmPassword = rawValue(formData, "confirm_password");
  const organizationName = textValue(
    formData,
    "organization_name",
    160,
  );

  let organizationType = textValue(
    formData,
    "organization_type",
    48,
  );

  if (!fullName || !email || !password || !confirmPassword) {
    redirect(`${signUpPath}?error=required`);
  }

  if (!meetsPasswordPolicy(password)) {
    redirect(`${signUpPath}?error=password-short`);
  }

  if (password !== confirmPassword) {
    redirect(`${signUpPath}?error=password-mismatch`);
  }

  const organizationRequired = portal !== "talent";

  const businessOrganizationTypes = [
    "employer",
    "ngo",
    "public_sector",
    "educational_institution",
    "artisan_association",
    "cooperative",
    "other",
  ];

  const agencyOrganizationTypes = [
    "staffing_agency",
    "recruitment_agency",
  ];

  if (
    portal === "business" &&
    !businessOrganizationTypes.includes(organizationType)
  ) {
    organizationType = "employer";
  }

  if (
    portal === "agency" &&
    !agencyOrganizationTypes.includes(organizationType)
  ) {
    redirect(`${signUpPath}?error=invalid-organization-type`);
  }

  if (organizationRequired && organizationName.length < 2) {
    redirect(`${signUpPath}?error=organization-required`);
  }

  const supabase = await createSupabaseServerClient();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(
        locale,
        `/${locale}/workspace?portal=${portal}&welcome=1`,
      ),
      data: {
        full_name: fullName,
        locale,
        account_type: portal,
        organization_name: organizationRequired
          ? organizationName
          : null,
        organization_type: organizationRequired
          ? organizationType
          : null,
      },
    },
  });

  // Keep signup errors generic to avoid exposing account-existence details.
  if (signUpError) {
    console.error("[HCIL AUTH] Signup request failed.", {
      portal,
      message: signUpError.message,
      code: signUpError.code,
    });

    redirect(`${signUpPath}?error=signup-failed`);
  }

  // With email confirmation disabled, Supabase may return an active session.
  // In that case, provision the HCIL profile immediately.
  if (data.session && data.user) {
    try {
      await provisionAccountForUser(data.user, locale);

      console.info("[HCIL AUTH] Profile provisioning succeeded after signup.", {
        portal,
        userId: data.user.id,
      });
    } catch (error) {
      console.error(
        "[HCIL AUTH] Profile provisioning failed after signup.",
        {
          portal,
          userId: data.user.id,
          error,
        },
      );

      redirect(`${signInPath}?error=profile-setup`);
    }

    redirect(workspaceUrl(locale, portal));
  }

  // Email confirmation is required, or Supabase did not create a session.
  redirect(`${signInPath}?message=check-email`);
}

export async function signUpTalentAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  return signUpForPortal(rawLocale, "talent", formData);
}

export async function signUpBusinessAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  return signUpForPortal(rawLocale, "business", formData);
}

export async function signUpAgencyAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  return signUpForPortal(rawLocale, "agency", formData);
}

export async function signOutAction(
  rawLocale: string,
): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[HCIL AUTH] Sign-out failed.", error);
  }

  redirect(`/${locale}`);
}

export async function requestPasswordResetAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const email = textValue(formData, "email", 254).toLowerCase();

  const submittedPortal = textValue(formData, "portal", 16);
  const portal = isAuthPortal(submittedPortal)
    ? submittedPortal
    : null;

  const portalQuery = portal ? `&portal=${portal}` : "";

  if (!email) {
    redirect(
      `/${locale}/auth/forgot-password?sent=1${portalQuery}`,
    );
  }

  const nextPath =
    `/${locale}/auth/update-password` +
    (portal ? `?portal=${portal}` : "");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl(locale, nextPath),
  });

  // Use a generic response to avoid revealing whether an email exists.
  if (error) {
    console.error("[HCIL AUTH] Password reset request failed.", {
      message: error.message,
      code: error.code,
    });
  }

  redirect(
    `/${locale}/auth/forgot-password?sent=1${portalQuery}`,
  );
}

export async function updatePasswordAction(
  rawLocale: string,
  formData: FormData,
): Promise<never> {
  const locale = localeOrDefault(rawLocale);

  const submittedPortal = textValue(formData, "portal", 16);
  const portal = isAuthPortal(submittedPortal)
    ? submittedPortal
    : null;

  const password = rawValue(formData, "password");
  const confirmPassword = rawValue(formData, "confirm_password");

  const returnSignIn = portal
    ? authPortalPath(locale, portal, "sign-in")
    : `/${locale}/auth/sign-in`;

  const portalQuery = portal ? `&portal=${portal}` : "";

  if (!meetsPasswordPolicy(password)) {
    redirect(
      `/${locale}/auth/update-password?error=password-short` +
        (portal ? `&portal=${portal}` : ""),
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/${locale}/auth/update-password?error=password-mismatch` +
        (portal ? `&portal=${portal}` : ""),
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect(`${returnSignIn}?error=recovery-expired`);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    console.error("[HCIL AUTH] Password update failed.", {
      userId: data.user.id,
      message: updateError.message,
      code: updateError.code,
    });

    redirect(
      `/${locale}/auth/update-password?error=update-failed${portalQuery}`,
    );
  }

  redirect(
    `/${locale}/workspace?password-updated=1` +
      (portal ? `&portal=${portal}` : ""),
  );
}
