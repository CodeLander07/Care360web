"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#privacy", label: "Privacy" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: "#resources", label: "Resources" },
];

export function Navbar({ children }: { children?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background:
          "linear-gradient(180deg, rgba(8, 20, 28, 0.98) 0%, rgba(15, 36, 53, 0.95) 100%)",
      }}
    >
      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"/>

      <nav
        className="relative mx-auto flex h-16 items-center justify-between px-6 lg:h-16 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <Image
            src="/weblogo.png"
            alt="Care360"
            width={200}
            height={64}
            className="h-12 w-auto sm:h-14"
            priority
          />
        </Link>

        {/* Center: Nav links (desktop) */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary tracking-wide transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Auth buttons + mobile menu */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 lg:flex">{children}</div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {mobileMenuOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 12h16" />
                  <path d="M4 6h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/[0.06] bg-navy/98 lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-3 lg:hidden"
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
