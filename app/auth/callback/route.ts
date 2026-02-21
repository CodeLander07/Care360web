/**
 * Supabase auth callback handler.
 * Exchanges code for session when user clicks magic link.
 * Redirects users without a password to /auth/set-password to complete account setup.
 */
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const recovery = url.searchParams.get("recovery") === "1";
  const next = url.searchParams.get("next") ?? "/";
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth&reason=no_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth&reason=exchange_failed`);
  }

  if (!data?.user) {
    return NextResponse.redirect(`${origin}/login?error=auth&reason=no_user`);
  }

  const isRecovery = type === "recovery" || recovery;
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_password")
    .eq("id", data.user.id)
    .single();

  const needsPasswordSetup = isRecovery || !profile || profile.has_password === false;
  if (needsPasswordSetup) {
    const dest = next.startsWith("/") ? next : `/${next}`;
    const nextEncoded = encodeURIComponent(dest === "/" ? "/dashboard" : dest);
    return NextResponse.redirect(`${origin}/auth/set-password?next=${nextEncoded}${isRecovery ? "&recovery=1" : ""}`);
  }

  await supabase
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", data.user.id);
  return NextResponse.redirect(`${origin}${next}`);
}
