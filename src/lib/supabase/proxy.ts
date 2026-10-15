import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Do not make the public website unavailable solely because optional auth configuration is
  // absent in a local preview. Auth routes themselves fail with a clear configuration message.
  if (!url || !key) return response;

  let sessionRefreshed = false;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        sessionRefreshed = true;
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Newer @supabase/ssr versions provide cache headers when a session is refreshed.
        // Preserve them so a CDN cannot cache a personalized response for another user.
        Object.entries(cacheHeaders ?? {}).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  // getClaims verifies the JWT; getSession() alone is not an authorization check.
  await supabase.auth.getClaims();
  if (sessionRefreshed) response.headers.set("Cache-Control", "private, no-store");
  return response;
}
