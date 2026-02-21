import React from "react";
import { HealthcareHero } from "@/components/hero/healthcare-hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PrivacySection } from "@/components/sections/privacy-section";
import { PrivacyGuarantees } from "@/components/sections/privacy-guarantees";
import { PricingSection } from "@/components/sections/pricing-section";
import { ClosingSection } from "@/components/sections/closing-section";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { NavbarAuthButtons } from "@/components/layout/navbar-auth-buttons";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { TextGradient } from "@/components/ui/text-gradient";
import { AreaChart } from "@/components/ui/area-chart";
import { ChatWidget } from "@/components/ai/chat-widget";
import { ScanLine } from "@/components/ui/scan-line";

const chartData = [
  { name: "Mon", value: 72 },
  { name: "Tue", value: 68 },
  { name: "Wed", value: 75 },
  { name: "Thu", value: 80 },
  { name: "Fri", value: 78 },
  { name: "Sat", value: 82 },
  { name: "Sun", value: 76 },
];

export default function Page() {
  return (
    <>
      <Navbar>
        <NavbarAuthButtons />
      </Navbar>
      <HealthcareHero />
      <HowItWorks />
      <PrivacySection />
      <PrivacyGuarantees />
      <PricingSection />
      <ClosingSection />
      <Footer />
    </>
  );
}
