"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { DoctorCard } from "./doctor-card";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  experience_years: number;
  bio: string | null;
  avatar_url: string | null;
  fee_per_min: number | null;
  rating: number;
  sessions_count: number;
  is_online: boolean;
  services: string[] | null;
  organization_id: string;
  organizations: { name: string; type: string } | null;
};

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  type: string;
  organizations: { name: string; type: string } | null;
};

const TOP_OFFERINGS = [
  "General Checkup",
  "Online Consultation",
  "In-person Visit",
  "Follow-up",
  "Emergency",
  "Vaccination",
];

export function ConsultancyListing({
  doctors,
  appointments,
}: {
  doctors: Doctor[];
  appointments: Appointment[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [scheduleOrgId, setScheduleOrgId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [apptType, setApptType] = useState<"in_person" | "online">("in_person");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const specializations = useMemo(() => {
    const set = new Set(doctors.map((d) => d.specialization));
    return Array.from(set).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    let list = doctors;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.organizations?.name?.toLowerCase().includes(q)
      );
    }
    if (filterSpec) {
      const isService = TOP_OFFERINGS.includes(filterSpec);
      list = list.filter((d) =>
        isService
          ? (d.services ?? []).includes(filterSpec)
          : d.specialization === filterSpec
      );
    }
    return list;
  }, [doctors, search, filterSpec]);

  const recentOnline = doctors.filter((d) => d.is_online).slice(0, 6);

  const handleSchedule = (orgId: string) => {
    setScheduleOrgId(orgId);
    setScheduledAt("");
  };

  const submitAppointment = async () => {
    if (!scheduleOrgId || !scheduledAt) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("appointments").insert({
      patient_id: user.id,
      organization_id: scheduleOrgId,
      type: apptType,
      scheduled_at: new Date(scheduledAt).toISOString(),
      notes: notes.trim() || null,
      status: "pending",
    });
    setScheduleOrgId(null);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors or clinics..."
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 py-2.5 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
          </div>
          <select
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="rounded-xl border border-white/10 bg-navy-light/80 px-4 py-2.5 text-sm text-text-primary focus:border-teal focus:outline-none"
          >
            <option value="">All specializations</option>
            {specializations.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filtered.length ? (
            filtered.map((d) => (
              <DoctorCard
                key={d.id}
                doctor={d}
                onSchedule={handleSchedule}
              />
            ))
          ) : (
            <GlassCard className="p-8">
              <p className="text-text-muted">
                No doctors or clinics found. Try a different search or filter.
              </p>
            </GlassCard>
          )}
        </div>

        {scheduleOrgId && (
          <GlassCard className="mt-6 border-teal/30 p-6">
            <h3 className="mb-4 text-lg font-medium text-text-primary">Schedule appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-text-muted">Date & time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-text-muted">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={apptType === "in_person"} onChange={() => setApptType("in_person")} className="text-teal" />
                    <span className="text-text-primary">In-person</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={apptType === "online"} onChange={() => setApptType("online")} className="text-teal" />
                    <span className="text-text-primary">Online</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitAppointment}
                  disabled={!scheduledAt || submitting}
                  className="rounded-full bg-teal px-5 py-2 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-70"
                >
                  {submitting ? "Scheduling…" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleOrgId(null)}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm text-text-secondary hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        <h2 className="mb-4 mt-8 text-lg font-semibold text-text-primary">Your appointments</h2>
        <div className="space-y-4">
          {appointments.length ? (
            appointments.map((a) => (
              <GlassCard key={a.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{a.organizations?.name ?? "—"}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {new Date(a.scheduled_at).toLocaleString()} • {a.type === "online" ? "Online" : "In-person"}
                    </p>
                    {a.notes && <p className="mt-2 text-sm text-text-secondary">{a.notes}</p>}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      a.status === "confirmed" ? "bg-teal/20 text-teal" : a.status === "cancelled" ? "bg-white/10 text-text-muted" : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="p-8">
              <p className="text-text-secondary">No appointments scheduled.</p>
            </GlassCard>
          )}
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-72">
        <GlassCard className="p-4">
          <h3 className="mb-3 font-medium text-text-primary">Recently online</h3>
          {recentOnline.length ? (
            <div className="space-y-2">
              {recentOnline.map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/20 text-xs font-medium text-teal">
                    {d.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">{d.name}</p>
                    <p className="truncate text-xs text-text-muted">{d.organizations?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No doctors online.</p>
          )}
        </GlassCard>
        <GlassCard className="mt-4 p-4">
          <h3 className="mb-3 flex items-center gap-1 font-medium text-text-primary">
            Top offerings
          </h3>
          <div className="flex flex-wrap gap-2">
            {TOP_OFFERINGS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSpec((prev) => (prev === s ? "" : s))}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filterSpec === s ? "bg-teal/30 text-teal" : "bg-white/10 text-text-muted hover:bg-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>
      </aside>
    </div>
  );
}
