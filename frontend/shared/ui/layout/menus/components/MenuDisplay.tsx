
"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, FileText, Hash, ExternalLink, MoreHorizontal, Pencil, Palette, Trash2, Copy } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { getIconComponent, getColorValue } from "@/frontend/shared/components/icons";
import { useMenuItems, useMenuItem } from "../hooks/useMenuItems";
import { useMenuMutations } from "../hooks/useMenuMutations";
import {
  DEFAULT_MENU_FEATURE_CONFIG,
  type MenuDisplayProps,
  type MenuItemRecord,
  type SecondaryMenuFeatureConfig,
} from "../types";
import { useOptionalSecondaryMenuContext } from "../context";

type RenameDialogState = {
  open: boolean;
  item: MenuItemRecord | null;
  value: string;
  loading: boolean;
};

type AppearanceDialogState = {
  open: boolean;
  item: MenuItemRecord | null;
  icon: string;
  color: string;
  loading: boolean;
};

export function MenuDisplay({
  workspaceId,
  menuItemId,
  enableActions,
  onSelect,
  featureConfig,
  variant: _variant = "menu",
  onOpenDatabaseSheet: _onOpenDatabaseSheet,
}: MenuDisplayProps) {
  const variant = _variant;
  const onOpenDatabaseSheet = _onOpenDatabaseSheet;
  const context = useOptionalSecondaryMenuContext();

  const mergedConfig = useMemo<SecondaryMenuFeatureConfig>(
    () => ({
      ...DEFAULT_MENU_FEATURE_CONFIG,
      ...(context?.featureConfig ?? {}),
      ...(featureConfig ?? {}),
    }),
    [context?.featureConfig, featureConfig],
  );
  const isChatVariant = variant === "chat";
  const isDocumentVariant = variant === "document";
  const allowAvatarSelection =
    mergedConfig.allowAvatarSelection && isChatVariant;
  const enableDatabaseSheet =
    mergedConfig.enableDatabaseSheet && isDocumentVariant;
  const showPreviewPanel =
    mergedConfig.showPreviewPanel || isChatVariant || isDocumentVariant;
  const baseActionsEnabled =
    enableActions ??
    (mergedConfig.allowRename ||
      mergedConfig.allowAppearanceChange ||
      mergedConfig.allowDuplicate ||
      mergedConfig.allowDelete);

  const featureTypeBadgeVariant = (type?: string) => {
    if (type === "system") return "destructive"
    if (type === "optional") return "secondary"
    if (type === "experimental") return "secondary"
    return "outline"
  }

  const featureTypeLabel = (type?: string) => {
    if (type === "system") return "System"
    if (type === "optional") return "Optional"
    if (type === "default") return "Default"
    if (type === "experimental") return "Experimental"
    return "Custom"
  }

  const featureVisibilityDescription = (type?: string) => {
    if (type === "system") return "Owners & admin roles"
    if (type === "optional") return "All members (optional)"
    if (type === "default") return "All workspace members"
    if (type === "experimental") return "All workspace members"
    return "Custom visibility"
  }

  const fallbackMenuState = useMenuItems(workspaceId);
  const { menuItems, isLoading } = context
    ? {
        menuItems: context.menuItems,
        isLoading: context.isLoading,
      }
    : fallbackMenuState;

  const { menuItem: currentMenuItem } = useMenuItem(menuItemId);

  const mutations = context?.mutations ?? useMenuMutations();
  const {
    renameMenuItem,
    updateMenuItem,
    deleteMenuItem,
    duplicateMenuItem,
  } = mutations;

  const canRename = mergedConfig.allowRename;
  const canChangeAppearance = mergedConfig.allowAppearanceChange;
  const canDuplicate = mergedConfig.allowDuplicate;
  const canDelete = mergedConfig.allowDelete;

  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    open: false,
    item: null,
    value: "",
    loading: false,
  });
  const [appearanceDialog, setAppearanceDialog] = useState<AppearanceDialogState>({
    open: false,
    item: null,
    icon: "",
    color: "",
    loading: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<MenuItemRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<Id<"menuItems"> | null>(null);

  const childItems = useMemo<MenuItemRecord[]>(() => {
    if (!menuItemId) return [] as MenuItemRecord[];
    return menuItems
      .filter((item: MenuItemRecord) => item.parentId === menuItemId)
      .sort(
        (a: MenuItemRecord, b: MenuItemRecord) =>
          (a.order ?? 0) - (b.order ?? 0),
      );
  }, [menuItems, menuItemId]);

  const rootItems = useMemo<MenuItemRecord[]>(() => {
    return menuItems
      .filter((item: MenuItemRecord) => !item.parentId)
      .sort(
        (a: MenuItemRecord, b: MenuItemRecord) =>
          (a.order ?? 0) - (b.order ?? 0),
      );
  }, [menuItems]);

  const itemsToShow = menuItemId ? childItems : rootItems;

  const handleOpenRename = useCallback((item: MenuItemRecord) => {
    if (!canRename) return;
    setRenameDialog({
      open: true,
      item,
      value: item.name,
      loading: false,
    });
  }, [canRename]);

  const handleRenameSubmit = useCallback(async () => {
    if (!canRename) return;
    if (!renameDialog.item || !renameDialog.value.trim()) return;
    setRenameDialog((prev) => ({ ...prev, loading: true }));
    try {
      await renameMenuItem(renameDialog.item._id, renameDialog.value.trim());
      toast.success("Menu item renamed");
      setRenameDialog({ open: false, item: null, value: "", loading: false });
    } catch (error) {
      console.error("Failed to rename menu item:", error);
      toast.error("Failed to rename menu item");
      setRenameDialog((prev) => ({ ...prev, loading: false }));
    }
  }, [canRename, renameDialog, renameMenuItem]);

  const handleOpenAppearance = useCallback((item: MenuItemRecord) => {
    if (!canChangeAppearance) return;
    setAppearanceDialog({
      open: true,
      item,
      icon: item.icon ?? "",
      color: item.metadata?.color ?? "",
      loading: false,
    });
  }, [canChangeAppearance]);

  const handleAppearanceSubmit = useCallback(async () => {
    if (!canChangeAppearance) return;
    if (!appearanceDialog.item) return;
    setAppearanceDialog((prev) => ({ ...prev, loading: true }));
    try {
      const metadata = {
        ...(appearanceDialog.item.metadata ?? {}),
        color: appearanceDialog.color ? appearanceDialog.color : undefined,
      };
      await updateMenuItem({
        menuItemId: appearanceDialog.item._id,
        icon: appearanceDialog.icon ? appearanceDialog.icon : undefined,
        metadata,
      });
      toast.success("Menu item appearance updated");
      setAppearanceDialog({ open: false, item: null, icon: "", color: "", loading: false });
    } catch (error) {
      console.error("Failed to update menu item appearance:", error);
      toast.error("Failed to update menu item appearance");
      setAppearanceDialog((prev) => ({ ...prev, loading: false }));
    }
  }, [appearanceDialog, canChangeAppearance, updateMenuItem]);

  const handleDuplicate = useCallback(
    async (item: MenuItemRecord) => {
      if (!canDuplicate) return;
      setDuplicateLoadingId(item._id);
      try {
        const copyName = `${item.name} Copy`;
        await duplicateMenuItem(item._id, copyName);
        toast.success("Menu item duplicated");
      } catch (error) {
        console.error("Failed to duplicate menu item:", error);
        toast.error("Failed to duplicate menu item");
      } finally {
        setDuplicateLoadingId(null);
      }
    },
    [canDuplicate, duplicateMenuItem],
  );

  const handleDatabaseOpen = useCallback(
    (item: MenuItemRecord) => {
      if (!enableDatabaseSheet) return;
      if (item.type !== "database") return;
      onOpenDatabaseSheet?.(item);
    },
    [enableDatabaseSheet, onOpenDatabaseSheet],
  );

  const handleAvatarStyleChange = useCallback(
    async (item: MenuItemRecord, style: "icon" | "profile") => {
      if (!allowAvatarSelection) return;
      if (item.metadata?.avatarStyle === style) return;
      try {
        const metadata = {
          ...(item.metadata ?? {}),
          avatarStyle: style,
        };
        await updateMenuItem({
          menuItemId: item._id,
          metadata,
        });
        toast.success("Avatar preference updated");
      } catch (error) {
        console.error("Failed to update avatar preference:", error);
        toast.error("Failed to update avatar preference");
      }
    },
    [allowAvatarSelection, updateMenuItem],
  );

  const handleDelete = useCallback(async () => {
    if (!canDelete) return;
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMenuItem(deleteTarget._id);
      toast.success("Menu item deleted");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      toast.error("Failed to delete menu item");
    } finally {
      setDeleteLoading(false);
    }
  }, [canDelete, deleteTarget, deleteMenuItem]);

  const renderIcon = (item: MenuItemRecord) => {
    const color = item.metadata?.color;
    const style = color ? { color: getColorValue(color) } : undefined;
    if (item.icon) {
      const CustomIcon = getIconComponent(item.icon);
      return <CustomIcon className="h-5 w-5" style={style} />;
    }

    switch (item.type) {
      case "folder":
        return <Folder className="h-5 w-5" style={style} />;
      case "document":
        return <FileText className="h-5 w-5" style={style} />;
      case "route":
        return <ExternalLink className="h-5 w-5" style={style} />;
      default:
        return <Hash className="h-5 w-5" style={style} />;
    }
  };

  const handleCardSelect = useCallback(
    (item: MenuItemRecord) => {
      onSelect?.(item);
    },
    [onSelect],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading menu items...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentMenuItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {renderIcon(currentMenuItem)}
              {currentMenuItem.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{currentMenuItem.type}</Badge>
                {currentMenuItem.metadata?.badge && (
                  <Badge variant="outline">{currentMenuItem.metadata.badge}</Badge>
                )}
                {currentMenuItem.metadata?.featureType && (
                  <Badge
                    variant={featureTypeBadgeVariant(currentMenuItem.metadata?.featureType)}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {featureTypeLabel(currentMenuItem.metadata?.featureType)}
                  </Badge>
                )}
              </div>
              {currentMenuItem.metadata?.description && (
                <p className="text-sm text-muted-foreground">{currentMenuItem.metadata.description}</p>
              )}
              {currentMenuItem.metadata?.featureType && (
                <p className="text-xs text-muted-foreground">
                  Visibility: {featureVisibilityDescription(currentMenuItem.metadata?.featureType)}
                </p>
              )}
              {currentMenuItem.path && (
                <div className="text-sm">
                  <span className="font-medium">Path:</span> {currentMenuItem.path}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itemsToShow.map((item) => {
          const avatarStyle =
            (item.metadata?.avatarStyle as "icon" | "profile") ?? "icon";
          const iconChangeAllowed =
            canChangeAppearance &&
            (!allowAvatarSelection || avatarStyle !== "profile");
          const databaseActionAllowed =
            enableDatabaseSheet &&
            item.type === "database" &&
            typeof onOpenDatabaseSheet === "function";
          const itemRenameAllowed = canRename;
          const itemDuplicateAllowed = canDuplicate;
          const itemDeleteAllowed = canDelete;
          const hasPrimaryActions =
            itemRenameAllowed ||
            iconChangeAllowed ||
            itemDuplicateAllowed ||
            databaseActionAllowed;
          const hasAnyActions = hasPrimaryActions || itemDeleteAllowed;
          const actionsEnabled = baseActionsEnabled && hasAnyActions;

          return (
            <Card
              key={item._id}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => handleCardSelect(item)}
              onKeyDown={(event) => {
                if (!onSelect) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCardSelect(item);
                }
              }}
              className={`cursor-pointer transition-shadow hover:shadow-md ${actionsEnabled ? "pr-2" : ""}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {renderIcon(item)}
                  {item.name}
                </CardTitle>
                {actionsEnabled ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {itemRenameAllowed ? (
                        <DropdownMenuItem
                          onSelect={() => {
                            handleOpenRename(item);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                      ) : null}
                      {iconChangeAllowed ? (
                        <DropdownMenuItem
                          onSelect={() => {
                            handleOpenAppearance(item);
                          }}
                        >
                          <Palette className="mr-2 h-4 w-4" />
                          Change icon & color
                        </DropdownMenuItem>
                      ) : null}
                      {databaseActionAllowed ? (
                        <DropdownMenuItem
                          onSelect={() => {
                            handleDatabaseOpen(item);
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open sheet
                        </DropdownMenuItem>
                      ) : null}
                      {itemDuplicateAllowed ? (
                        <DropdownMenuItem
                          disabled={duplicateLoadingId === item._id}
                          onSelect={() => {
                            handleDuplicate(item);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {duplicateLoadingId === item._id
                            ? "Duplicating..."
                            : "Duplicate"}
                        </DropdownMenuItem>
                      ) : null}
                      {itemDeleteAllowed &&
                      (itemRenameAllowed ||
                        iconChangeAllowed ||
                        itemDuplicateAllowed ||
                        databaseActionAllowed) ? (
                        <DropdownMenuSeparator />
                      ) : null}
                      {itemDeleteAllowed ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => {
                            setDeleteTarget(item);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
                {item.metadata?.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {item.metadata.description}
                  </p>
                ) : null}
                {item.path ? (
                  <div className="text-xs text-muted-foreground">
                    {item.path}
                  </div>
                ) : null}
                {allowAvatarSelection ? (
                  <div className="flex items-center gap-2 pt-2 text-xs">
                    <span className="text-muted-foreground">Avatar</span>
                    <Button
                      variant={avatarStyle === "icon" ? "default" : "outline"}
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAvatarStyleChange(item, "icon");
                      }}
                    >
                      Icon
                    </Button>
                    <Button
                      variant={
                        avatarStyle === "profile" ? "default" : "outline"
                      }
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleAvatarStyleChange(item, "profile");
                      }}
                    >
                      Profile
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {itemsToShow.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          {menuItemId ? "No child items found." : "No menu items found."}
        </div>
      )}

      {/* Rename dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setRenameDialog({ open: false, item: null, value: "", loading: false });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename menu item</DialogTitle>
            <DialogDescription>
              Update the display name for {renameDialog.item?.name ?? "this menu item"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="menu-rename-input">New name</Label>
              <Input
                id="menu-rename-input"
                value={renameDialog.value}
                onChange={(event) =>
                  setRenameDialog((prev) => ({ ...prev, value: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleRenameSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, item: null, value: "", loading: false })}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!renameDialog.value.trim() || renameDialog.loading}>
              {renameDialog.loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appearance dialog */}
      <Dialog
        open={appearanceDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setAppearanceDialog({ open: false, item: null, icon: "", color: "", loading: false });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update icon & color</DialogTitle>
            <DialogDescription>
              Provide a lucide-react icon name and optional accent color token or hex value.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="menu-icon-input">Icon (optional)</Label>
              <Input
                id="menu-icon-input"
                placeholder="e.g. MessageSquare"
                value={appearanceDialog.icon}
                onChange={(event) =>
                  setAppearanceDialog((prev) => ({ ...prev, icon: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Provide any icon name from lucide-react (case sensitive).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-color-input">Color (optional)</Label>
              <Input
                id="menu-color-input"
                placeholder="primary, #3b82f6, hsl(var(--primary))..."
                value={appearanceDialog.color}
                onChange={(event) =>
                  setAppearanceDialog((prev) => ({ ...prev, color: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Use a theme token (primary, secondary) or a hex value to tint the icon.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setAppearanceDialog({ open: false, item: null, icon: "", color: "", loading: false })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleAppearanceSubmit} disabled={appearanceDialog.loading}>
              {appearanceDialog.loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete menu item</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The menu item will be removed from the workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
