import { useEffect, useState, useRef } from "react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import ImportValidationModal from "../../../shared/components/ImportValidationModal";
import { LoadingSpinner, EmptyState } from "../../../shared/components/Loading";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Upload, FileJson } from "lucide-react";
import ErrorBoundary from "../../../shared/components/ErrorBoundary";
import type { ServiceItem } from "../../../types/cms-types";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

export default function AdminServices() {
  const backend = useBackend();
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);

  const [form, setForm] = useState({
    slug: "",
    labelId: "",
    labelEn: "",
    labelAr: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    logger.load("services", "database/services table");
    try {
      const res = await backend.services.listAll();
      setServices(res.services);
      logger.loaded("services", "database", res.services.length);
    } catch (err: any) {
      logger.error("mengambil", "services", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setForm({ slug: "", labelId: "", labelEn: "", labelAr: "" });
    setIsFormOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service);
    setForm({
      slug: service.slug,
      labelId: service.labelId,
      labelEn: service.labelEn,
      labelAr: service.labelAr,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingService) {
        logger.update("service", "database/services table", { id: editingService.id, ...form });
        await backend.services.update({
          id: editingService.id,
          slug: form.slug,
          displayOrder: editingService.displayOrder,
          labelId: form.labelId,
          labelEn: form.labelEn,
          labelAr: form.labelAr,
          active: editingService.active,
        });
        logger.updated("service", "database/services table");
        toast({ title: "Service updated successfully" });
      } else {
        logger.save("service baru", "database/services table", form);
        await backend.services.create({
          slug: form.slug,
          displayOrder: services.length,
          labelId: form.labelId,
          labelEn: form.labelEn,
          labelAr: form.labelAr,
          active: true,
        });
        logger.saved("service baru", "database/services table");
        toast({ title: "Service created successfully" });
      }
      setIsFormOpen(false);
      await loadServices();
    } catch (err: any) {
      logger.error(editingService ? "update" : "menyimpan", "service", err);
      toast({
        title: "Failed to save",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    logger.delete("service", "database/services table", id);
    try {
      await backend.services.deleteService({ id });
      logger.deleted("service", "database/services table");
      toast({ title: "Service deleted successfully" });
      await loadServices();
    } catch (err: any) {
      logger.error("menghapus", "service", err);
      toast({
        title: "Failed to delete",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  const handleMove = async (id: number, direction: "up" | "down") => {
    const index = services.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === services.length - 1)
    ) {
      return;
    }

    const newServices = [...services];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newServices[index], newServices[targetIndex]] = [
      newServices[targetIndex],
      newServices[index],
    ];

    setServices(newServices);

    try {
      await Promise.all(
        newServices.map((service, i) =>
          backend.services.update({
            id: service.id,
            slug: service.slug,
            displayOrder: i,
            labelId: service.labelId,
            labelEn: service.labelEn,
            labelAr: service.labelAr,
            active: service.active,
          })
        )
      );
      toast({ title: "Order updated successfully" });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to update order",
        description: err?.message,
        variant: "destructive",
      });
      await loadServices();
    }
  };

  const handleExportJSON = async () => {
    logger.export("services", "file JSON");
    try {
      const res = await backend.services.exportJSON({});
      const json = JSON.stringify(res.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `services-export-${new Date().toISOString().split("T")[0]}.json`;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      logger.exported("services", res.data.length);
      console.log(`📁 File tersimpan sebagai: ${fileName}`);
      toast({ title: `Exported ${res.data.length} service(s) to JSON` });
    } catch (err: any) {
      logger.error("ekspor", "services", err);
      toast({
        title: "Export failed",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    logger.import("services", file.name);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        logger.error("import", "services", "Invalid JSON format: must be array");
        toast({
          title: "Invalid JSON format",
          description: "The JSON file must contain an array of services.",
          variant: "destructive",
        });
        return;
      }

      setImportData(data);
      setImportModalOpen(true);
    } catch (err: any) {
      logger.error("import", "services", err);
      toast({
        title: "Import failed",
        description: err?.message || "Failed to parse JSON file.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmImport = async (selectedItems: any[]) => {
    try {
      logger.action("Menyimpan imported services ke database...");
      const res = await backend.services.importJSON({ data: selectedItems });
      logger.imported("services ke database", res.imported);
      toast({ title: `Imported ${res.imported} service(s) successfully` });
      setImportModalOpen(false);
      setImportData([]);
      await loadServices();
    } catch (err: any) {
      logger.error("import", "services", err);
      toast({
        title: "Import failed",
        description: err?.message || "Failed to import services.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Services</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleImportJSON}>
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button size="sm" variant="ghost" onClick={handleExportJSON}>
              <FileJson className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4" />
              Add Service
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {services.length === 0 ? (
          <EmptyState
            title="No services yet"
            description="Create your first service"
            action={<Button onClick={handleCreate}>Create service</Button>}
          />
        ) : (
          <div className="bg-card border rounded-lg">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Order</th>
                  <th className="text-left p-4">Slug</th>
                  <th className="text-left p-4">Label (ID)</th>
                  <th className="text-left p-4">Label (EN)</th>
                  <th className="text-left p-4">Label (AR)</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={service.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMove(service.id, "up")}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(service.id, "down")}
                          disabled={index === services.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">{service.slug}</td>
                    <td className="p-4">{service.labelId}</td>
                    <td className="p-4">{service.labelEn}</td>
                    <td className="p-4">{service.labelAr}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          service.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(service)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(service.id)}
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
          title={editingService ? "Edit Service" : "Create Service"}
        >
          <div className="space-y-4">
            <Input
              label="Slug"
              value={form.slug}
              onChange={(value) => setForm({ ...form, slug: value })}
              required
            />
            <Input
              label="Label (Indonesian)"
              value={form.labelId}
              onChange={(value) => setForm({ ...form, labelId: value })}
              required
            />
            <Input
              label="Label (English)"
              value={form.labelEn}
              onChange={(value) => setForm({ ...form, labelEn: value })}
              required
            />
            <div dir="rtl">
              <Input
                label="Label (Arabic)"
                value={form.labelAr}
                onChange={(value) => setForm({ ...form, labelAr: value })}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                {editingService ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </Modal>

        <ImportValidationModal
          isOpen={importModalOpen}
          onClose={() => {
            setImportModalOpen(false);
            setImportData([]);
          }}
          onConfirm={handleConfirmImport}
          items={importData}
          entityType="service"
        />
      </div>
    </ErrorBoundary>
  );
}
