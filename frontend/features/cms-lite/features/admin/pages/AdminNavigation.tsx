import { useEffect, useState } from "react";
import { useBackend } from "../../../shared/hooks/useBackend";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Form";
import { Modal } from "../../../shared/components/Modal";
import type { NavigationItem } from "../../../types/cms-types";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "../../../shared/utils/logger";

export default function AdminNavigation() {
  const backend = useBackend();
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    labelId: "",
    labelEn: "",
    labelAr: "",
    path: "",
    displayOrder: 0,
    parentId: null as number | null,
    isExternal: false,
    active: true,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    logger.load("navigation items", "database/navigation_menu table");
    try {
      const res = await backend.navigation.listAll();
      setItems(res.items);
      logger.loaded("navigation items", "database", res.items.length);
    } catch (err: any) {
      logger.error("mengambil", "navigation items", err);
      toast({
        title: "Failed to load navigation items",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: NavigationItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        labelId: item.labelId,
        labelEn: item.labelEn,
        labelAr: item.labelAr,
        path: item.path,
        displayOrder: item.displayOrder,
        parentId: item.parentId,
        isExternal: item.isExternal,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        labelId: "",
        labelEn: "",
        labelAr: "",
        path: "",
        displayOrder: items.length,
        parentId: null,
        isExternal: false,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        logger.update("navigation item", "database/navigation_menu table", { id: editingItem.id, ...formData });
        await backend.navigation.update({
          id: editingItem.id,
          ...formData,
        });
        logger.updated("navigation item", "database/navigation_menu table");
        toast({ title: "Navigation item updated successfully" });
      } else {
        logger.save("navigation item baru", "database/navigation_menu table", formData);
        await backend.navigation.create(formData);
        logger.saved("navigation item baru", "database/navigation_menu table");
        toast({ title: "Navigation item created successfully" });
      }
      setIsModalOpen(false);
      loadItems();
    } catch (err: any) {
      logger.error(editingItem ? "update" : "menyimpan", "navigation item", err);
      toast({
        title: "Failed to save",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this navigation item?")) return;
    
    logger.delete("navigation item", "database/navigation_menu table", id);
    try {
      await backend.navigation.deleteNavigation({ id });
      logger.deleted("navigation item", "database/navigation_menu table");
      toast({ title: "Navigation item deleted successfully" });
      loadItems();
    } catch (err: any) {
      logger.error("menghapus", "navigation item", err);
      toast({
        title: "Failed to delete",
        description: err?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Navigation Menu</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" />
          Add Navigation Item
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4">Labels</th>
                <th className="text-left p-4">Path</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Parent</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-foreground/60">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-foreground/60">
                    No navigation items
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-foreground/40" />
                        <span>{item.displayOrder}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div><span className="text-xs text-foreground/60">ID:</span> {item.labelId}</div>
                        <div><span className="text-xs text-foreground/60">EN:</span> {item.labelEn}</div>
                        <div><span className="text-xs text-foreground/60">AR:</span> {item.labelAr}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{item.path}</code>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${item.isExternal ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}`}>
                        {item.isExternal ? "External" : "Internal"}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.parentId ? (
                        <span className="text-sm text-foreground/60">
                          {items.find(i => i.id === item.parentId)?.labelEn || `#${item.parentId}`}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/40">Top Level</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${item.active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Navigation Item" : "Add Navigation Item"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Label (ID)"
              value={formData.labelId}
              onChange={(value) => setFormData({ ...formData, labelId: value })}
              required
            />
            <Input
              label="Label (EN)"
              value={formData.labelEn}
              onChange={(value) => setFormData({ ...formData, labelEn: value })}
              required
            />
            <Input
              label="Label (AR)"
              value={formData.labelAr}
              onChange={(value) => setFormData({ ...formData, labelAr: value })}
              required
            />
          </div>

          <Input
            label="Path"
            value={formData.path}
            onChange={(value) => setFormData({ ...formData, path: value })}
            placeholder="/about"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Order"
              type="number"
              value={String(formData.displayOrder)}
              onChange={(value) => setFormData({ ...formData, displayOrder: parseInt(value) || 0 })}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Parent Item</label>
              <select
                value={formData.parentId || ""}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">None (Top Level)</option>
                {items.filter(item => !item.parentId && item.id !== editingItem?.id).map(item => (
                  <option key={item.id} value={item.id}>{item.labelEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isExternal}
                onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">External Link</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
