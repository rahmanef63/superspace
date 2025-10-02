import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { FunctionReference } from "convex/server";

/**
 * Convex API references for menu operations
 */
export const menuApi = {
  // Queries
  queries: {
    getWorkspaceMenuItems: api["menu/store/menuItems"].getWorkspaceMenuItems as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces"> }
    >,
    getMenuItem: api["menu/store/menuItems"].getMenuItem as FunctionReference<
      "query",
      "public",
      { menuItemId: Id<"menuItems"> }
    >,
    getMenuItemBySlug: api["menu/store/menuItems"].getMenuItemBySlug as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces">; slug: string }
    >,
    getAvailableFeatureMenus: api["menu/store/menuItems"].getAvailableFeatureMenus as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces"> }
    >,
    getMenuBreadcrumbs: api["menu/store/menuItems"].getMenuBreadcrumbs as FunctionReference<
      "query",
      "public",
      { workspaceId: Id<"workspaces">; menuItemId?: Id<"menuItems"> }
    >,
  },

  // Mutations
  mutations: {
    createMenuItem: api["menu/store/menuItems"].createMenuItem,
    updateMenuItem: api["menu/store/menuItems"].updateMenuItem,
    deleteMenuItem: api["menu/store/menuItems"].deleteMenuItem,
    updateMenuOrder: api["menu/store/menuItems"].updateMenuOrder,
    renameMenuItem: api["menu/store/menuItems"].renameMenuItem,
    duplicateMenuItem: api["menu/store/menuItems"].duplicateMenuItem,
    shareMenuItem: api["menu/store/menuItems"].shareMenuItem,
    importMenuFromShareableId: api["menu/store/menuItems"].importMenuFromShareableId,
    installFeatureMenus: api["menu/store/menuItems"].installFeatureMenus,
    setMenuItemComponent: api["menu/store/menuItems"].setMenuItemComponent,
  },
};

export default menuApi;
