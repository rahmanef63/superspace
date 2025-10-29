"use client"

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import {
  FolderIcon,
  FolderOpenIcon,
  FileText,
  Hash,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";

import {
  Tree,
  TreeDragLine,
  TreeItem,
  TreeItemLabel,
} from "@/components/tree";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Import shared icon components
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/components/icons";

interface MenuTreeProps {
  workspaceId: Id<"workspaces">;
  onItemSelect?: (itemId: Id<"menuItems">) => void;
  selectedItemId?: Id<"menuItems">;
  showActions?: boolean;
}

interface MenuItemData {
  _id: Id<"menuItems">;
  name: string;
  type: string;
  icon?: string;
  parentId?: Id<"menuItems">;
  order: number;
  children?: Id<"menuItems">[];
  metadata?: {
    color?: string;
    description?: string;
    [key: string]: any;
  };
}

type DialogMode = "create" | "edit" | null;

interface DialogState {
  mode: DialogMode;
  itemId?: Id<"menuItems">;
  parentId?: Id<"menuItems">;
  data: {
    name: string;
    type: string;
    icon: string;
    color: string;
    description: string;
  };
}

const MENU_ITEM_TYPES = [
  { value: "folder", label: "Folder" },
  { value: "route", label: "Route" },
  { value: "document", label: "Document" },
  { value: "chat", label: "Chat" },
  { value: "divider", label: "Divider" },
  { value: "action", label: "Action" },
];

export function MenuTree({
  workspaceId,
  onItemSelect,
  selectedItemId,
  showActions = false
}: MenuTreeProps) {
  const menuItems = useQuery((api as any)["menu/store/menuItems"].getWorkspaceMenuItems, { workspaceId });

  const createMutation = useMutation((api as any)["menu/store/menuItems"].createMenuItem);
  const updateMutation = useMutation((api as any)["menu/store/menuItems"].updateMenuItem);
  const deleteMutation = useMutation((api as any)["menu/store/menuItems"].deleteMenuItem);
  const updateOrderMutation = useMutation((api as any)["menu/store/menuItems"].updateMenuOrder);
  const duplicateMutation = useMutation((api as any)["menu/store/menuItems"].duplicateMenuItem);

  const [dialog, setDialog] = useState<DialogState>({
    mode: null,
    data: {
      name: "",
      type: "folder",
      icon: "Folder",
      color: "#3b82f6",
      description: "",
    },
  });

  // Build items map for headless-tree
  const itemsMap: Record<string, MenuItemData> = {};
  const rootItemIds: Id<"menuItems">[] = [];

  if (menuItems) {
    // First pass: create map and identify children
    menuItems.forEach((item: any) => {
      itemsMap[item._id] = {
        ...item,
        children: []
      };
    });

    // Second pass: build parent-child relationships
    menuItems.forEach((item: any) => {
      if (item.parentId && itemsMap[item.parentId]) {
        itemsMap[item.parentId].children!.push(item._id);
      } else {
        rootItemIds.push(item._id);
      }
    });

    // Sort children by order
    Object.values(itemsMap).forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          const orderA = itemsMap[a]?.order ?? 0;
          const orderB = itemsMap[b]?.order ?? 0;
          return orderA - orderB;
        });
      }
    });

    // Sort root items by order
    rootItemIds.sort((a, b) => {
      const orderA = itemsMap[a]?.order ?? 0;
      const orderB = itemsMap[b]?.order ?? 0;
      return orderA - orderB;
    });
  }

  const indent = 20;

  const tree = useTree<MenuItemData>({
    initialState: {
      expandedItems: [],
      selectedItems: selectedItemId ? [selectedItemId] : [],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0 || item.getItemData()?.type === "folder",
    canReorder: showActions,
    onDrop: showActions ? createOnDropHandler(async (parentItem, newChildrenIds) => {
      // Update order for all children
      for (let i = 0; i < newChildrenIds.length; i++) {
        const childId = newChildrenIds[i] as Id<"menuItems">;
        const newParentId = parentItem.getId() === "root" ? null : (parentItem.getId() as Id<"menuItems">);

        try {
          await updateOrderMutation({
            menuItemId: childId,
            newOrder: i,
            parentId: newParentId,
          });
        } catch (error) {
          console.error("Failed to update order:", error);
        }
      }
    }) : undefined,
    onPrimaryAction: (item) => {
      const itemId = item.getId() as Id<"menuItems">;
      if (itemId !== "root") {
        onItemSelect?.(itemId);
      }
    },
    dataLoader: {
      getItem: (itemId) => {
        if (itemId === "root") {
          return {
            _id: "root" as Id<"menuItems">,
            name: "Root",
            type: "folder",
            order: 0,
            children: rootItemIds,
          };
        }
        return itemsMap[itemId];
      },
      getChildren: (itemId) => {
        if (itemId === "root") {
          return rootItemIds;
        }
        return itemsMap[itemId]?.children ?? [];
      },
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      ...(showActions ? [dragAndDropFeature, keyboardDragAndDropFeature] : []),
    ],
  });

  const openCreateDialog = (parentId?: Id<"menuItems">) => {
    setDialog({
      mode: "create",
      parentId,
      data: {
        name: "",
        type: "folder",
        icon: "Folder",
        color: "#3b82f6",
        description: "",
      },
    });
  };

  const openEditDialog = (itemId: Id<"menuItems">) => {
    const item = itemsMap[itemId];
    if (!item) return;

    setDialog({
      mode: "edit",
      itemId,
      data: {
        name: item.name,
        type: item.type,
        icon: item.icon || "Folder",
        color: item.metadata?.color || "#3b82f6",
        description: item.metadata?.description || "",
      },
    });
  };

  const closeDialog = () => {
    setDialog({
      mode: null,
      data: {
        name: "",
        type: "folder",
        icon: "Folder",
        color: "#3b82f6",
        description: "",
      },
    });
  };

  const handleSave = async () => {
    try {
      if (dialog.mode === "create") {
        // Generate slug from name
        const slug = dialog.data.name.toLowerCase().replace(/\s+/g, "");

        await createMutation({
          workspaceId,
          parentId: dialog.parentId,
          name: dialog.data.name,
          slug,
          type: dialog.data.type as any,
          icon: dialog.data.icon,
          metadata: {
            color: dialog.data.color,
            description: dialog.data.description,
          },
        });
      } else if (dialog.mode === "edit" && dialog.itemId) {
        await updateMutation({
          menuItemId: dialog.itemId,
          name: dialog.data.name,
          type: dialog.data.type as any,
          icon: dialog.data.icon,
          metadata: {
            color: dialog.data.color,
            description: dialog.data.description,
          },
        });
      }
      closeDialog();
    } catch (error) {
      console.error("Failed to save menu item:", error);
    }
  };

  const handleDelete = async (itemId: Id<"menuItems">) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await deleteMutation({ menuItemId: itemId });
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };

  const handleDuplicate = async (itemId: Id<"menuItems">) => {
    try {
      await duplicateMutation({ menuItemId: itemId });
    } catch (error) {
      console.error("Failed to duplicate menu item:", error);
    }
  };

  const renderIcon = (type: string, iconName?: string, isFolder?: boolean, isExpanded?: boolean, color?: string) => {
    const className = `size-4 ${color ? '' : 'text-muted-foreground'}`;
    const style = color ? { color } : undefined;

    if (isFolder) {
      return isExpanded ? (
        <FolderOpenIcon className={className} style={style} />
      ) : (
        <FolderIcon className={className} style={style} />
      );
    }

    if (iconName) {
      const IconComponent = getIconComponent(iconName);
      return <IconComponent className={className} style={style} />;
    }

    switch (type) {
      case 'document':
        return <FileText className={className} style={style} />;
      default:
        return <Hash className={className} style={style} />;
    }
  };

  if (!menuItems) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {showActions && (
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-sm font-medium">Menu Items</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCreateDialog()}
            >
              <Plus className="size-4 mr-1" />
              Add Item
            </Button>
          </div>
        )}

        <Tree indent={indent} tree={tree}>
          <AssistiveTreeDescription tree={tree} />
          {tree.getItems().map((item) => {
            // Skip rendering the root item itself
            if (item.getId() === "root") {
              return null;
            }

            const itemData = item.getItemData();
            const isFolder = item.isFolder();
            const isExpanded = item.isExpanded();

            return (
              <TreeItem key={item.getId()} item={item}>
                <TreeItemLabel>
                  <div className="flex items-center justify-between w-full group">
                    <span className="flex items-center gap-2">
                      {renderIcon(
                        itemData.type,
                        itemData.icon,
                        isFolder,
                        isExpanded,
                        itemData.metadata?.color
                      )}
                      <span>{item.getItemName()}</span>
                    </span>

                    {showActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openCreateDialog(itemData._id)}>
                            <Plus className="size-4 mr-2" />
                            Add Child
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(itemData._id)}>
                            <Pencil className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(itemData._id)}>
                            <Copy className="size-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(itemData._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TreeItemLabel>
              </TreeItem>
            );
          })}
          {showActions && <TreeDragLine />}
        </Tree>

        {Object.keys(itemsMap).length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No menu items found
          </div>
        )}
      </div>

      <Dialog open={dialog.mode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.mode === "create" ? "Create Menu Item" : "Edit Menu Item"}
            </DialogTitle>
            <DialogDescription>
              Configure the menu item properties below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={dialog.data.name}
                onChange={(e) =>
                  setDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data, name: e.target.value },
                  }))
                }
                placeholder="Enter menu item name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={dialog.data.type}
                onValueChange={(value) =>
                  setDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data, type: value },
                  }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_ITEM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon & Color</Label>
              <IconPicker
                icon={dialog.data.icon}
                color={dialog.data.color}
                onIconChange={(icon) =>
                  setDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data, icon },
                  }))
                }
                onColorChange={(color) =>
                  setDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data, color },
                  }))
                }
                showColor={true}
                showBackground={false}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={dialog.data.description}
                onChange={(e) =>
                  setDialog((prev) => ({
                    ...prev,
                    data: { ...prev.data, description: e.target.value },
                  }))
                }
                placeholder="Optional description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {dialog.mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


