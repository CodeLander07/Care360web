import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; recovery?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/auth/set-password");

  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/dashboard";
  const isRecovery = params.recovery === "1";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-6 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8, 20, 28, 1) 0%, rgba(15, 36, 53, 1) 50%, rgba(12, 28, 40, 1) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex justify-center">
          <Image
            src="/weblogo.png"
            alt="Care360"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <div
          className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] px-8 py-10 backdrop-blur-xl sm:px-10 sm:py-12"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 36, 53, 0.75) 0%, rgba(26, 51, 71, 0.55) 100%)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px -12px rgba(0,0,0,0.4)",
          }}
        >
          <h1 className="text-center text-xl font-semibold text-text-primary sm:text-2xl">
            {isRecovery ? "Reset your password" : "Complete your account"}
          </h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            {isRecovery ? "Enter your new password" : "Set a password and choose your role"}
          </p>
          <SetPasswordForm nextPath={nextPath} isRecovery={isRecovery} />
        </div>
      </div>
    </div>
  );
}
