import { useMutation } from "convex/react";
import { Id } from "@convex/_generated/dataModel";
import { menuApi } from "../api/menuApi";
import { MenuItemType, MenuItemMetadata } from "../types";

/**
 * Hook for menu item mutations
 */
export function useMenuMutations() {
  const createMenuItem = useMutation(menuApi.mutations.createMenuItem);
  const updateMenuItem = useMutation(menuApi.mutations.updateMenuItem);
  const deleteMenuItem = useMutation(menuApi.mutations.deleteMenuItem);
  const updateMenuOrder = useMutation(menuApi.mutations.updateMenuOrder);
  const renameMenuItem = useMutation(menuApi.mutations.renameMenuItem);
  const duplicateMenuItem = useMutation(menuApi.mutations.duplicateMenuItem);
  const shareMenuItem = useMutation(menuApi.mutations.shareMenuItem);
  const importMenuFromShareableId = useMutation(
    menuApi.mutations.importMenuFromShareableId
  );
  const installFeatureMenus = useMutation(
    menuApi.mutations.installFeatureMenus
  );
  const setMenuItemFeatureType = useMutation(
    menuApi.mutations.setMenuItemFeatureType
  );
  const syncWorkspaceDefaultMenus = useMutation(
    menuApi.mutations.syncWorkspaceDefaultMenus
  );

  return {
    createMenuItem: async (params: {
      workspaceId: Id<"workspaces">;
      parentId?: Id<"menuItems">;
      name: string;
      slug: string;
      type: MenuItemType;
      icon?: string;
      path?: string;
      component?: string;
      order?: number;
      isVisible?: boolean;
      visibleForRoleIds?: Id<"roles">[];
      metadata?: MenuItemMetadata;
    }) => {
      return await createMenuItem(params);
    },

    updateMenuItem: async (params: {
      menuItemId: Id<"menuItems">;
      name?: string;
      slug?: string;
      type?: MenuItemType;
      icon?: string;
      path?: string;
      component?: string;
      isVisible?: boolean;
      order?: number;
      parentId?: Id<"menuItems"> | null;
      visibleForRoleIds?: Id<"roles">[];
      metadata?: MenuItemMetadata;
    }) => {
      return await updateMenuItem(params);
    },

    deleteMenuItem: async (menuItemId: Id<"menuItems">) => {
      return await deleteMenuItem({ menuItemId });
    },

    updateMenuOrder: async (params: {
      menuItemId: Id<"menuItems">;
      newOrder: number;
      parentId?: Id<"menuItems"> | null;
    }) => {
      return await updateMenuOrder(params);
    },

    renameMenuItem: async (menuItemId: Id<"menuItems">, name: string) => {
      return await renameMenuItem({ menuItemId, name });
    },

    duplicateMenuItem: async (
      menuItemId: Id<"menuItems">,
      newName?: string
    ) => {
      return await duplicateMenuItem({ menuItemId, newName });
    },

    shareMenuItem: async (menuItemId: Id<"menuItems">) => {
      return await shareMenuItem({ menuItemId });
    },

    importMenuFromShareableId: async (
      workspaceId: Id<"workspaces">,
      shareableId: string,
      newName?: string
    ) => {
      return await importMenuFromShareableId({
        workspaceId,
        shareableId,
        newName,
      });
    },

    installFeatureMenus: async (params: {
      workspaceId: Id<"workspaces">;
      featureSlugs: string[];
      forceUpdate?: boolean;
    }) => {
      return await installFeatureMenus(params);
    },

    setMenuItemFeatureType: async (
      menuItemId: Id<"menuItems">,
      featureType: "default" | "system" | "optional"
    ) => {
      return await setMenuItemFeatureType({ menuItemId, featureType });
    },

    syncWorkspaceDefaultMenus: async (
      workspaceId: Id<"workspaces">,
      featureSlugs?: string[]
    ) => {
      return await syncWorkspaceDefaultMenus({ workspaceId, featureSlugs });
    },
  };
}
