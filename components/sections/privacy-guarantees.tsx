"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";

const guarantees = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-teal"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v3" />
        <path d="M9 22h6" />
      </svg>
    ),
    title: "Audio is not permanently stored",
    description:
      "Conversations are processed in real time and discarded after documentation is generated. Nothing is retained on our servers.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-teal"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    title: "Data not used to train AI models",
    description:
      "Your patient data is never used to train or improve our AI. Models are locked; your data stays yours.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-teal"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    title: "No patient information required to begin",
    description:
      "Start capturing and documenting immediately. No lengthy onboarding, no PII uploads—just begin the conversation.",
  },
];

export function PrivacyGuarantees() {
  return (
    <section className="relative w-full overflow-hidden bg-navy py-20 sm:py-28">
      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guarantees.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard
                className="flex h-full flex-col p-6 sm:p-8"
                delay={i * 0.05}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
                  {item.icon}
                </div>
                <h3 className="mb-3 font-semibold text-text-primary sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  {item.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
