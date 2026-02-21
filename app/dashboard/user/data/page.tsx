import { GlassCard } from "@/components/ui/glass-card";

export default function UserDataPage() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">My Data</h1>
      <GlassCard className="p-8">
        <p className="text-text-secondary">Your collected health data will appear here.</p>
      </GlassCard>
    </div>
  );
}
