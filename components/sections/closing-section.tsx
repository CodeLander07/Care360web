"use client";

import { motion } from "framer-motion";

export function ClosingSection() {
  return (
    <section className="relative w-full overflow-hidden px-6 py-24 sm:py-32">
      {/* Soft blue-green gradient orbs for lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[120px]"
          style={{
            width: "min(80vw, 800px)",
            height: "min(60vh, 400px)",
            background:
              "radial-gradient(ellipse, rgba(59, 130, 246, 0.12) 0%, rgba(13, 148, 136, 0.08) 40%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] px-8 py-16 backdrop-blur-xl sm:px-16 sm:py-20"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 36, 53, 0.6) 0%, rgba(26, 51, 71, 0.5) 50%, rgba(15, 36, 53, 0.6) 100%)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(59, 130, 246, 0.06), 0 0 120px rgba(13, 148, 136, 0.04)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.p
            className="text-center text-2xl font-medium leading-snug text-text-primary sm:text-3xl md:text-4xl lg:text-[2.5rem]"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Smarter signals. Better decisions. Connected care.
            <br />
            <span className="text-text-secondary">
              Care360 AI brings together health monitoring, intelligence, and healthcare management—so care never stops, and insight never fades.
            </span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
