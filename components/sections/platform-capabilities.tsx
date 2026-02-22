"use client";

import { motion } from "framer-motion";

const capabilities = [
  "Clinical review and patient management",
  "Hospital and clinic operations management",
  "Online and in-person appointment scheduling",
  "Custom health data input and tracking",
  "Automated reminders and follow-ups",
  "Emergency SOS access when it matters most",
];

export function PlatformCapabilities() {
  return (
    <section
      id="platform"
      className="relative w-full overflow-hidden py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          className="mb-10 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          One platform. Multiple healthcare needs.
        </motion.h2>
        <motion.p
          className="mb-12 text-lg leading-relaxed text-text-secondary sm:text-xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Care360 AI supports both individuals and healthcare organizations through a single, scalable system:
        </motion.p>
        <ul className="mx-auto grid max-w-2xl gap-3 text-left sm:grid-cols-2">
          {capabilities.map((item, i) => (
            <motion.li
              key={item}
              className="flex items-center gap-3 text-text-secondary"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
