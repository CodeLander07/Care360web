"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "patient" | "hospital_admin";

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

export function SetPasswordForm({ nextPath, isRecovery = false }: { nextPath: string; isRecovery?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [orgName, setOrgName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const strength = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-error", "bg-warning", "bg-teal/70", "bg-success"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }
    if (!isRecovery && !role) {
      setMessage("Please select your role");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      setMessage("Session expired. Please sign in again.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    if (!isRecovery && role) {
      await supabase
        .from("profiles")
        .update({ role: role === "hospital_admin" ? "hospital_admin" : "patient" })
        .eq("id", user.id);
    }
    if (!isRecovery && role === "hospital_admin" && orgName.trim()) {
      const { data: org } = await supabase
        .from("organizations")
        .insert({ name: orgName.trim(), type: "clinic" })
        .select("id")
        .single();
      if (org) {
        await supabase
          .from("profiles")
          .update({ organization_id: org.id })
          .eq("id", user.id);
      }
    }
    await supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id);
    router.push(nextPath);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-navy-light/90 px-4 py-3.5 pr-12 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 focus:ring-offset-2 focus:ring-offset-navy"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
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
            <span className="text-xs text-text-muted">{strengthLabels[strength]}</span>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="confirmPassword" className="sr-only">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-navy-light/90 px-4 py-3.5 pr-12 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 focus:ring-offset-2 focus:ring-offset-navy"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>
      {!isRecovery && (
      <>
      <div>
        <p className="mb-3 text-sm font-medium text-text-secondary">I am a…</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`rounded-xl border py-3 px-4 text-sm font-medium transition-colors ${
              role === "patient"
                ? "border-teal bg-teal/20 text-teal"
                : "border-white/10 text-text-secondary hover:border-white/20"
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("hospital_admin")}
            className={`rounded-xl border py-3 px-4 text-sm font-medium transition-colors ${
              role === "hospital_admin"
                ? "border-teal bg-teal/20 text-teal"
                : "border-white/10 text-text-secondary hover:border-white/20"
            }`}
          >
            Clinic
          </button>
        </div>
      </div>
      {role === "hospital_admin" && (
        <div>
          <label htmlFor="orgName" className="sr-only">
            Organization name
          </label>
          <input
            id="orgName"
            type="text"
            placeholder="Clinic or hospital name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-light/90 px-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 focus:ring-offset-2 focus:ring-offset-navy"
          />
        </div>
      )}
      </>
      )}
      {message && <p className="text-center text-sm text-error">{message}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-70"
      >
        {status === "loading" ? (isRecovery ? "Updating…" : "Creating account…") : (isRecovery ? "Update password" : "Set password & continue")}
      </button>
    </form>
  );
}
