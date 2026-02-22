"use client";

import { useState } from "react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";

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

export function DoctorCard({
  doctor,
  onSchedule,
}: {
  doctor: Doctor;
  onSchedule: (orgId: string) => void;
}) {
  const [showFullBio, setShowFullBio] = useState(false);
  const orgId = doctor.organization_id;
  const bio = doctor.bio ?? "";
  const displayBio = showFullBio || bio.length <= 120 ? bio : `${bio.slice(0, 120)}...`;

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative shrink-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white/10">
            {doctor.avatar_url ? (
              <Image
                src={doctor.avatar_url}
                alt={doctor.name}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-teal">
                {doctor.name.charAt(0)}
              </div>
            )}
            {doctor.is_online && (
              <span className="absolute bottom-0 right-0 rounded-full border-2 border-navy bg-teal px-2 py-0.5 text-[10px] font-medium text-white">
                Online
              </span>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-primary">{doctor.name}</p>
          <p className="text-sm text-text-muted">
            {doctor.specialization} | {doctor.organizations?.name ?? "—"}
          </p>
          {doctor.experience_years > 0 && (
            <p className="mt-1 text-xs text-text-secondary">
              {doctor.experience_years}+ years experience
            </p>
          )}
          {displayBio && (
            <p className="mt-2 text-sm text-text-secondary">
              {displayBio}
              {bio.length > 120 && !showFullBio && (
                <button
                  type="button"
                  onClick={() => setShowFullBio(true)}
                  className="ml-1 text-teal hover:underline"
                >
                  Read more
                </button>
              )}
            </p>
          )}
          {doctor.services && doctor.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {doctor.services.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-teal/20 px-2.5 py-0.5 text-xs text-teal"
                >
                  {s}
                </span>
              ))}
              {doctor.services.length > 4 && (
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-text-muted">
                  +{doctor.services.length - 4}
                </span>
              )}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-text-muted">
              {doctor.rating > 0 && (
                <span className="flex items-center gap-1">
                  ★ {doctor.rating}
                </span>
              )}
              {doctor.sessions_count > 0 && (
                <span>{doctor.sessions_count} sessions</span>
              )}
              {doctor.fee_per_min != null && (
                <span className="font-medium text-text-primary">
                  ₹{doctor.fee_per_min}/min
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSchedule(orgId)}
              className="rounded-full bg-teal px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal/90"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
