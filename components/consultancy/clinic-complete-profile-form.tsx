"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Org = { id: string; name: string; type: string; address: string | null; description: string | null; phone: string | null } | null;

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Orthopedist",
  "Pediatrician",
  "Gynecologist",
  "ENT",
  "Ophthalmologist",
  "Psychiatrist",
  "Neurologist",
  "Others",
];

const SERVICE_TAGS = [
  "General Checkup",
  "Online Consultation",
  "In-person Visit",
  "Follow-up",
  "Emergency",
  "Vaccination",
];

export function ClinicCompleteProfileForm({ organization }: { organization: Org }) {
  const router = useRouter();
  const [address, setAddress] = useState(organization?.address ?? "");
  const [phone, setPhone] = useState(organization?.phone ?? "");
  const [description, setDescription] = useState(organization?.description ?? "");
  const [doctors, setDoctors] = useState([
    { name: "", specialization: "General Physician", experience_years: 0, bio: "", fee_per_min: "", services: [] as string[] },
  ]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const addDoctor = () => {
    setDoctors([...doctors, { name: "", specialization: "General Physician", experience_years: 0, bio: "", fee_per_min: "", services: [] }]);
  };

  const updateDoctor = (i: number, field: string, value: unknown) => {
    const next = [...doctors];
    (next[i] as Record<string, unknown>)[field] = value;
    setDoctors(next);
  };

  const toggleService = (i: number, svc: string) => {
    const d = doctors[i];
    const next = d.services.includes(svc) ? d.services.filter((s) => s !== svc) : [...d.services, svc];
    updateDoctor(i, "services", next);
  };

  const removeDoctor = (i: number) => {
    if (doctors.length <= 1) return;
    setDoctors(doctors.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    const valid = doctors.every((d) => d.name.trim());
    if (!valid) {
      setMessage("Please enter doctor name for all entries.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    const supabase = createClient();

    await supabase
      .from("organizations")
      .update({ address: address.trim() || null, phone: phone.trim() || null, description: description.trim() || null })
      .eq("id", organization.id);

    for (const d of doctors) {
      const { error } = await supabase.from("doctors").insert({
        organization_id: organization.id,
        name: d.name.trim(),
        specialization: d.specialization,
        experience_years: Number(d.experience_years) || 0,
        bio: d.bio.trim() || null,
        fee_per_min: d.fee_per_min ? Math.round(parseFloat(d.fee_per_min)) : null,
        services: d.services.length ? d.services : null,
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
    }
    router.push("/dashboard/hospital");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-medium text-text-primary">Clinic details</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-muted">Clinic name</label>
            <input
              type="text"
              value={organization?.name ?? ""}
              readOnly
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-text-muted"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact number"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief about your clinic"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-text-primary">Doctors</h2>
          <button
            type="button"
            onClick={addDoctor}
            className="rounded-lg border border-teal/50 px-4 py-2 text-sm text-teal hover:bg-teal/10"
          >
            + Add doctor
          </button>
        </div>
        <div className="space-y-6">
          {doctors.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 p-4"
            >
              <div className="mb-4 flex justify-between">
                <span className="text-sm font-medium text-text-muted">Doctor {i + 1}</span>
                {doctors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDoctor(i)}
                    className="text-sm text-error hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Name *</label>
                  <input
                    type="text"
                    required
                    value={d.name}
                    onChange={(e) => updateDoctor(i, "name", e.target.value)}
                    placeholder="Dr. Full Name"
                    className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Specialization *</label>
                  <select
                    value={d.specialization}
                    onChange={(e) => updateDoctor(i, "specialization", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                  >
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Experience (years)</label>
                  <input
                    type="number"
                    min={0}
                    value={d.experience_years || ""}
                    onChange={(e) => updateDoctor(i, "experience_years", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Fee (₹/min, optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={d.fee_per_min}
                    onChange={(e) => updateDoctor(i, "fee_per_min", e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm text-text-muted">Bio</label>
                <textarea
                  value={d.bio}
                  onChange={(e) => updateDoctor(i, "bio", e.target.value)}
                  rows={2}
                  placeholder="Brief about the doctor"
                  className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                />
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm text-text-muted">Services offered</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TAGS.map((svc) => (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(i, svc)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        d.services.includes(svc)
                          ? "bg-teal/30 text-teal"
                          : "bg-white/10 text-text-muted hover:bg-white/20"
                      }`}
                    >
                      {svc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-error">{message}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-70"
      >
        {status === "loading" ? "Saving…" : "Complete & go to dashboard"}
      </button>
    </form>
  );
}
