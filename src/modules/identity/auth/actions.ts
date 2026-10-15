"use server";

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { provisionAccountForUser } from "@/modules/identity/application/provision-account";
import { authPortalPath, isAuthPortal, type AuthPortal } from "@/modules/identity/auth/portals";

function localeOrDefault(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function textValue(formData: FormData, key: string, maxLength = 200): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function rawValue(formData: FormData, key: string, maxLength = 1024): string {
  const value = formData.get(key);
  // Passwords are not trimmed because spaces may be intentional credentials.
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function siteUrl() {
  // Set NEXT_PUBLIC_SITE_URL for production. Never derive auth redirects from an untrusted Host header.
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function callbackUrl(locale: Locale, nextPath: string) {
  const callback = new URL(`/${locale}/auth/callback`, siteUrl());
  callback.searchParams.set("next", nextPath);
  return callback.toString();
}

async function signInForPortal(rawLocale: string, portal: AuthPortal, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const signInPath = authPortalPath(locale, portal, "sign-in");
  const email = textValue(formData, "email", 254).toLowerCase();
  const password = rawValue(formData, "password", 1024);

  if (!email || !password) redirect(`${signInPath}?error=invalid`);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`${signInPath}?error=invalid-credentials`);

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect(`${signInPath}?error=invalid-credentials`);
  try {
    await provisionAccountForUser(data.user, locale);
  } catch {
    redirect(`${signInPath}?error=profile-setup`);
  }

  // Portal chooses the entry experience only; it does not grant authorization.
  redirect(`/${locale}/workspace?portal=${portal}`);
}

export async function signInTalentAction(rawLocale: string, formData: FormData): Promise<never> {
  return signInForPortal(rawLocale, "talent", formData);
}
export async function signInBusinessAction(rawLocale: string, formData: FormData): Promise<never> {
  return signInForPortal(rawLocale, "business", formData);
}
export async function signInAgencyAction(rawLocale: string, formData: FormData): Promise<never> {
  return signInForPortal(rawLocale, "agency", formData);
}

async function signUpForPortal(rawLocale: string, portal: AuthPortal, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const signUpPath = authPortalPath(locale, portal, "sign-up");
  const fullName = textValue(formData, "full_name", 120);
  const email = textValue(formData, "email", 254).toLowerCase();
  const password = rawValue(formData, "password", 1024);
  const confirmPassword = rawValue(formData, "confirm_password", 1024);
  const organizationName = textValue(formData, "organization_name", 160);
  let organizationType = textValue(formData, "organization_type", 48);

  if (!fullName || !email || !password || !confirmPassword) redirect(`${signUpPath}?error=required`);
  if (password.length < 10) redirect(`${signUpPath}?error=password-short`);
  if (password !== confirmPassword) redirect(`${signUpPath}?error=password-mismatch`);

  const organizationRequired = portal !== "talent";
  const businessOrganizationTypes = [
    "employer", "ngo", "public_sector", "educational_institution", "artisan_association", "cooperative", "other",
  ];
  const agencyOrganizationTypes = ["staffing_agency", "recruitment_agency"];
  if (portal === "business" && !businessOrganizationTypes.includes(organizationType)) organizationType = "employer";
  if (portal === "agency" && !agencyOrganizationTypes.includes(organizationType)) {
    redirect(`${signUpPath}?error=invalid-organization-type`);
  }
  if (organizationRequired && organizationName.length < 2) redirect(`${signUpPath}?error=organization-required`);

  const accountType = portal;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(locale, `/${locale}/workspace?portal=${portal}&welcome=1`),
      data: {
        full_name: fullName,
        locale,
        account_type: accountType,
        organization_name: organizationRequired ? organizationName : null,
        organization_type: organizationRequired ? organizationType : null,
      },
    },
  });

  // Keep signup errors generic to avoid leaking whether an address already exists.
  if (error) redirect(`${signUpPath}?error=signup-failed`);
  if (data.session && data.user) {
    try {
      await provisionAccountForUser(data.user, locale);
    } catch {
      redirect(`${signUpPath}?error=profile-setup`);
    }
    redirect(`/${locale}/workspace?portal=${portal}&welcome=1`);
  }

  // With email confirmation enabled, the common callback provisions the identity after verification.
  redirect(`/${locale}/auth/check-email?portal=${portal}`);
}

export async function signUpTalentAction(rawLocale: string, formData: FormData): Promise<never> {
  return signUpForPortal(rawLocale, "talent", formData);
}
export async function signUpBusinessAction(rawLocale: string, formData: FormData): Promise<never> {
  return signUpForPortal(rawLocale, "business", formData);
}
export async function signUpAgencyAction(rawLocale: string, formData: FormData): Promise<never> {
  return signUpForPortal(rawLocale, "agency", formData);
}

export async function signOutAction(rawLocale: string): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

export async function requestPasswordResetAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const email = textValue(formData, "email", 254).toLowerCase();
  const submittedPortal = textValue(formData, "portal", 16);
  const portal = isAuthPortal(submittedPortal) ? submittedPortal : null;
  if (!email) redirect(`/${locale}/auth/forgot-password?sent=1${portal ? `&portal=${portal}` : ""}`);

  const nextPath = `/${locale}/auth/update-password${portal ? `?portal=${portal}` : ""}`;
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: callbackUrl(locale, nextPath) });
  redirect(`/${locale}/auth/forgot-password?sent=1${portal ? `&portal=${portal}` : ""}`);
}

export async function updatePasswordAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const submittedPortal = textValue(formData, "portal", 16);
  const portal = isAuthPortal(submittedPortal) ? submittedPortal : null;
  const password = rawValue(formData, "password", 1024);
  const confirmPassword = rawValue(formData, "confirm_password", 1024);
  const returnSignIn = portal ? authPortalPath(locale, portal, "sign-in") : `/${locale}/auth/sign-in`;
  if (password.length < 10) redirect(`/${locale}/auth/update-password?error=password-short${portal ? `&portal=${portal}` : ""}`);
  if (password !== confirmPassword) redirect(`/${locale}/auth/update-password?error=password-mismatch${portal ? `&portal=${portal}` : ""}`);

  const supabase = await createSupabaseServerClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect(`${returnSignIn}?error=recovery-expired`);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/${locale}/auth/update-password?error=update-failed${portal ? `&portal=${portal}` : ""}`);
  redirect(`/${locale}/workspace?password-updated=1${portal ? `&portal=${portal}` : ""}`);
}
