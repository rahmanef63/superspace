import { api } from "@convex/_generated/api";

/**
 * Menu Store API endpoints
 * Centralized API calls for menu management
 */
export const menuStoreApi = {
  // Queries
  getWorkspaceMenuItems: api.menu.store.menuItems.getWorkspaceMenuItems,
  getAvailableFeatureMenus: api.menu.store.menuItems.getAvailableFeatureMenus,

  // Mutations
  deleteMenuItem: api.menu.store.menuItems.deleteMenuItem,
  installFeatureMenus: api.menu.store.menuItems.installFeatureMenus,
  renameMenuItem: api.menu.store.menuItems.renameMenuItem,
  duplicateMenuItem: api.menu.store.menuItems.duplicateMenuItem,
  shareMenuItem: api.menu.store.menuItems.shareMenuItem,
  importMenuFromShareableId: api.menu.store.menuItems.importMenuFromShareableId,
  setMenuItemFeatureType: api.menu.store.menuItems.setMenuItemFeatureType,
  syncWorkspaceDefaultMenus: api.menu.store.menuItems.syncWorkspaceDefaultMenus,
} as const;
