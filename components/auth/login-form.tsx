"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.user.id);
    }
    const next = searchParams.get("redirect") || "/dashboard";
    router.push(next);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 focus:ring-offset-2 focus:ring-offset-navy"
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 focus:ring-offset-2 focus:ring-offset-navy"
        />
      </div>
      {message && <p className="text-center text-sm text-error">{message}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-70"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center">
        <Link
          href="/login/forgot-password"
          className="text-sm text-text-muted transition-colors hover:text-teal"
        >
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
