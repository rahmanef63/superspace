import { useEffect, useState } from "react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input, Select } from "../../../shared/components/Form";
import { Save, Download, Upload } from "lucide-react";
import type { Settings } from "../../../types/cms-types";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { createFileInput, importFromJSON } from "../../../shared/utils/exportImport";
import { ImageUrlInput } from "../../../shared/components/ImageUrlInput";
import { logger } from "../../../shared/utils/logger";
import { ColorPickerSimple } from "@/components/ui/shadcn-io/color-picker/ColorPickerSimple";

export default function AdminSettings() {
  const backend = useBackend();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState({
    brandName: "Your Brand",
    defaultLocale: "id",
    heroImage: "",
    phone: "",
    email: "",
    instagram: "",
    whatsapp: "",
    logoUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    logger.load("settings", "database");
    backend.settings.get()
      .then((res: any) => {
        if (res.settings && typeof res.settings === 'object' && Object.keys(res.settings).length > 0) {
          logger.loaded("settings", "database");
          setSettings(res.settings as Settings);
          setForm({
            brandName: res.settings.brandName || "Your Brand",
            defaultLocale: res.settings.defaultLocale || "id",
            heroImage: res.settings.heroImage || "",
            phone: res.settings.phone || "",
            email: res.settings.email || "",
            instagram: res.settings.instagram || "",
            whatsapp: res.settings.whatsapp || "",
            logoUrl: res.settings.logoUrl || "",
            primaryColor: res.settings.primaryColor || "#3b82f6",
            secondaryColor: res.settings.secondaryColor || "#8b5cf6",
          });
        }
      })
      .catch((err) => {
        logger.error("mengambil", "settings", err);
      })
      .finally(() => setLoading(false));
  }, [backend]);

  const handleSave = async () => {
    setSaving(true);
    logger.save("settings", "database/settings table", form);
    try {
      await backend.settings.update(form);
      logger.saved("settings", "database/settings table");
      toast({ title: "Settings saved successfully" });
    } catch (err: any) {
      logger.error("menyimpan", "settings", err);
      toast({
        title: "Failed to save settings",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    logger.export("semua data", "file JSON");
    try {
      const result = await backend.settings.exportAll();
      const jsonString = JSON.stringify(result, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `full-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      logger.exported("semua data");
      toast({ title: "Data exported successfully" });
    } catch (err: any) {
      logger.error("ekspor", "data", err);
      toast({
        title: "Failed to export data",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportAll = () => {
    createFileInput("application/json", async (file) => {
      setImporting(true);
      logger.import("data", file.name);
      try {
        const result = await importFromJSON<any>(file);
        if (!result.success || !result.data) {
          logger.error("import", "data", result.error || "Invalid file format");
          toast({
            title: "Failed to import data",
            description: result.error || "Invalid file format",
            variant: "destructive",
          });
          return;
        }

        const importData = result.data as any;
        logger.action("Menyimpan data import ke database...");
        const response = await backend.settings.importAll({
          data: importData.data || importData,
        });

        const importedItems = Object.entries(response.imported)
          .filter(([_, count]) => (typeof count === 'number' && count > 0) || count === true)
          .map(([key, count]) => `${key}: ${count}`);
        
        logger.imported("data ke database");
        
        toast({
          title: "Data imported successfully",
          description: `Imported: ${importedItems.join(", ")}`,
        });

        logger.action("Reload halaman untuk menampilkan data baru...");
        window.location.reload();
      } catch (err: any) {
        logger.error("import", "data", err);
        toast({
          title: "Failed to import data",
          description: err?.message || "An error occurred.",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportAll} disabled={exporting} variant="secondary">
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export All Data"}
          </Button>
          <Button onClick={handleImportAll} disabled={importing} variant="secondary">
            <Upload className="w-4 h-4" />
            {importing ? "Importing..." : "Import All Data"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">Branding</h2>
          
          <Input
            label="Brand Name"
            value={form.brandName}
            onChange={(value) => setForm({ ...form, brandName: value })}
            placeholder="Your Brand Name"
          />

          <ImageUrlInput
            label="Logo URL"
            value={form.logoUrl}
            onChange={(value) => setForm({ ...form, logoUrl: value })}
            placeholder="https://example.com/logo.png"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <ColorPickerSimple
                value={form.primaryColor}
                onChange={(color) => setForm({ ...form, primaryColor: color })}
                placeholder="#3b82f6"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Used for: Buttons, Links, Active states, Hero CTA
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Secondary Color</label>
              <ColorPickerSimple
                value={form.secondaryColor}
                onChange={(color) => setForm({ ...form, secondaryColor: color })}
                placeholder="#8b5cf6"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Used for: Service icons, Feature highlights, Accents
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-3">Color Preview:</p>
            <div className="flex gap-3 flex-wrap">
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: form.primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: form.secondaryColor }}
              >
                Secondary Button
              </button>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{ backgroundColor: form.primaryColor }}
                />
                <span className="text-sm">Primary Icon</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{ backgroundColor: form.secondaryColor }}
                />
                <span className="text-sm">Secondary Icon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">General Settings</h2>
          
          <Select
            label="Default Language"
            value={form.defaultLocale}
            onChange={(value) => setForm({ ...form, defaultLocale: value })}
            options={[
              { value: "id", label: "Indonesian" },
              { value: "en", label: "English" },
              { value: "ar", label: "Arabic" },
            ]}
          />

          <ImageUrlInput
            label="Hero Image URL"
            value={form.heroImage}
            onChange={(value) => setForm({ ...form, heroImage: value })}
            placeholder="https://example.com/hero.jpg"
          />
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
              placeholder="+1 234 567 8900"
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              placeholder="contact@example.com"
            />

            <Input
              label="Instagram"
              value={form.instagram}
              onChange={(value) => setForm({ ...form, instagram: value })}
              placeholder="@yourbrand"
            />

            <Input
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(value) => setForm({ ...form, whatsapp: value })}
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}
