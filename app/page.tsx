import { HealthcareHero } from "@/components/hero/healthcare-hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PrivacySection } from "@/components/sections/privacy-section";
import { PrivacyGuarantees } from "@/components/sections/privacy-guarantees";
import { PlatformCapabilities } from "@/components/sections/platform-capabilities";
import { B2BB2CSection } from "@/components/sections/b2b-b2c-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { ClosingSection } from "@/components/sections/closing-section";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { NavbarAuthButtons } from "@/components/layout/navbar-auth-buttons";

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
      <PlatformCapabilities />
      <B2BB2CSection />
      <PricingSection />
      <ClosingSection />
      <Footer />
    </>
  );
}
