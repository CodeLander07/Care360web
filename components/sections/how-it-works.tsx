"use client";

import { motion } from "framer-motion";
import { AmbientWaves } from "@/components/ui/ambient-waves";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden bg-navy py-28 sm:py-36"
    >
      {/* Layer 1: Base - very dark navy / near-black */}
      <div
        className="pointer-events-none absolute inset-0"
       
      />

      {/* Layer 2: Ambient wave arcs - depth and focal point */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <AmbientWaves />
      </div>

      {/* Layer 3: Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {/* Section label - pill shape */}
        <motion.span
          className="mb-6 inline-block rounded-full bg-emerald-300/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900"
          style={{
            boxShadow: "0 0 24px rgba(52, 211, 153, 0.2)",
          }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.span>

        {/* Main heading - larger, high contrast */}
        <motion.h2
          className="mb-10 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          The conversation flows. The AI listens.
        </motion.h2>

        {/* Supporting paragraph - lower contrast, more spacing */}
        <motion.p
          className="text-lg leading-relaxed text-slate-400 sm:text-xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ambient intelligence runs in the background—capturing context,
          extracting clinical details, and structuring documentation without
          interrupting the visit. No prompts, no commands. Just the natural
          rhythm of care.
        </motion.p>
      </div>
    </section>
  );
}
