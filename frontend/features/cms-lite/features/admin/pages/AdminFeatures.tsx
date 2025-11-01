import { useEffect, useState } from "react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input, Textarea, Select } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Loading";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

// Placeholder type until backend is integrated
interface Feature {
  id: number;
  locale: string;
  icon: string;
  title: string;
  description: string;
  serviceId?: number;
  order: number;
  displayOrder?: number;
  active: boolean;
}

export default function AdminFeatures() {
  const backend = useBackend();
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  const [form, setForm] = useState({
    locale: "id",
    icon: "Camera",
    title: "",
    description: "",
    serviceId: undefined as number | undefined,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    logger.load("features & services", "database/features & services tables");
    try {
      const [featuresRes, servicesRes] = await Promise.all([
        (backend as any).features.listAll(),
        (backend as any).services.listAll(),
      ]);
      setFeatures(featuresRes.features);
      setServices(servicesRes.services);
      logger.loaded("features", "database", featuresRes.features.length);
      logger.loaded("services", "database", servicesRes.services.length);
    } catch (err: any) {
      logger.error("mengambil", "features", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFeature(null);
    setForm({ locale: "id", icon: "Camera", title: "", description: "", serviceId: undefined });
    setIsFormOpen(true);
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setForm({
      locale: feature.locale,
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
      serviceId: feature.serviceId,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingFeature) {
        logger.update("feature", "database/features table", { id: editingFeature.id, ...form });
        await backend.features.update({
          id: editingFeature.id,
          ...form,
        });
        logger.updated("feature", "database/features table");
        toast({ title: "Feature updated successfully" });
      } else {
        logger.save("feature baru", "database/features table", form);
        await backend.features.create(form);
        logger.saved("feature baru", "database/features table");
        toast({ title: "Feature created successfully" });
      }
      setIsFormOpen(false);
      await loadFeatures();
    } catch (err: any) {
      logger.error(editingFeature ? "update" : "menyimpan", "feature", err);
      toast({
        title: "Failed to save feature",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feature?")) return;

    logger.delete("feature", "database/features table", id);
    try {
      await backend.features.deleteFeature({ id });
      logger.deleted("feature", "database/features table");
      toast({ title: "Feature deleted successfully" });
      await loadFeatures();
    } catch (err: any) {
      logger.error("menghapus", "feature", err);
      toast({
        title: "Failed to delete feature",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (feature: Feature) => {
    logger.update("feature status", "database/features table", { id: feature.id, active: !feature.active });
    try {
      await backend.features.update({
        id: feature.id,
        active: !feature.active,
      });
      logger.updated("feature status", "database/features table");
      toast({ title: "Feature status updated successfully" });
      await loadFeatures();
    } catch (err: any) {
      logger.error("update status", "feature", err);
      toast({
        title: "Failed to update feature",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleMoveFeature = async (feature: Feature, direction: "up" | "down") => {
    const currentIndex = features.findIndex((f) => f.id === feature.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= features.length) return;

    const otherFeature = features[newIndex];
    
    try {
      await Promise.all([
        backend.features.update({
          id: feature.id,
          displayOrder: otherFeature.displayOrder,
        }),
        backend.features.update({
          id: otherFeature.id,
          displayOrder: feature.displayOrder,
        }),
      ]);
      toast({ title: "Features reordered successfully" });
      await loadFeatures();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to reorder features",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Features</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Feature
        </Button>
      </div>

      {features.length === 0 ? (
        <EmptyState
          title="No features yet"
          description="Add features to showcase on your landing page"
          action={
            <Button onClick={handleCreate}>
              Create your first feature
            </Button>
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Feature</th>
                <th className="text-left p-4">Icon</th>
                <th className="text-left p-4">Language</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Order</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={feature.id} className="border-t hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-foreground/60 line-clamp-1">{feature.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-muted rounded text-xs">{feature.icon}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {feature.locale.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(feature)}
                      className={`px-2 py-1 rounded text-xs ${
                        feature.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {feature.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveFeature(feature, "up")}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveFeature(feature, "down")}
                        disabled={index === features.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(feature)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(feature.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingFeature ? "Edit Feature" : "Create Feature"}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Language"
            value={form.locale}
            onChange={(value) => setForm({ ...form, locale: value })}
            options={[
              { value: "id", label: "Indonesian" },
              { value: "en", label: "English" },
              { value: "ar", label: "Arabic" },
            ]}
          />

          <Select
            label="Icon"
            value={form.icon}
            onChange={(value) => setForm({ ...form, icon: value })}
            options={[
              { value: "Camera", label: "Camera" },
              { value: "Award", label: "Award" },
              { value: "Clock", label: "Clock" },
              { value: "Star", label: "Star" },
            ]}
          />

          <Input
            label="Title"
            value={form.title}
            onChange={(value) => setForm({ ...form, title: value })}
            required
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(value) => setForm({ ...form, description: value })}
            rows={3}
            required
          />

          <Select
            label="Linked Service (Optional)"
            value={form.serviceId ? String(form.serviceId) : ""}
            onChange={(value) => setForm({ ...form, serviceId: value ? Number(value) : undefined })}
            options={[
              { value: "", label: "None (Standalone)" },
              ...services.map((service) => ({
                value: String(service.id),
                label: service.labelId || service.labelEn,
              })),
            ]}
          />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Feature"}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </ErrorBoundary>
  );
}
