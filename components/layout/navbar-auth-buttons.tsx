import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SESSION_DAYS = 7;

export async function NavbarAuthButtons() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let showAccount = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_login")
      .eq("id", user.id)
      .single();

    const lastLogin = profile?.last_login ? new Date(profile.last_login) : null;
    const now = new Date();
    const daysSinceLogin = lastLogin
      ? (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceLogin <= SESSION_DAYS) {
      showAccount = true;
    } else {
      await supabase.auth.signOut();
    }
  }

  if (showAccount) {
    return (
      <>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Account
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full bg-[#a7f3d0] px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-[#6ee7b7] hover:shadow-[0_0_20px_rgba(167,243,208,0.3)]"
        >
          Dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-[#a7f3d0] px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-[#6ee7b7] hover:shadow-[0_0_20px_rgba(167,243,208,0.3)]"
      >
        Get started
      </Link>
    </>
  );
}
