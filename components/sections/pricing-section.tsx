"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    id: "free",
    title: "Free",
    price: "$0",
    period: "",
    description: "Try Care360 for free",
    buttonText: "Get Care360 for free",
    buttonHref: "/signup",
    variant: "outline" as const,
    features: ["25 Visits/month", "SOAP Template"],
  },
  {
    id: "starter",
    title: "Starter",
    price: "$49",
    period: "CAD/mo",
    description: "For part-time clinicians",
    buttonText: "Get Starter",
    buttonHref: "/signup?plan=starter",
    variant: "outline" as const,
    features: ["Everything in Free, plus:", "100 Visits/month"],
  },
  {
    id: "standard",
    title: "Standard",
    price: "$89",
    period: "CAD/mo",
    description: "For full-time clinicians",
    buttonText: "Get Standard",
    buttonHref: "/signup?plan=standard",
    variant: "primary" as const,
    recommended: true,
    features: [
      "Everything in Starter, plus:",
      "Unlimited Visits",
      "Translate Visits",
      "Extended support",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "Custom",
    period: "",
    description: "For healthcare teams",
    buttonText: "Get in touch",
    buttonHref: "/contact",
    variant: "outline" as const,
    features: [
      "Everything in Standard, plus:",
      "Group Signup Discount",
      "Custom note templates",
      "Custom Integrations",
    ],
  },
];

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-emerald-400"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-navy py-24 sm:py-32"
    >
      {/* Ambient glow - top right */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.span
            className="mb-4 inline-block rounded-md bg-emerald-400/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Get Access
          </motion.span>
          <motion.h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            Explore Our Pricing Plans
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative flex flex-col rounded-2xl border bg-navy-light/80 p-6 ${
                plan.recommended
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/30"
                  : "border-white/10"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white">{plan.title}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-slate-400">{plan.period}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

              <Link
                href={plan.buttonHref}
                className={`mt-6 inline-flex items-center justify-center rounded-lg py-3 text-sm font-medium transition-colors ${
                  plan.variant === "primary"
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border border-white/20 text-white hover:border-white/40"
                }`}
              >
                {plan.buttonText}
                <span className="ml-1">→</span>
              </Link>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature, j) => {
                  const isSubheader = feature.endsWith("plus:");
                  return (
                    <li
                      key={j}
                      className={`flex items-start gap-2 text-sm ${
                        isSubheader ? "text-slate-500" : "text-slate-300"
                      }`}
                    >
                      {isSubheader ? (
                        <span className="w-4 shrink-0" aria-hidden />
                      ) : (
                        <CheckIcon />
                      )}
                      <span>{feature}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
