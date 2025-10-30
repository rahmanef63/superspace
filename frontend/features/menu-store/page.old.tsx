"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MenuItemForm } from "@/frontend/shared/ui";
import { DragDropMenuTree } from "@/frontend/shared/ui";
import { MenuDisplay } from "@/frontend/shared/ui";
import { BreadcrumbNavigation } from "@/frontend/shared/ui";
import { MenuPreview } from "@/frontend/shared/ui";
import {
  Plus,
  Trash2,
  Edit,
  Download,
  Check,
  Copy,
  Share,
  MoreHorizontal,
  FileInput,
  RefreshCw,
  Loader2,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { getIconComponent } from "@/frontend/shared/ui";
import { cn } from "@/lib/utils";
import {
  SecondarySidebarLayout,
  type SecondarySidebarHeaderProps,
  type SecondarySidebarProps,
} from "@/frontend/shared/ui";
import { SecondarySidebarTools } from "@/frontend/shared/ui";
import { MenuStoreMenuWrapper } from "@/frontend/shared/ui";
import type { MenuItemMetadata } from "@/frontend/shared/ui";

export interface MenuStorePageProps {
  workspaceId: Id<"workspaces"> | null;
}

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  slug: string;
  type: string;
  path?: string;
  metadata?: MenuItemMetadata;
}

interface AvailableFeatureMenu {
  slug: string;
  name: string;
  description: string;
  icon: string;
  version?: string;
  category?: string;
  featureType?: MenuItemMetadata["featureType"];
  tags?: string[];
  status?: "stable" | "beta" | "development" | "experimental" | "deprecated";
  isReady?: boolean;
  expectedRelease?: string;
}

export default function MenuStorePage({ workspaceId }: MenuStorePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<Id<"menuItems"> | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<Id<"menuItems"> | undefined>();
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [activeTab, setActiveTab] = useState<"installed" | "available" | "import">("installed");
  const [installingFeatures, setInstallingFeatures] = useState<Set<string>>(new Set());
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    item?: MenuItem;
    newName: string;
  }>({ isOpen: false, newName: "" });
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; shareableId?: string }>({
    isOpen: false,
  });
  const [importMenuId, setImportMenuId] = useState("");
  const [importing, setImporting] = useState(false);
  const [syncingDefaults, setSyncingDefaults] = useState(false);
  const [updatingFeatureTypeId, setUpdatingFeatureTypeId] = useState<Id<"menuItems"> | null>(
    null
  );

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  const menuItems = useQuery(
    (api as any)["menu/store/menuItems"].getWorkspaceMenuItems,
    { workspaceId }
  );
  const availableFeatures = useQuery(
    (api as any)["menu/store/menuItems"].getAvailableFeatureMenus,
    { workspaceId }
  );
  const availableFeatureList = availableFeatures as AvailableFeatureMenu[] | undefined;
  const deleteMenuItem = useMutation((api as any)["menu/store/menuItems"].deleteMenuItem);
  const installFeatureMenus = useMutation(
    (api as any)["menu/store/menuItems"].installFeatureMenus
  );
  const renameMenuItem = useMutation((api as any)["menu/store/menuItems"].renameMenuItem);
  const duplicateMenuItem = useMutation((api as any)["menu/store/menuItems"].duplicateMenuItem);
  const shareMenuItem = useMutation((api as any)["menu/store/menuItems"].shareMenuItem);
  const importMenuFromShareableId = useMutation(
    (api as any)["menu/store/menuItems"].importMenuFromShareableId
  );
  const setMenuItemFeatureType = useMutation(
    (api as any)["menu/store/menuItems"].setMenuItemFeatureType
  );
  const syncDefaultMenus = useMutation(
    (api as any)["menu/store/menuItems"].syncWorkspaceDefaultMenus
  );

  const filteredItems = (menuItems as MenuItem[] | undefined)?.filter((item: MenuItem) => {
    if (!searchQuery) return true;
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDeleteItem = async (itemId: Id<"menuItems">) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteMenuItem({ menuItemId: itemId });
        if (selectedItemId === itemId) {
          setSelectedItemId(undefined);
        }
        toast.success("Menu item deleted successfully");
      } catch (error) {
        console.error("Failed to delete menu item:", error);
        toast.error("Failed to delete menu item");
      }
    }
  };

  const handleEditItem = (itemId: Id<"menuItems">) => {
    setEditingItemId(itemId);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingItemId(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItemId(undefined);
  };

  const handleInstallFeature = async (featureSlug: string) => {
    setInstallingFeatures((prev) => new Set(prev).add(featureSlug));
    try {
      await installFeatureMenus({
        workspaceId,
        featureSlugs: [featureSlug],
      });
      toast.success("Feature installed successfully");
    } catch (error) {
      console.error("Failed to install feature:", error);
      toast.error("Failed to install feature");
    } finally {
      setInstallingFeatures((prev) => {
        const newSet = new Set(prev);
        newSet.delete(featureSlug);
        return newSet;
      });
    }
  };

  const handleRenameItem = async (item: MenuItem) => {
    setRenameDialog({ isOpen: true, item, newName: item.name });
  };

  const handleRenameConfirm = async () => {
    if (!renameDialog.item || !renameDialog.newName.trim()) return;

    try {
      await renameMenuItem({
        menuItemId: renameDialog.item._id,
        name: renameDialog.newName.trim(),
      });
      setRenameDialog({ isOpen: false, newName: "" });
      toast.success("Menu item renamed successfully");
    } catch (error) {
      console.error("Failed to rename menu item:", error);
      toast.error("Failed to rename menu item");
    }
  };

  const handleDuplicateItem = async (item: MenuItem) => {
    try {
      await duplicateMenuItem({ menuItemId: item._id });
      toast.success("Menu item duplicated successfully");
    } catch (error) {
      console.error("Failed to duplicate menu item:", error);
      toast.error("Failed to duplicate menu item");
    }
  };

  const handleShareItem = async (item: MenuItem) => {
    try {
      const result = await shareMenuItem({ menuItemId: item._id });
      setShareDialog({ isOpen: true, shareableId: result.shareableId });
    } catch (error) {
      console.error("Failed to share menu item:", error);
      toast.error("Failed to share menu item");
    }
  };

  const handleCopyShareableId = () => {
    if (shareDialog.shareableId) {
      navigator.clipboard.writeText(shareDialog.shareableId);
      toast.success("Shareable ID copied to clipboard");
    }
  };

  const handleImportMenu = async () => {
    if (!importMenuId.trim()) {
      toast.error("Please enter a menu ID");
      return;
    }

    setImporting(true);
    try {
      const result = await importMenuFromShareableId({
        workspaceId,
        shareableId: importMenuId.trim(),
      });
      setImportMenuId("");
      toast.success(`Menu "${result.sourceName}" imported successfully`);
    } catch (error) {
      console.error("Failed to import menu:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import menu");
    } finally {
      setImporting(false);
    }
  };

  const normalizeFeatureType = (type?: string): "default" | "system" | "optional" => {
    if (type === "system") return "system";
    if (type === "optional") return "optional";
    return "default";
  };

  const getFeatureType = (item: MenuItem): "default" | "system" | "optional" | "custom" => {
    const current = item.metadata?.featureType as string | undefined;
    if (current === "system" || current === "optional" || current === "default") {
      return current;
    }
    return "custom";
  };

  const getOriginalFeatureType = (item: MenuItem): "default" | "system" | "optional" => {
    const original = item.metadata?.originalFeatureType as string | undefined;
    return normalizeFeatureType(
      original ?? (item.metadata?.featureType as string | undefined)
    );
  };

  const handleFeatureTypeChange = async (item: MenuItem, target: "system" | "default") => {
    setUpdatingFeatureTypeId(item._id);
    const originalType = getOriginalFeatureType(item);
    const desiredType: "default" | "system" | "optional" =
      target === "default" ? (originalType === "system" ? "default" : originalType) : "system";
    try {
      await setMenuItemFeatureType({
        menuItemId: item._id,
        featureType: desiredType,
      });
      toast.success(
        desiredType === "system"
          ? "Menu restricted to system roles"
          : desiredType === "optional"
          ? "Menu marked as optional"
          : "Menu visibility restored"
      );
    } catch (error) {
      console.error("Failed to update menu visibility:", error);
      toast.error("Failed to update menu visibility");
    } finally {
      setUpdatingFeatureTypeId(null);
    }
  };

  const handleSyncDefaults = async () => {
    setSyncingDefaults(true);
    try {
      await syncDefaultMenus({ workspaceId });
      toast.success("Default menus synced with feature manifest");
    } catch (error) {
      console.error("Failed to sync default menus:", error);
      toast.error("Failed to sync default menus");
    } finally {
      setSyncingDefaults(false);
    }
  };

  const showTreeSidebar = activeTab === "installed" && viewMode === "tree";

  const headerProps: SecondarySidebarHeaderProps = {
    title: "Menu Store",
    description: "Manage workspace menus and install new features",
    secondaryActions:
      activeTab === "installed" ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncDefaults}
            disabled={syncingDefaults}
            className="gap-2"
          >
            {syncingDefaults ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync
              </>
            )}
          </Button>
        </div>
      ) : undefined,
    primaryAction:
      activeTab === "installed"
        ? {
            label: "Add Menu",
            icon: Plus,
            onClick: () => setShowForm(true),
          }
        : undefined,
    children: (
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "installed" | "available" | "import")
        }
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
    toolbar:
      activeTab === "installed" ? (
        <div className="space-y-3">
          <BreadcrumbNavigation
            workspaceId={workspaceId}
            currentMenuItemId={selectedItemId}
            onNavigate={setSelectedItemId}
          />
          <SecondarySidebarTools
            search={
              activeTab === "installed"
                ? {
                    value: searchQuery,
                    onChange: (value: string) => setSearchQuery(value),
                    placeholder: "Search menu items...",
                  }
                : undefined
            }
            viewOptions={[
              { label: "Tree", value: "tree", icon: LayoutList },
              { label: "Grid", value: "grid", icon: LayoutGrid },
            ]}
            currentView={viewMode}
            onViewChange={(value) => setViewMode(value as "tree" | "grid")}
          />
        </div>
      ) : undefined,
  };

  const sidebarProps: SecondarySidebarProps | undefined = showTreeSidebar
    ? {
        sections: [
          {
            id: "menu-structure",
            title: "Menu Structure",
            content: (
              <DragDropMenuTree
                workspaceId={workspaceId}
                onItemSelect={setSelectedItemId}
                selectedItemId={selectedItemId}
              />
            ),
          },
        ],
        contentClassName: "p-4",
      }
    : undefined;

  return (
    <MenuStoreMenuWrapper workspaceId={workspaceId}>
      <SecondarySidebarLayout
        className="h-full"
        headerProps={headerProps}
        sidebarProps={sidebarProps}
        sidebarClassName="border-r border bg-background"
        contentClassName="flex flex-col overflow-hidden bg-background"
      >
        <Tabs value={activeTab} className="flex flex-1 flex-col overflow-hidden">
          <TabsContent value="installed" className="mt-0 flex flex-1 overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                {showForm ? (
                  <div className="p-6">
                    <MenuItemForm
                      workspaceId={workspaceId}
                      parentId={selectedItemId}
                      editingItemId={editingItemId}
                      onSave={handleFormSave}
                      onCancel={handleFormCancel}
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    {viewMode === "tree" ? (
                      <MenuDisplay workspaceId={workspaceId} menuItemId={selectedItemId} />
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredItems?.map((item) => {
                          const featureType = getFeatureType(item);
                          const originalType = getOriginalFeatureType(item);
                          const isSystem = featureType === "system";
                          const showRestore = isSystem && originalType !== "system";
                          const featureBadgeVariant =
                            featureType === "system"
                              ? "destructive"
                              : featureType === "optional"
                              ? "secondary"
                              : "outline";
                          const featureLabel =
                            featureType === "system"
                              ? "System"
                              : featureType === "optional"
                              ? "Optional"
                              : featureType === "default"
                              ? "Default"
                              : "Custom";

                          return (
                            <Card
                              key={item._id}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                selectedItemId === item._id && "ring-2 ring-primary"
                              )}
                              onClick={() => setSelectedItemId(item._id)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-base">
                                    {item.name}
                                    {featureType !== "custom" && (
                                      <Badge
                                        variant={featureBadgeVariant}
                                        className="text-[10px] uppercase tracking-wide"
                                      >
                                        {featureLabel}
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(item._id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleRenameItem(item)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDuplicateItem(item)}
                                      >
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleShareItem(item)}>
                                        <Share className="mr-2 h-4 w-4" />
                                        Share
                                      </DropdownMenuItem>
                                      {featureType !== "system" && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleFeatureTypeChange(item, "system")
                                          }
                                          disabled={updatingFeatureTypeId === item._id}
                                        >
                                          Restrict to system roles
                                        </DropdownMenuItem>
                                      )}
                                      {showRestore && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleFeatureTypeChange(item, "default")
                                          }
                                          disabled={updatingFeatureTypeId === item._id}
                                        >
                                          Restore original visibility
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteItem(item._id)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.type}
                                    </Badge>
                                    {item.metadata?.version && (
                                      <Badge variant="outline" className="text-xs">
                                        v{item.metadata.version}
                                      </Badge>
                                    )}
                                    {item.metadata?.category && (
                                      <Badge variant="default" className="text-xs capitalize">
                                        {item.metadata.category}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.metadata?.description && (
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                      {item.metadata.description}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preview Panel - Only in Tree View */}
              {viewMode === "tree" && !showForm && (
                <aside className="w-96 shrink-0 border-l bg-muted/30">
                  <MenuPreview menuItemId={selectedItemId} workspaceId={workspaceId} />
                </aside>
              )}
            </div>
          </TabsContent>

          <TabsContent value="available" className="mt-0 flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Available Features</h2>
                <p className="text-muted-foreground">
                  Install additional features to extend your workspace functionality.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableFeatureList?.map((feature) => {
                  const IconComponent = getIconComponent(feature.icon);
                  const isInstalling = installingFeatures.has(feature.slug);
                  const isNotReady = feature.isReady === false;
                  const statusBadgeVariant =
                    feature.status === "stable"
                      ? "default"
                      : feature.status === "beta"
                      ? "secondary"
                      : feature.status === "development"
                      ? "outline"
                      : feature.status === "experimental"
                      ? "outline"
                      : feature.status === "deprecated"
                      ? "destructive"
                      : "default";

                  return (
                    <Card key={feature.slug} className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">{feature.name}</CardTitle>
                          </div>
                          {feature.status && (
                            <Badge variant={statusBadgeVariant} className="text-[10px] uppercase">
                              {feature.status}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {feature.version && (
                              <Badge variant="outline" className="text-xs">
                                v{feature.version}
                              </Badge>
                            )}
                            {feature.category && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {feature.category}
                              </Badge>
                            )}
                          </div>
                          {feature.tags && feature.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {feature.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {isNotReady && feature.expectedRelease && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Expected: {feature.expectedRelease}
                            </p>
                          )}
                          <Button
                            onClick={() => handleInstallFeature(feature.slug)}
                            disabled={isInstalling || isNotReady}
                            className="w-full"
                            size="sm"
                            variant={isNotReady ? "outline" : "default"}
                          >
                            {isInstalling ? (
                              <>
                                <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Installing...
                              </>
                            ) : isNotReady ? (
                              <>In Development</>
                            ) : (
                              <>
                                <Download className="mr-2 h-3 w-3" />
                                Install
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {availableFeatureList?.length === 0 && (
                <div className="py-12 text-center">
                  <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 text-lg font-semibold">All Features Installed</h3>
                  <p className="text-muted-foreground">
                    You have installed all available features for this workspace.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-0 flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold">Import Menu</h2>
                <p className="text-muted-foreground">
                  Import a menu from another workspace using a shareable menu ID.
                </p>
              </div>

              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menuId">Menu ID</Label>
                  <Input
                    id="menuId"
                    placeholder="Enter shareable menu ID..."
                    value={importMenuId}
                    onChange={(e) => setImportMenuId(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleImportMenu}
                  disabled={!importMenuId.trim() || importing}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileInput className="mr-2 h-4 w-4" />
                      Import Menu
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-8 rounded-lg bg-muted p-4">
                <h3 className="mb-2 font-medium">How to get a Menu ID:</h3>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Go to the workspace that has the menu you want</li>
                  <li>Find the menu item in the Installed tab</li>
                  <li>Click the menu button (...) and select "Share"</li>
                  <li>Copy the shareable ID and paste it here</li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Rename Dialog */}
        <Dialog
          open={renameDialog.isOpen}
          onOpenChange={(open) => setRenameDialog((prev) => ({ ...prev, isOpen: open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Menu Item</DialogTitle>
              <DialogDescription>
                Enter a new name for "{renameDialog.item?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newName">New Name</Label>
                <Input
                  id="newName"
                  value={renameDialog.newName}
                  onChange={(e) =>
                    setRenameDialog((prev) => ({ ...prev, newName: e.target.value }))
                  }
                  placeholder="Enter new name..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRenameDialog({ isOpen: false, newName: "" })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameConfirm}
                disabled={!renameDialog.newName.trim()}
              >
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog
          open={shareDialog.isOpen}
          onOpenChange={(open) => setShareDialog((prev) => ({ ...prev, isOpen: open }))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Menu Item</DialogTitle>
              <DialogDescription>
                Share this menu item with other workspaces using the ID below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Shareable Menu ID</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareDialog.shareableId || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyShareableId} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with this ID can import this menu item into their workspace.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShareDialog({ isOpen: false })}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SecondarySidebarLayout>
    </MenuStoreMenuWrapper>
  );
}
