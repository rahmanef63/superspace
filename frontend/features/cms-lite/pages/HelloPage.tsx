"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useBackend } from "../shared/hooks/useBackend";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function HelloPage() {
  const [quicklinks, setQuicklinks] = useState<Quicklink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backend = useBackend();    backend.quicklinks.list()
      .then((res) => setQuicklinks(res.quicklinks))
      .catch((err) => console.error("Failed to load quicklinks:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/10">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Quick Links
            </h1>
            <p className="text-foreground/70 text-lg sm:text-xl">
              Access your favorite resources quickly
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : quicklinks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60 text-lg">No quicklinks available</p>
              <p className="text-foreground/40 text-sm mt-2">
                Add quicklinks from the admin panel
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quicklinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden bg-card hover:bg-accent/50 border border-border rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-foreground/60 truncate">
                        {link.url.startsWith('http') ? new URL(link.url).hostname : link.url}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


