"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/\d/.test(password)) score++;
  if (/[a-zA-Z]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

export function PasswordAuthForm({ isCreateFlow }: { isCreateFlow: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const strength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-error", "bg-warning", "bg-teal/70", "bg-success"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateFlow && password !== confirmPassword) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    const supabase = createClient();

    if (isCreateFlow) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setMessage("Check your email to confirm your account.");
        setStatus("idle");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    }
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
          className="w-full rounded-xl border border-white/10 bg-navy-light/90 px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-navy shadow-inner"
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
          autoComplete={isCreateFlow ? "new-password" : "current-password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-white/10 bg-navy-light/90 px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-navy shadow-inner"
        />
        {isCreateFlow && (
          <>
            <p className="mt-2 text-xs text-text-muted">
              Use at least 8 characters with a mix of letters and numbers
            </p>
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= strength ? strengthColors[strength] : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-muted">
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {isCreateFlow && (
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-navy-light/90 px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-navy shadow-inner"
          />
        </div>
      )}

      {message && (
        <p className="text-center text-sm text-error">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-blue-600 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-70"
      >
        {status === "loading"
          ? "Please wait…"
          : isCreateFlow
            ? "Set Password & Continue"
            : "Sign In"}
      </button>

      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <Link
          href="/login/forgot-password"
          className="text-sm text-text-muted transition-colors hover:text-text-secondary"
        >
          Forgot password?
        </Link>
        <Link
          href="/login"
          className="text-sm text-text-muted transition-colors hover:text-text-secondary"
        >
          Use email link instead
        </Link>
      </div>
    </form>
  );
}
