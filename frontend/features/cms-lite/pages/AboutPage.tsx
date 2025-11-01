"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import { useBackend } from "../shared/hooks/useBackend";
import { Skeleton } from "../shared/components/Skeleton";

export default function AboutPage() {
  const { locale } = useLanguage();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const backend = useBackend();    backend.landing.getContent({ section: "about", locale })
      .then((res) => setContent(res.content.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locale]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="space-y-8">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {content?.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={content.image} 
                      alt={content.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={!content?.image ? "md:col-span-2" : ""}>
                  <h1 className="text-4xl font-bold mb-6">{content?.title}</h1>
                  <p className="text-lg text-foreground/80 whitespace-pre-wrap">
                    {content?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


