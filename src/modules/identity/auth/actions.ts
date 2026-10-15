"use server";

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { provisionAccountForUser } from "@/modules/identity/application/provision-account";

function localeOrDefault(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function textValue(formData: FormData, key: string, maxLength = 200): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function rawValue(formData: FormData, key: string, maxLength = 1024): string {
  const value = formData.get(key);
  // Passwords must not be trimmed: leading/trailing spaces may be intentional credentials.
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function siteUrl() {
  // Set NEXT_PUBLIC_SITE_URL for production (e.g. https://your-domain.cm). Do not derive
  // authentication redirect destinations from the untrusted Host header.
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function callbackUrl(locale: Locale, nextPath: string) {
  const callback = new URL(`/${locale}/auth/callback`, siteUrl());
  callback.searchParams.set("next", nextPath);
  return callback.toString();
}

export async function signInAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const email = textValue(formData, "email", 254).toLowerCase();
  const password = rawValue(formData, "password", 1024);

  if (!email || !password) redirect(`/${locale}/auth/sign-in?error=invalid`);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/${locale}/auth/sign-in?error=invalid-credentials`);

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect(`/${locale}/auth/sign-in?error=invalid-credentials`);

  try {
    await provisionAccountForUser(data.user, locale);
  } catch {
    redirect(`/${locale}/auth/sign-in?error=profile-setup`);
  }

  redirect(`/${locale}/workspace`);
}

export async function signUpAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const fullName = textValue(formData, "full_name", 120);
  const email = textValue(formData, "email", 254).toLowerCase();
  const password = rawValue(formData, "password", 1024);
  const confirmPassword = rawValue(formData, "confirm_password", 1024);
  const accountType = textValue(formData, "account_type", 32);
  let organizationName = textValue(formData, "organization_name", 160);
  let organizationType = textValue(formData, "organization_type", 48);

  if (!fullName || !email || !password || !confirmPassword) redirect(`/${locale}/auth/sign-up?error=required`);
  if (password.length < 10) redirect(`/${locale}/auth/sign-up?error=password-short`);
  if (password !== confirmPassword) redirect(`/${locale}/auth/sign-up?error=password-mismatch`);
  if (!["talent", "business", "agency", "both"].includes(accountType)) {
    redirect(`/${locale}/auth/sign-up?error=invalid-account-type`);
  }

  if (accountType === "agency") {
    organizationType = "staffing_agency";
  }
  const organizationRequired = accountType === "business" || accountType === "agency" || accountType === "both";
  const validOrganizationTypes = [
    "employer", "staffing_agency", "recruitment_agency", "ngo", "public_sector",
    "educational_institution", "artisan_association", "cooperative", "other",
  ];
  if (organizationRequired && organizationName.length < 2) {
    redirect(`/${locale}/auth/sign-up?error=organization-required`);
  }
  if (organizationRequired && !validOrganizationTypes.includes(organizationType)) {
    redirect(`/${locale}/auth/sign-up?error=invalid-organization-type`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl(locale, `/${locale}/workspace`),
      data: {
        full_name: fullName,
        locale,
        account_type: accountType,
        organization_name: organizationRequired ? organizationName : null,
        organization_type: organizationRequired ? organizationType : null,
      },
    },
  });

  // Keep sign-up errors generic to avoid leaking whether an email is already registered.
  if (error) redirect(`/${locale}/auth/sign-up?error=signup-failed`);

  if (data.session && data.user) {
    try {
      await provisionAccountForUser(data.user, locale);
    } catch {
      redirect(`/${locale}/auth/sign-up?error=profile-setup`);
    }
    redirect(`/${locale}/workspace?welcome=1`);
  }

  // Email confirmation is enabled: account provisioning happens after the callback verifies the user.
  redirect(`/${locale}/auth/check-email`);
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
  if (!email) redirect(`/${locale}/auth/forgot-password?sent=1`);

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl(locale, `/${locale}/auth/update-password`),
  });
  // Do not reveal whether the email exists.
  redirect(`/${locale}/auth/forgot-password?sent=1`);
}

export async function updatePasswordAction(rawLocale: string, formData: FormData): Promise<never> {
  const locale = localeOrDefault(rawLocale);
  const password = rawValue(formData, "password", 1024);
  const confirmPassword = rawValue(formData, "confirm_password", 1024);
  if (password.length < 10) redirect(`/${locale}/auth/update-password?error=password-short`);
  if (password !== confirmPassword) redirect(`/${locale}/auth/update-password?error=password-mismatch`);

  const supabase = await createSupabaseServerClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect(`/${locale}/auth/sign-in?error=recovery-expired`);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/${locale}/auth/update-password?error=update-failed`);
  redirect(`/${locale}/workspace?password-updated=1`);
}
