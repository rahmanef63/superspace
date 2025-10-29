import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X } from "lucide-react";
import { IconPicker } from "@/frontend/shared/ui/components/icons";

interface MenuItemFormProps {
  workspaceId: Id<"workspaces">;
  parentId?: Id<"menuItems">;
  editingItemId?: Id<"menuItems">;
  onSave: () => void;
  onCancel: () => void;
}

const MENU_ITEM_TYPES = [
  { value: 'folder', label: 'Folder' },
  { value: 'route', label: 'Route' },
  { value: 'document', label: 'Document' },
  { value: 'chat', label: 'Chat' },
  { value: 'action', label: 'Action' },
  { value: 'divider', label: 'Divider' }
];

export function MenuItemForm({ 
  workspaceId, 
  parentId, 
  editingItemId, 
  onSave, 
  onCancel 
}: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'folder',
    icon: '',
    path: '',
    component: '',
    description: '',
    badge: '',
    color: ''
  });

  const createMenuItem = useMutation((api as any)["menu/store/menuItems"].createMenuItem);
  const updateMenuItem = useMutation((api as any)["menu/store/menuItems"].updateMenuItem);
  const existingItem = useQuery(
    (api as any)["menu/store/menuItems"].getMenuItem,
    editingItemId ? { menuItemId: editingItemId } : "skip"
  );

  // Load existing item data when editing
  useEffect(() => {
    if (existingItem) {
      setFormData({
        name: existingItem.name || '',
        slug: existingItem.slug || '',
        type: existingItem.type || 'folder',
        icon: existingItem.icon || '',
        path: existingItem.path || '',
        component: existingItem.component || '',
        description: existingItem.metadata?.description || '',
        badge: existingItem.metadata?.badge || '',
        color: existingItem.metadata?.color || ''
      });
    }
  }, [existingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const menuItemData = {
        workspaceId,
        parentId,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        type: formData.type as any,
        icon: formData.icon || undefined,
        path: formData.path || undefined,
        component: formData.component || undefined,
        isVisible: true,
        visibleForRoleIds: [], // Will be set based on workspace roles
        metadata: {
          description: formData.description || undefined,
          badge: formData.badge || undefined,
          color: formData.color || undefined
        }
      };

      if (editingItemId) {
        await updateMenuItem({
          menuItemId: editingItemId,
          ...menuItemData
        });
      } else {
        await createMenuItem(menuItemData);
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingItemId ? 'Edit Menu Item' : 'Create Menu Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Menu item name"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_ITEM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Icon & Color</Label>
              <IconPicker
                icon={formData.icon || "Folder"}
                color={formData.color || "default"}
                onIconChange={(icon) => setFormData({ ...formData, icon })}
                onColorChange={(color) => setFormData({ ...formData, color })}
                showColor={true}
                showBackground={false}
                className="w-full"
              />
            </div>
          </div>

          {(formData.type === 'route' || formData.type === 'document') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="path">Path</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/path/to/resource"
                />
              </div>
              <div>
                <Label htmlFor="component">Component</Label>
                <Input
                  id="component"
                  value={formData.component}
                  onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                  placeholder="ComponentName"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="badge">Badge (Optional)</Label>
            <Input
              id="badge"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="Optional badge text"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {editingItemId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
