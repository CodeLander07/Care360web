"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextGradient } from "@/components/ui/text-gradient";
import { Button } from "@/components/ui/button";

export function HealthcareHero() {
  const [activeTab, setActiveTab] = useState<"summary" | "transcript">("summary");

  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden">
      {/* Soft star-like particles */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${(i * 7 + 13) % 100}%`,
              top: `${(i * 11 + 19) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.05,
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs for depth */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-teal/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left: Headline & subtext */}
        <div className="flex-1 space-y-6 text-left lg:max-w-2xl">
          <motion.h1
            className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            From real-time health signals to smarter care decisions.
           
          </motion.h1>
          
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button asChild variant="primary" size="lg">
              <Link href="/signup">Get started</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right: Mobile mockup - iPhone-style, medical-grade UI */}
        <motion.div
          className="relative flex-shrink-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Phone frame */}
          <div
            className="relative rounded-[2.75rem] p-2 animate-float"
            style={{
              background: "linear-gradient(145deg, #2c2c2e 0%, #1c1c1e 100%)",
              boxShadow:
                "0 2px 4px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Screen - white/light content area */}
            <div
              className="relative flex w-[264px] flex-col overflow-hidden rounded-[2.25rem] bg-white sm:w-[304px]"
              style={{ minHeight: "500px" }}
            >
              {/* Status bar / notch area */}
              <div className="flex h-12 items-center justify-between px-6 pt-3">
                <button
                  type="button"
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
                <div className="h-2 w-16 rounded-full bg-slate-200" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Sore throat
                </h2>
                {/* Segmented control */}
                <div className="mt-4 flex gap-0.5 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("summary")}
                    className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                      activeTab === "summary"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("transcript")}
                    className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                      activeTab === "transcript"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Transcript
                  </button>
                </div>
              </div>

              {/* Content area - card-based layout */}
              <div className="min-h-0 max-h-[260px] flex-1 space-y-2.5 overflow-y-auto px-5 pb-2">
                {activeTab === "summary" ? (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Patient summary
                      </p>
                      <p className="text-sm leading-relaxed text-slate-800">
                        Follow-up for hypertension. Patient reports improved
                        adherence to medication. BP 128/82.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Observations (O/E)
                      </p>
                      <ul className="space-y-1 text-sm leading-relaxed text-slate-800">
                        <li>• Occasional headaches reported</li>
                        <li>• No dizziness or fatigue</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Assessment
                      </p>
                      <p className="text-sm leading-relaxed text-slate-800">
                        Well-controlled hypertension.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Plan
                      </p>
                      <p className="text-sm leading-relaxed text-slate-800">
                        Continued on current regimen. Next visit in 3 months.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-sm">
                    <p className="leading-relaxed text-slate-700">
                      <span className="font-medium text-blue-600">Dr:</span> How
                      have you been feeling since we adjusted the dose?
                    </p>
                    <p className="leading-relaxed text-slate-700">
                      <span className="font-medium text-blue-600">Patient:</span>{" "}
                      Much better. Headaches are fewer now.
                    </p>
                    <p className="leading-relaxed text-slate-700">
                      <span className="font-medium text-blue-600">Dr:</span> Good
                      to hear. Any dizziness or fatigue?
                    </p>
                    <p className="leading-relaxed text-slate-700">
                      <span className="font-medium text-blue-600">Patient:</span>{" "}
                      No, nothing like that.
                    </p>
                  </div>
                )}
              </div>

              {/* Single CTA at bottom */}
              <div className="shrink-0 border-t border-slate-100 bg-white p-4">
                <button
                  type="button"
                  className="w-full rounded-full bg-blue-600 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
