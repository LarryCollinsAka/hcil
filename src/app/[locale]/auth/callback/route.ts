import { NextRequest, NextResponse } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { provisionAccountForUser } from "@/modules/identity/application/provision-account";

function safeNextPath(value: string | null, locale: Locale, requestUrl: URL) {
  const fallback = `/${locale}/workspace`;
  if (!value || !value.startsWith(`/${locale}`) || value.startsWith("//")) return fallback;
  try {
    const next = new URL(value, requestUrl.origin);
    if (next.origin !== requestUrl.origin || !(next.pathname === `/${locale}` || next.pathname.startsWith(`/${locale}/`))) return fallback;
    return `${next.pathname}${next.search}${next.hash}`;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const destination = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Cookie");
    return response;
  };
  const supabase = await createSupabaseServerClient();
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return destination(`/${locale}/auth/sign-in?error=callback-failed`);
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return destination(`/${locale}/auth/sign-in?error=callback-failed`);

  try {
    await provisionAccountForUser(data.user, locale);
  } catch {
    return destination(`/${locale}/auth/sign-in?error=profile-setup`);
  }

  const next = safeNextPath(request.nextUrl.searchParams.get("next"), locale, request.nextUrl);
  return destination(next);
}
