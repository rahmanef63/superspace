import { useQuery } from "convex/react";
import { Id } from "@convex/_generated/dataModel";
import { menuApi } from "../api/menuApi";
import { MenuItemRecord } from "../types";

/**
 * Hook to fetch workspace menu items
 */
export function useMenuItems(workspaceId: Id<"workspaces">) {
  const menuItems = useQuery(menuApi.queries.getWorkspaceMenuItems, {
    workspaceId,
  }) as MenuItemRecord[] | undefined;

  return {
    menuItems: menuItems ?? [],
    isLoading: menuItems === undefined,
  };
}

/**
 * Hook to fetch a single menu item
 */
export function useMenuItem(menuItemId?: Id<"menuItems">) {
  const menuItem = useQuery(
    menuApi.queries.getMenuItem,
    menuItemId ? { menuItemId } : "skip"
  ) as MenuItemRecord | null | undefined;

  return {
    menuItem: menuItem ?? null,
    isLoading: menuItem === undefined,
  };
}

/**
 * Hook to fetch menu item by slug
 */
export function useMenuItemBySlug(
  workspaceId: Id<"workspaces">,
  slug: string
) {
  const menuItem = useQuery(menuApi.queries.getMenuItemBySlug, {
    workspaceId,
    slug,
  }) as MenuItemRecord | null | undefined;

  return {
    menuItem: menuItem ?? null,
    isLoading: menuItem === undefined,
  };
}

/**
 * Hook to fetch available feature menus
 */
export function useAvailableFeatures(workspaceId: Id<"workspaces">) {
  const features = useQuery(menuApi.queries.getAvailableFeatureMenus, {
    workspaceId,
  });

  return {
    features: features ?? [],
    isLoading: features === undefined,
  };
}
