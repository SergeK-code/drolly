import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseCookieOptions } from "@/server/supabase/cookie-options";
import type { Database } from "@/server/supabase/database.types";

export function shouldRefreshAuth(
  pathname: string,
  cookieNames: string[],
): boolean {
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return false;
  }

  return cookieNames.some((name) => name.includes("-auth-token"));
}

export async function updateSession(request: NextRequest) {
  if (
    !shouldRefreshAuth(
      request.nextUrl.pathname,
      request.cookies.getAll().map((cookie) => cookie.name),
    )
  ) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
        }

        response = NextResponse.next({ request });

        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
