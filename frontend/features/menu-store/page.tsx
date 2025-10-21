"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Loader2, LayoutGrid, LayoutList } from "lucide-react";
import {
  SecondarySidebarLayout,
  type SecondarySidebarHeaderProps,
  type SecondarySidebarProps,
} from "@/frontend/shared/layout/sidebar/secondary";
import { SecondarySidebarTools } from "@/frontend/shared/layout/sidebar/secondary";
import { DragDropMenuTree } from "@/frontend/shared/layout/menus/components/DragDropMenuTree";
import { BreadcrumbNavigation } from "@/frontend/shared/layout/menus/components/BreadcrumbNavigation";
import { MenuStoreMenuWrapper } from "@/frontend/shared/layout/menus/components/SecondaryMenuWrappers";

import { useMenuStoreData, useMenuStoreMutations, useMenuStoreState } from "./hooks";
import { InstalledSection, AvailableSection, ImportSection } from "./sections";
import { RenameDialog, ShareDialog } from "./dialogs";
import { filterMenuItems, getOriginalFeatureType } from "./lib";
import type { MenuItem } from "./types";

export interface MenuStorePageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function MenuStorePage({ workspaceId }: MenuStorePageProps) {
  const {
    state,
    setSearchQuery,
    setSelectedItemId,
    setShowForm,
    setEditingItemId,
    setViewMode,
    setActiveTab,
    addInstallingFeature,
    removeInstallingFeature,
    openRenameDialog,
    closeRenameDialog,
    setRenameDialogName,
    openShareDialog,
    closeShareDialog,
    setImportMenuId,
    setImporting,
    setSyncingDefaults,
    setUpdatingFeatureTypeId,
  } = useMenuStoreState();

  const { menuItems, availableFeatures } = useMenuStoreData(workspaceId);
  const mutations = useMenuStoreMutations();

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  const filteredItems = filterMenuItems(menuItems, state.searchQuery);

  // Handlers
  const handleFormSave = () => {
    setShowForm(false);
    setEditingItemId(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItemId(undefined);
  };

  const handleEditItem = (itemId: Id<"menuItems">) => {
    setEditingItemId(itemId);
    setShowForm(true);
  };

  const handleDeleteItem = async (itemId: Id<"menuItems">) => {
    await mutations.deleteMenuItem(itemId, () => {
      if (state.selectedItemId === itemId) {
        setSelectedItemId(undefined);
      }
    });
  };

  const handleInstallFeature = async (slug: string) => {
    addInstallingFeature(slug);
    try {
      await mutations.installFeature(workspaceId, [slug]);
    } finally {
      removeInstallingFeature(slug);
    }
  };

  const handleRenameConfirm = async () => {
    if (!state.renameDialog.item) return;
    await mutations.renameMenuItem(
      state.renameDialog.item._id,
      state.renameDialog.newName,
      closeRenameDialog
    );
  };

  const handleShareItem = async (item: MenuItem) => {
    const shareableId = await mutations.shareMenuItem(item._id);
    if (shareableId) {
      openShareDialog(shareableId);
    }
  };

  const handleImportMenu = async () => {
    setImporting(true);
    try {
      await mutations.importMenu(workspaceId, state.importMenuId, () => {
        setImportMenuId("");
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFeatureTypeChange = async (item: MenuItem, target: "system" | "default") => {
    setUpdatingFeatureTypeId(item._id);
    const originalType = getOriginalFeatureType(item);
    const desiredType: "default" | "system" | "optional" =
      target === "default" ? (originalType === "system" ? "default" : originalType) : "system";

    try {
      await mutations.setFeatureType(item._id, desiredType);
    } finally {
      setUpdatingFeatureTypeId(null);
    }
  };

  const handleSyncDefaults = async () => {
    setSyncingDefaults(true);
    try {
      await mutations.syncDefaults(workspaceId);
    } finally {
      setSyncingDefaults(false);
    }
  };

  // Layout configuration
  const showTreeSidebar = state.activeTab === "installed" && state.viewMode === "tree";

  const headerProps: SecondarySidebarHeaderProps = {
    title: "Menu Store",
    description: "Manage workspace menus and install new features",
    secondaryActions:
      state.activeTab === "installed" ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncDefaults}
            disabled={state.syncingDefaults}
            className="gap-2"
          >
            {state.syncingDefaults ? (
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
      state.activeTab === "installed"
        ? {
            label: "Add Menu",
            icon: Plus,
            onClick: () => setShowForm(true),
          }
        : undefined,
    children: (
      <Tabs
        value={state.activeTab}
        onValueChange={(value) => setActiveTab(value as typeof state.activeTab)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
    toolbar:
      state.activeTab === "installed" ? (
        <div className="space-y-3">
          <BreadcrumbNavigation
            workspaceId={workspaceId}
            currentMenuItemId={state.selectedItemId}
            onNavigate={setSelectedItemId}
          />
          <SecondarySidebarTools
            search={{
              value: state.searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search menu items...",
            }}
            viewOptions={[
              { label: "Tree", value: "tree", icon: LayoutList },
              { label: "Grid", value: "grid", icon: LayoutGrid },
            ]}
            currentView={state.viewMode}
            onViewChange={(value) => setViewMode(value as typeof state.viewMode)}
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
                selectedItemId={state.selectedItemId}
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
        <Tabs value={state.activeTab} className="flex flex-1 flex-col overflow-hidden">
          <TabsContent value="installed" className="mt-0 flex flex-1 overflow-hidden">
            <InstalledSection
              workspaceId={workspaceId}
              viewMode={state.viewMode}
              showForm={state.showForm}
              selectedItemId={state.selectedItemId}
              editingItemId={state.editingItemId}
              filteredItems={filteredItems}
              updatingFeatureTypeId={state.updatingFeatureTypeId}
              onItemSelect={setSelectedItemId}
              onItemEdit={handleEditItem}
              onItemRename={openRenameDialog}
              onItemDuplicate={(item) => mutations.duplicateMenuItem(item._id)}
              onItemShare={handleShareItem}
              onItemDelete={handleDeleteItem}
              onFeatureTypeChange={handleFeatureTypeChange}
              onFormSave={handleFormSave}
              onFormCancel={handleFormCancel}
            />
          </TabsContent>

          <TabsContent value="available" className="mt-0 flex-1 overflow-y-auto">
            <AvailableSection
              features={availableFeatures}
              installingFeatures={state.installingFeatures}
              onInstall={handleInstallFeature}
            />
          </TabsContent>

          <TabsContent value="import" className="mt-0 flex-1 overflow-y-auto">
            <ImportSection
              importMenuId={state.importMenuId}
              importing={state.importing}
              onIdChange={setImportMenuId}
              onImport={handleImportMenu}
            />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <RenameDialog
          state={state.renameDialog}
          onClose={closeRenameDialog}
          onNameChange={setRenameDialogName}
          onConfirm={handleRenameConfirm}
        />
        <ShareDialog state={state.shareDialog} onClose={closeShareDialog} />
      </SecondarySidebarLayout>
    </MenuStoreMenuWrapper>
  );
}
