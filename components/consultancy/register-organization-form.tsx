"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ORG_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "consultancy", label: "Consultancy" },
];

const CONSULTATION_MODES = [
  "Online Consultation",
  "In-person Visit",
];

export function RegisterOrganizationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"hospital" | "clinic" | "consultancy">("clinic");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [consultationModes, setConsultationModes] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const toggleConsultationMode = (mode: string) => {
    setConsultationModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage("Organization name is required.");
      setStatus("error");
      return;
    }
    if (!phone.trim()) {
      setMessage("Contact phone is required.");
      setStatus("error");
      return;
    }
    if (!address.trim()) {
      setMessage("Address is required.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Session expired. Please sign in again.");
      setStatus("error");
      return;
    }

    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .ilike("name", trimmedName)
      .limit(1);

    if (existing && existing.length > 0) {
      setMessage("An organization with this name already exists.");
      setStatus("error");
      return;
    }

    const { data: org, error } = await supabase
      .from("organizations")
      .insert({
        name: trimmedName,
        type,
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim() || null,
        consultation_modes: consultationModes.length > 0 ? consultationModes : null,
      })
      .select("id")
      .single();

    if (error) {
      setMessage(error.message);
      setStatus("error");
      return;
    }

    await supabase
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("id", user.id);

    setStatus("success");
    setMessage("Organization registered successfully. Redirecting…");
    router.refresh();
    router.push("/dashboard/hospital/complete-profile");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-medium text-text-primary">Organization details</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-text-muted">Name *</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hospital, clinic, or consultancy name"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "hospital" | "clinic" | "consultancy")}
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            >
              {ORG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm text-text-muted">Phone *</label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact number"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label htmlFor="address" className="mb-1 block text-sm text-text-muted">Address *</label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label htmlFor="description" className="mb-1 block text-sm text-text-muted">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief about your organization"
              className="w-full rounded-xl border border-white/10 bg-navy-light/80 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-muted">Supported consultation modes</label>
            <div className="flex flex-wrap gap-2">
              {CONSULTATION_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleConsultationMode(mode)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    consultationModes.includes(mode)
                      ? "bg-teal/30 text-teal"
                      : "bg-white/10 text-text-muted hover:bg-white/20"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${status === "success" ? "text-teal" : "text-error"}`}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-70"
      >
        {status === "loading" ? "Registering…" : status === "success" ? "Registered" : "Register organization"}
      </button>
    </form>
  );
}
