import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { Id } from "@convex/_generated/dataModel";

import { useMenuItems } from "../hooks/useMenuItems";
import { useMenuMutations } from "../hooks/useMenuMutations";
import type { MenuItemRecord, SecondaryMenuFeatureConfig } from "../types";
import { DEFAULT_MENU_FEATURE_CONFIG } from "../types";

type MenuMutations = ReturnType<typeof useMenuMutations>;

export interface SecondaryMenuContextValue {
  workspaceId: Id<"workspaces">;
  menuItems: MenuItemRecord[];
  isLoading: boolean;
  featureConfig: SecondaryMenuFeatureConfig;
  mutations: MenuMutations;
}

const SecondaryMenuContext = createContext<SecondaryMenuContextValue | null>(
  null,
);

export interface SecondaryMenuProviderProps {
  workspaceId: Id<"workspaces">;
  featureConfig?: SecondaryMenuFeatureConfig;
  /**
   * Optional override for menu items—useful when parent already fetched data.
   */
  menuItemsOverride?: MenuItemRecord[];
  isLoadingOverride?: boolean;
  children: ReactNode;
}

export function SecondaryMenuProvider({
  workspaceId,
  featureConfig,
  menuItemsOverride,
  isLoadingOverride,
  children,
}: SecondaryMenuProviderProps) {
  const { menuItems, isLoading } = useMenuItems(workspaceId);
  const mutations = useMenuMutations();

  const mergedConfig = useMemo<SecondaryMenuFeatureConfig>(
    () => ({
      ...DEFAULT_MENU_FEATURE_CONFIG,
      ...featureConfig,
    }),
    [featureConfig],
  );

  const value = useMemo<SecondaryMenuContextValue>(
    () => ({
      workspaceId,
      menuItems: menuItemsOverride ?? menuItems,
      isLoading: isLoadingOverride ?? isLoading,
      featureConfig: mergedConfig,
      mutations,
    }),
    [
      workspaceId,
      menuItemsOverride,
      menuItems,
      isLoadingOverride,
      isLoading,
      mergedConfig,
      mutations,
    ],
  );

  return (
    <SecondaryMenuContext.Provider value={value}>
      {children}
    </SecondaryMenuContext.Provider>
  );
}

export function useSecondaryMenuContext(): SecondaryMenuContextValue {
  const context = useContext(SecondaryMenuContext);
  if (!context) {
    throw new Error(
      "useSecondaryMenuContext must be used within a SecondaryMenuProvider",
    );
  }
  return context;
}

export function useSecondaryMenuFeatureConfig(): SecondaryMenuFeatureConfig {
  const context = useSecondaryMenuContext();
  return context.featureConfig;
}

export function useOptionalSecondaryMenuContext():
  | SecondaryMenuContextValue
  | null {
  return useContext(SecondaryMenuContext);
}
