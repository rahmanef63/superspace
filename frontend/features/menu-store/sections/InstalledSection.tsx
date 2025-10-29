import type { Id } from "@convex/_generated/dataModel";
import { MenuItemForm } from "@/frontend/shared/ui/layout/menus/components/MenuItemForm";
import { MenuDisplay } from "@/frontend/shared/ui/layout/menus/components/MenuDisplay";
import { MenuPreview } from "@/frontend/shared/ui/layout/menus/components/MenuPreview";
import { MenuItemCard } from "../components";
import type { MenuItem, ViewMode } from "../types";
import { MENU_STORE_CONFIG } from "../constants";
import { getOriginalFeatureType } from "../lib";

interface InstalledSectionProps {
  workspaceId: Id<"workspaces">;
  viewMode: ViewMode;
  showForm: boolean;
  selectedItemId?: Id<"menuItems">;
  editingItemId?: Id<"menuItems">;
  filteredItems?: MenuItem[];
  updatingFeatureTypeId: Id<"menuItems"> | null;
  onItemSelect: (id: Id<"menuItems">) => void;
  onItemEdit: (id: Id<"menuItems">) => void;
  onItemRename: (item: MenuItem) => void;
  onItemDuplicate: (item: MenuItem) => void;
  onItemShare: (item: MenuItem) => void;
  onItemDelete: (id: Id<"menuItems">) => void;
  onFeatureTypeChange: (item: MenuItem, target: "system" | "default") => void;
  onFormSave: () => void;
  onFormCancel: () => void;
}

export function InstalledSection({
  workspaceId,
  viewMode,
  showForm,
  selectedItemId,
  editingItemId,
  filteredItems,
  updatingFeatureTypeId,
  onItemSelect,
  onItemEdit,
  onItemRename,
  onItemDuplicate,
  onItemShare,
  onItemDelete,
  onFeatureTypeChange,
  onFormSave,
  onFormCancel,
}: InstalledSectionProps) {
  if (showForm) {
    return (
      <div className="p-6">
        <MenuItemForm
          workspaceId={workspaceId}
          parentId={selectedItemId}
          editingItemId={editingItemId}
          onSave={onFormSave}
          onCancel={onFormCancel}
        />
      </div>
    );
  }

  if (viewMode === "tree") {
    return (
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <MenuDisplay workspaceId={workspaceId} menuItemId={selectedItemId} />
        </div>
        <aside className={`shrink-0 border-l bg-muted/30 ${MENU_STORE_CONFIG.previewPanelWidth}`}>
          <MenuPreview menuItemId={selectedItemId} workspaceId={workspaceId} />
        </aside>
      </div>
    );
  }

  // Grid View
  return (
    <div className="p-6">
      <div className={`grid gap-4 ${MENU_STORE_CONFIG.gridColumns.sm} ${MENU_STORE_CONFIG.gridColumns.md} ${MENU_STORE_CONFIG.gridColumns.lg}`}>
        {filteredItems?.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            isSelected={selectedItemId === item._id}
            isUpdating={updatingFeatureTypeId === item._id}
            onSelect={onItemSelect}
            onEdit={onItemEdit}
            onRename={onItemRename}
            onDuplicate={onItemDuplicate}
            onShare={onItemShare}
            onDelete={onItemDelete}
            onRestrictToSystem={(item) => onFeatureTypeChange(item, "system")}
            onRestoreVisibility={(item) => onFeatureTypeChange(item, "default")}
          />
        ))}
      </div>
    </div>
  );
}
