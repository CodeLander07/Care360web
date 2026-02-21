"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-navy">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 sm:flex-row sm:gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-semibold tracking-tight text-text-muted transition-colors hover:text-text-secondary"
        >
          Care360
        </Link>

        {/* Links */}
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-text-muted"
          aria-label="Footer navigation"
        >
          <span className="hidden text-white/20 sm:inline" aria-hidden>
            |
          </span>
          <Link
            href="/privacy"
            className="transition-colors hover:text-text-secondary"
          >
            Privacy Policy
          </Link>
          <span className="text-white/20" aria-hidden>
            |
          </span>
          <Link
            href="/terms"
            className="transition-colors hover:text-text-secondary"
          >
            Terms
          </Link>
          <span className="text-white/20" aria-hidden>
            |
          </span>
          <Link
            href="/contact"
            className="transition-colors hover:text-text-secondary"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
