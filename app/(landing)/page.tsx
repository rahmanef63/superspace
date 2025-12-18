import HeroSection from "../../components/route-group/marketing/hero-section";
import FeaturesOne from "../../components/route-group/marketing/features-one";
import Testimonials from "../../components/route-group/marketing/testimonials";
import CallToAction from "../../components/route-group/marketing/call-to-action";
import FAQs from "../../components/route-group/marketing/faqs";
import Footer from "../../components/route-group/marketing/footer";
import CustomClerkPricing from "@/components/custom-clerk-pricing";

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-16">
        <HeroSection />
        <FeaturesOne />
        <section className="bg-muted/50 py-16 md:py-24 -mx-4 px-4 rounded-lg">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-semibold lg:text-4xl">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">Choose the plan that fits your needs. No hidden fees, no surprises.</p>
            </div>
            <CustomClerkPricing />
          </div>
        </section>
        <Testimonials />
        <CallToAction />
        <FAQs />
        <Footer />
      </div>
    </div>
  );
}
