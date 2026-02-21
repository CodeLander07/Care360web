"use client";

import { motion } from "framer-motion";

export function PrivacySection() {
  return (
    <section id="privacy" className="relative w-full overflow-hidden bg-navy py-24 sm:py-32">
      {/* Subtle floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/20"
            style={{
              left: `${(i * 13 + 7) % 100}%`,
              top: `${(i * 17 + 11) % 100}%`,
            }}
            animate={{
              opacity: [0.15, 0.35, 0.15],
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>

      {/* Blue and teal glow orbs */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -inset-32 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute -inset-24 rounded-full bg-teal/10 blur-2xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        {/* Lock icon with glowing outline */}
        <motion.div
          className="relative mx-auto mb-8 inline-flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Glow layers */}
          <div
            className="absolute inset-0 -m-8 rounded-full opacity-60 blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(13, 148, 136, 0.15) 50%, transparent 70%)",
            }}
          />
          <div
            className="absolute -m-4 rounded-full ring-2 ring-blue-500/30 ring-offset-4 ring-offset-navy blur-sm"
            style={{
              boxShadow:
                "0 0 40px rgba(59, 130, 246, 0.3), 0 0 80px rgba(13, 148, 136, 0.15)",
            }}
          />
          <div className="relative rounded-full bg-navy-light/80 p-6 backdrop-blur-sm sm:p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-16 w-16 text-teal sm:h-20 sm:w-20"
              aria-hidden
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                stroke="url(#privacy-lock-grad)"
              />
              <path
                d="M7 11V7a5 5 0 0 1 10 0v4"
                stroke="url(#privacy-lock-grad)"
              />
              <defs>
                <linearGradient
                  id="privacy-lock-grad"
                  x1="3"
                  y1="3"
                  x2="21"
                  y2="22"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#0d9488" />
                  <stop offset="0.6" stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="mb-6 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Patient privacy, uncompromised
        </motion.h2>

        {/* Supporting paragraph */}
        <motion.p
          className="text-base leading-relaxed text-text-secondary sm:text-lg"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          We never compromise on data security. Every conversation is encrypted
          end-to-end, with role-based access and audit trails built in. Designed
          for HIPAA compliance and healthcare-grade requirements from the ground
          up—so you can focus on care, not compliance.
        </motion.p>
      </div>
    </section>
  );
}
