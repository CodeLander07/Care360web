/**
 * Auth middleware.
 * - Redirects auth code to /auth/callback (Supabase may send to Site URL /)
 * - Redirects users without password to set-password
 * - Refreshes session
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");

  if (code && !url.pathname.startsWith("/auth/callback")) {
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (user && !url.pathname.startsWith("/auth/set-password") && !url.pathname.startsWith("/auth/callback") && url.pathname !== "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_password")
      .eq("id", user.id)
      .single();
    if (!profile || profile.has_password === false) {
      return NextResponse.redirect(new URL("/auth/set-password?next=%2Fdashboard", request.url));
    }
  }

  return response;
}
