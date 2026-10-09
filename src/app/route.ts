import { type NextRequest, NextResponse } from "next/server";
import { detectLocale } from "@/lib/i18n";

// "/" has no page of its own: send visitors to the locale their browser prefers.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const locale = detectLocale(request.headers.get("accept-language"));
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
  response.headers.set("Vary", "Accept-Language");
  return response;
}
