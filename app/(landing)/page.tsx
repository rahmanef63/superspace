import HeroSection from "../../components/route-group/marketing/hero-section";
import FeaturesOne from "../../components/route-group/marketing/features-one";
import Testimonials from "../../components/route-group/marketing/testimonials";
import CallToAction from "../../components/route-group/marketing/call-to-action";
import FAQs from "../../components/route-group/marketing/faqs";
import Footer from "../../components/route-group/marketing/footer";
import CustomClerkPricing from "@/components/custom-clerk-pricing";
import { AuthRedirect } from "../../components/route-group/marketing/AuthRedirect";

export default function Home() {
  return (
    <div>
      <AuthRedirect />
      <HeroSection />
      <FeaturesOne />
      <section className="bg-muted/50 py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 mx-auto max-w-2xl space-y-6 text-center">
              <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
              <p>Gemini is evolving to be more than just the models. It supports an entire to the APIs and platforms helping developers and businesses innovate.</p>
          </div>
          <CustomClerkPricing />
        </div>
      </section>
      <Testimonials />
      <CallToAction />
      <FAQs />
      <Footer />
    </div>
  );
}
