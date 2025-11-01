import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { FunctionReference } from "convex/server";

const menuStoreMenuItems = (api as any)["features/menus/menuItems"];

/**
 * Convex API references for menu operations
 */
export const menuApi = {
  // Queries
  queries: {
    getWorkspaceMenuItems: menuStoreMenuItems.getWorkspaceMenuItems as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces"> }
    >,
    getMenuItem: menuStoreMenuItems.getMenuItem as FunctionReference<
      "query",
      "public",
      { menuItemId: Id<"menuItems"> }
    >,
    getMenuItemBySlug: menuStoreMenuItems.getMenuItemBySlug as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces">; slug: string }
    >,
    getAvailableFeatureMenus: menuStoreMenuItems.getAvailableFeatureMenus as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces"> }
    >,
    getMenuBreadcrumbs: menuStoreMenuItems.getMenuBreadcrumbs as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces">; menuItemId?: Id<"menuItems"> }
    >,
  },

  // Mutations
  mutations: {
    createMenuItem: menuStoreMenuItems.createMenuItem,
    updateMenuItem: menuStoreMenuItems.updateMenuItem,
    deleteMenuItem: menuStoreMenuItems.deleteMenuItem,
    updateMenuOrder: menuStoreMenuItems.updateMenuOrder,
    renameMenuItem: menuStoreMenuItems.renameMenuItem,
    duplicateMenuItem: menuStoreMenuItems.duplicateMenuItem,
    shareMenuItem: menuStoreMenuItems.shareMenuItem,
    importMenuFromShareableId: menuStoreMenuItems.importMenuFromShareableId,
    installFeatureMenus: menuStoreMenuItems.installFeatureMenus,
    setMenuItemComponent: menuStoreMenuItems.setMenuItemComponent,
    setMenuItemFeatureType: menuStoreMenuItems.setMenuItemFeatureType,
    syncWorkspaceDefaultMenus: menuStoreMenuItems.syncWorkspaceDefaultMenus,
  },
};

export default menuApi;

