"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";

type Org = { id: string; name: string; type: string; address: string | null };

export function ScheduleAppointmentForm({
  organizations,
}: {
  organizations: Org[];
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [type, setType] = useState<"in_person" | "online">("in_person");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !scheduledAt) {
      setMessage("Select a hospital/clinic and choose a date & time.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus("error");
      setMessage("Please sign in to schedule.");
      return;
    }
    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      organization_id: orgId,
      type,
      scheduled_at: new Date(scheduledAt).toISOString(),
      notes: notes.trim() || null,
      status: "pending",
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    setOrgId("");
    setScheduledAt("");
    setNotes("");
    router.refresh();
  };

  if (organizations.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-text-muted">
          No hospitals or clinics have registered yet. Check back soon.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Schedule an appointment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Hospital / Clinic
          </label>
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          >
            <option value="">Select...</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Appointment type
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="type"
                value="in_person"
                checked={type === "in_person"}
                onChange={() => setType("in_person")}
                className="text-teal focus:ring-teal"
              />
              <span className="text-text-primary">In-person visit</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="type"
                value="online"
                checked={type === "online"}
                onChange={() => setType("online")}
                className="text-teal focus:ring-teal"
              />
              <span className="text-text-primary">Online consultation</span>
            </label>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Brief reason for visit..."
            className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-error" : "text-teal"}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-teal py-3 text-sm font-medium text-white transition-colors hover:bg-teal/90 disabled:opacity-70"
        >
          {status === "loading" ? "Scheduling…" : status === "success" ? "Scheduled" : "Schedule appointment"}
        </button>
      </form>
    </GlassCard>
  );
}
