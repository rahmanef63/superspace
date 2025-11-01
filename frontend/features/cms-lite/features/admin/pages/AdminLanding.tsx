import { useEffect, useState } from "react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input, Textarea } from "../../../shared/components/Form";
import { ImageEditor } from "../../../shared/components/ImageEditor";
import { ErrorState } from "../../../shared/components/ErrorState";
import { SkeletonText, Skeleton } from "../../../shared/components/Skeleton";
import { Save } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from "../../../shared/utils/logger";

type Section = "hero" | "about";
type Locale = "id" | "en" | "ar";

interface HeroData {
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

interface AboutData {
  title: string;
  description: string;
  image: string;
}

type SectionData = HeroData | AboutData;

export default function AdminLanding() {
  const backend = useBackend();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);
  const [heroData, setHeroData] = useState<Record<Locale, HeroData>>({
    id: { title: "", description: "", image: "", ctaText: "", ctaLink: "" },
    en: { title: "", description: "", image: "", ctaText: "", ctaLink: "" },
    ar: { title: "", description: "", image: "", ctaText: "", ctaLink: "" },
  });
  const [aboutData, setAboutData] = useState<Record<Locale, AboutData>>({
    id: { title: "", description: "", image: "" },
    en: { title: "", description: "", image: "" },
    ar: { title: "", description: "", image: "" },
  });

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    setError(null);
    logger.load("landing page content", "database/landing_page_content table");
    try {
      const locales: Locale[] = ["id", "en", "ar"];
      const heroPromises = locales.map((locale) =>
        backend.landing.getContent({ section: "hero", locale })
      );
      const aboutPromises = locales.map((locale) =>
        backend.landing.getContent({ section: "about", locale })
      );

      const [heroResults, aboutResults] = await Promise.all([
        Promise.all(heroPromises),
        Promise.all(aboutPromises),
      ]);

      const newHeroData: Record<Locale, HeroData> = {} as any;
      const newAboutData: Record<Locale, AboutData> = {} as any;

      locales.forEach((locale, idx) => {
        newHeroData[locale] = heroResults[idx].content.data as HeroData;
        newAboutData[locale] = aboutResults[idx].content.data as AboutData;
      });

      setHeroData(newHeroData);
      setAboutData(newAboutData);
      logger.loaded("landing page content (hero + about)", "database", 6);
    } catch (err: any) {
      logger.error("mengambil", "landing page content", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    logger.save("landing page content (semua bahasa)", "database/landing_page_content table");
    try {
      const locales: Locale[] = ["id", "en", "ar"];
      const promises = locales.flatMap((locale) => [
        backend.landing.updateContent({
          section: "hero",
          locale,
          data: heroData[locale],
        }),
        backend.landing.updateContent({
          section: "about",
          locale,
          data: aboutData[locale],
        }),
      ]);

      await Promise.all(promises);
      logger.saved("landing page content", "database/landing_page_content table", "6 sections (3 languages x 2 sections)");
      await loadAllContent();
      toast({ title: "Landing page content updated successfully" });
    } catch (err: any) {
      logger.error("menyimpan", "landing page content", err);
      toast({
        title: "Failed to save",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentData = activeSection === "hero" 
    ? heroData[activeLocale] 
    : aboutData[activeLocale];

  const updateCurrentData = (updates: Partial<SectionData>) => {
    if (activeSection === "hero") {
      setHeroData({
        ...heroData,
        [activeLocale]: { ...heroData[activeLocale], ...updates } as HeroData,
      });
    } else {
      setAboutData({
        ...aboutData,
        [activeLocale]: { ...aboutData[activeLocale], ...updates } as AboutData,
      });
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Landing Page Content</h1>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <SkeletonText lines={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={loadAllContent} />;
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Landing Page Content</h1>
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4" />
            Save All Changes
          </Button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="w-48">
            <label className="block text-sm font-medium mb-2">Section</label>
            <Select value={activeSection} onValueChange={(value) => setActiveSection(value as Section)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">Hero</SelectItem>
                <SelectItem value="about">About</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium mb-2">Language</label>
            <Select value={activeLocale} onValueChange={(value) => setActiveLocale(value as Locale)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">ID (Indonesian)</SelectItem>
                <SelectItem value="en">EN (English)</SelectItem>
                <SelectItem value="ar">AR (Arabic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <Input
            label="Title"
            value={(currentData as any).title || ""}
            onChange={(value) => updateCurrentData({ title: value })}
            required
          />

          <Textarea
            label="Description"
            value={(currentData as any).description || ""}
            onChange={(value) => updateCurrentData({ description: value })}
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <ImageEditor
              value={(currentData as any).image || ""}
              onChange={(value) => updateCurrentData({ image: value })}
            />
          </div>

          {activeSection === "hero" && (
            <>
              <Input
                label="CTA Button Text"
                value={(currentData as HeroData).ctaText || ""}
                onChange={(value) => updateCurrentData({ ctaText: value })}
              />

              <Input
                label="CTA Button Link"
                value={(currentData as HeroData).ctaLink || ""}
                onChange={(value) => updateCurrentData({ ctaLink: value })}
                placeholder="/portfolio"
              />
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
