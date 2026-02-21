"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    setMessage("Check your email for the verification link.");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
      {message && (
        <p
          className={`text-center text-sm ${
            status === "error" ? "text-error" : "text-teal"
          }`}
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-70"
      >
        {status === "loading" ? "Sending link…" : "Continue with Email"}
      </button>
    </form>
  );
}
