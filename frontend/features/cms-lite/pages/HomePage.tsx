"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from "../components/Chatbot";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useBackend } from "../shared/hooks/useBackend";

interface Product {
  id: number;
  slug: string;
  titleId: string;
  titleEn: string;
  titleAr: string;
  descId?: string;
  descEn?: string;
  descAr?: string;
  price: number;
  currency: string;
  coverImage?: string;
  status: string;
}

interface ServiceItem {
  id: number;
  slug: string;
  titleId: string;
  titleEn: string;
  titleAr: string;
  labelId?: string;
  labelEn?: string;
  labelAr?: string;
}

interface Feature {
  id: number;
  titleId: string;
  titleEn: string;
  titleAr: string;
  title?: string;
  description?: string;
  icon?: string;
  active: boolean;
}

import { Camera, Users, Coffee, MessageSquare, Award, Clock, Star, Plus, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { addToCart } = useCart();
  const { convertPrice, formatCurrency } = useCurrency();
  const backend = useBackend();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [heroContent, setHeroContent] = useState<any>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);

  useEffect(() => {
    backend.products.list().then((res: any) => setProducts(res.products.slice(0, 3)));
    backend.services.list().then((res: any) => setServices(res.services));
    backend.features.list({ locale }).then((res: any) => setFeatures(res.features));
    backend.landing.getContent({ section: "hero", locale }).then((res: any) => setHeroContent(res.content.data));
    backend.landing.getContent({ section: "about", locale }).then((res: any) => setAboutContent(res.content.data));
  }, [locale, backend]);

  const getServiceIcon = (slug: string) => {
    switch (slug) {
      case "private-photoshoot": return <Camera className="w-8 h-8" />;
      case "group-travel": return <Users className="w-8 h-8" />;
      case "food-beverages": return <Coffee className="w-8 h-8" />;
      case "based-on-request": return <MessageSquare className="w-8 h-8" />;
      default: return <Camera className="w-8 h-8" />;
    }
  };

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case "Camera": return <Camera className="w-12 h-12" />;
      case "Award": return <Award className="w-12 h-12" />;
      case "Clock": return <Clock className="w-12 h-12" />;
      case "Star": return <Star className="w-12 h-12" />;
      default: return <Star className="w-12 h-12" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-muted/50 to-background py-20 md:py-32 relative overflow-hidden">
          {heroContent?.image && (
            <div className="absolute inset-0 opacity-20">
              <img src={heroContent.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {heroContent?.title || "Saudi Visuals"}
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
              {heroContent?.description || t("tagline")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={heroContent?.ctaLink || "/products"}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {heroContent?.ctaText || t("products")}
              </Link>
              <Link
                href="/portfolio"
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                {t("viewPortfolio")}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">{t("services")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <div key={service.id} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                  <div className="mb-4 text-secondary">
                    {getServiceIcon(service.slug)}
                  </div>
                  <h3 className="font-semibold text-lg">
                    {locale === "id" ? service.labelId : locale === "en" ? service.labelEn : service.labelAr}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {aboutContent && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {aboutContent.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img src={aboutContent.image} alt={aboutContent.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold mb-6">{aboutContent.title}</h2>
                  <p className="text-lg text-foreground/80 mb-6">{aboutContent.description}</p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t("learnMore")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {features.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold mb-12 text-center">{t("features") || "Features"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature) => (
                  <div key={feature.id} className="p-6 bg-background border rounded-lg text-center">
                    <div className="mb-4 text-secondary flex justify-center">
                      {getFeatureIcon(feature.icon || '')}
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{feature.title || (locale === "id" ? feature.titleId : locale === "en" ? feature.titleEn : feature.titleAr)}</h3>
                    <p className="text-foreground/70">{feature.description || ''}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">{t("products")}</h2>
              <Link href="/products" className="text-primary hover:underline">
                {t("viewPortfolio")} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-background"
                >
                  {product.coverImage && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={product.coverImage}
                        alt={locale === "id" ? product.titleId : locale === "en" ? product.titleEn : product.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {locale === "id" ? product.titleId : locale === "en" ? product.titleEn : product.titleAr}
                    </h3>
                    <p className="text-foreground/70 mb-4 line-clamp-2">
                      {locale === "id" ? product.descId : locale === "en" ? product.descEn : product.descAr}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">
                        {formatCurrency(convertPrice(product.price, product.currency))}
                      </span>
                      <span className="text-primary group-hover:underline">
                        {t("readMore")} →
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(String(product.id));
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t("addToCart")}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

