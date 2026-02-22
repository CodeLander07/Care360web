/**
 * Auth callback: exchanges magic link code for session.
 * New users (no password yet) → redirect to set-password (create password + choose role).
 * Returning users → redirect to dashboard.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const recovery = url.searchParams.get("recovery") === "1";
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback]", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (!data?.user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const isRecovery = type === "recovery" || recovery;
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("id", data.user.id)
    .single();

  const needsPassword = isRecovery || !profile || profile.has_password === false;
  if (needsPassword) {
    const next = encodeURIComponent("/dashboard");
    return NextResponse.redirect(`${origin}/auth/set-password?next=${next}${isRecovery ? "&recovery=1" : ""}`);
  }

  await supabase
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", data.user.id);
  return NextResponse.redirect(`${origin}/dashboard`);
}
