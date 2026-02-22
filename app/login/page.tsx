import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex justify-center">
          <Image
            src="/weblogo.png"
            alt="Care360"
            width={256}
            height={72}
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
            Sign in
          </h1>
          <p className="mt-2 text-center text-sm text-text-muted">
            Enter your email and password
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-teal hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
