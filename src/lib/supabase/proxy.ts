
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

type CacheHeaders = Record<string, string | undefined>;

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Allow public pages to render when optional auth configuration is absent.
  if (!url || !key) return response;

  let sessionRefreshed = false;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(
        cookiesToSet: CookieToSet[],
        cacheHeaders?: CacheHeaders,
      ) {
        sessionRefreshed = true;

        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }

        for (const [name, value] of Object.entries(cacheHeaders ?? {})) {
          if (typeof value === "string") {
            response.headers.set(name, value);
          }
        }
      },
    },
  });

  // Verify JWT claims; getSession() alone is not an authorization check.
  await supabase.auth.getClaims();

  if (sessionRefreshed) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}
