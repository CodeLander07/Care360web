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
    title: "Smart Vital Monitoring",
    description:
      "Detect key health indicators such as blood pressure and oxygen levels using advanced photoplethysmography—accessible, non-invasive, and real-time.",
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
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    title: "Predictive & Trend Analysis",
    description:
      "Identify patterns, anomalies, and early warning signs from continuous data to support preventive and proactive care.",
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
    title: "Secure & Always-On Support",
    description:
      "Get 24/7 AI-powered assistance, SOS support during critical moments, and automated reminders for appointments and follow-ups.",
  },
];

export function PrivacyGuarantees() {
  return (
    <section className="relative w-full overflow-hidden py-20 sm:py-28">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
            Built for trust, safety, and real outcomes
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            Our platform is designed to securely process health data while delivering meaningful insights across personal and clinical use cases. From early risk detection to continuous monitoring and care coordination, Care360 AI supports healthcare at every stage.
          </p>
        </motion.div>
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
