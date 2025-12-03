import { api } from "@convex/_generated/api";

/**
 * Menu Store API endpoints
 * Centralized API calls for menu management
 */
export const menuStoreApi = {
  // Queries
  getWorkspaceMenuItems: (api as any)["features/menus/menuItems"].getWorkspaceMenuItems,
  getAvailableFeatureMenus: (api as any)["features/menus/menuItems"].getAvailableFeatureMenus,

  // Mutations
  createMenuItem: (api as any)["features/menus/menuItems"].createMenuItem,
  updateMenuItem: (api as any)["features/menus/menuItems"].updateMenuItem,
  deleteMenuItem: (api as any)["features/menus/menuItems"].deleteMenuItem,
  installFeatureMenus: (api as any)["features/menus/menuItems"].installFeatureMenus,
  renameMenuItem: (api as any)["features/menus/menuItems"].renameMenuItem,
  duplicateMenuItem: (api as any)["features/menus/menuItems"].duplicateMenuItem,
  shareMenuItem: (api as any)["features/menus/menuItems"].shareMenuItem,
  importMenuFromShareableId: (api as any)["features/menus/menuItems"].importMenuFromShareableId,
  setMenuItemFeatureType: (api as any)["features/menus/menuItems"].setMenuItemFeatureType,
  syncWorkspaceDefaultMenus: (api as any)["features/menus/menuItems"].syncWorkspaceDefaultMenus,
} as const;
