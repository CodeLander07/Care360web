"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";

type Patient = { id: string; email: string | null };

export function AddPrescriptionForm({
  patients,
  organizationId,
}: {
  patients: Patient[];
  organizationId: string;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const trimmed = prescriptionText.trim();
    if (!trimmed) {
      setMessage("Please enter the prescription details.");
      setStatus("error");
      return;
    }
    if (!patientId) {
      setMessage("Please select a patient.");
      setStatus("error");
      return;
    }
    setStatus("loading");

    const drugs = trimmed
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const supabase = createClient();
    const { error } = await supabase.from("prescriptions").insert({
      patient_id: patientId,
      organization_id: organizationId,
      drugs,
      notes: notes.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");
    setPrescriptionText("");
    setNotes("");
    setPatientId("");
    router.refresh();
  };

  return (
    <GlassCard className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">Add prescription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patient" className="mb-1 block text-sm text-text-muted">
            Patient *
          </label>
          <select
            id="patient"
            required
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            disabled={patients.length === 0}
          >
            <option value="">
              {patients.length === 0
                ? "No patients with appointments yet"
                : "Select patient"}
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.email || "Patient " + p.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prescription" className="mb-1 block text-sm text-text-muted">
            Prescription (drugs, dosage) *
          </label>
          <textarea
            id="prescription"
            required
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
            rows={4}
            placeholder="Enter drugs, dosage, frequency... (one per line or comma-separated)"
            className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm text-text-muted">
            Notes (optional)
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional instructions"
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
          className="rounded-full bg-teal px-6 py-2.5 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-70"
        >
          {status === "loading" ? "Adding…" : "Add prescription"}
        </button>
      </form>
    </GlassCard>
  );
}
