"use client";

import { motion } from "framer-motion";

export function B2BB2CSection() {
  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          className="mb-6 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Designed for individuals. Built for healthcare organizations.
        </motion.h2>
        <motion.p
          className="text-lg leading-relaxed text-text-secondary sm:text-xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Care360 AI operates on a dual model—empowering patients to monitor and understand their health, while enabling hospitals and clinics to manage care delivery, appointments, and clinical insights efficiently from one platform.
        </motion.p>
      </div>
    </section>
  );
}
