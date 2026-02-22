"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppointmentStatusActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();

  const updateStatus = async (newStatus: "confirmed" | "cancelled") => {
    const supabase = createClient();
    await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    router.refresh();
  };

  if (status === "cancelled" || status === "completed") return null;

  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <button
          type="button"
          onClick={() => updateStatus("confirmed")}
          className="rounded-lg bg-teal/20 px-3 py-1.5 text-xs font-medium text-teal transition-colors hover:bg-teal/30"
        >
          Confirm
        </button>
      )}
      <button
        type="button"
        onClick={() => updateStatus("cancelled")}
        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-white/20"
      >
        Cancel
      </button>
    </div>
  );
}
