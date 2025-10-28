import type { ReactNode } from "react";
import type { Id } from "@convex/_generated/dataModel";

import type {
  MenuItemRecord,
  SecondaryMenuFeatureConfig,
} from "../types";
import { SecondaryMenuProvider } from "../context";

export interface SecondaryMenuWrapperProps {
  workspaceId: Id<"workspaces">;
  children: ReactNode;
  menuItemsOverride?: MenuItemRecord[];
  isLoadingOverride?: boolean;
}

function createFeatureConfig(
  overrides: Partial<SecondaryMenuFeatureConfig>,
): SecondaryMenuFeatureConfig {
  return {
    allowDragAndDrop: overrides.allowDragAndDrop ?? true,
    allowRename: overrides.allowRename ?? true,
    allowEditDetails: overrides.allowEditDetails ?? true,
    allowDelete: overrides.allowDelete ?? true,
    allowDuplicate: overrides.allowDuplicate ?? true,
    allowAppearanceChange: overrides.allowAppearanceChange ?? true,
    showPreviewPanel: overrides.showPreviewPanel ?? false,
    allowAvatarSelection: overrides.allowAvatarSelection ?? false,
    avatarMode: overrides.avatarMode ?? "both",
    enableDatabaseSheet: overrides.enableDatabaseSheet ?? false,
    allowFeatureInstall: overrides.allowFeatureInstall ?? true,
    allowSharing: overrides.allowSharing ?? true,
  };
}

export function MenuStoreMenuWrapper({
  workspaceId,
  children,
  menuItemsOverride,
  isLoadingOverride,
}: SecondaryMenuWrapperProps) {
  const featureConfig = createFeatureConfig({
    showPreviewPanel: false,
    allowAvatarSelection: false,
    allowFeatureInstall: true,
    allowSharing: true,
  });

  return (
    <SecondaryMenuProvider
      workspaceId={workspaceId}
      featureConfig={featureConfig}
      menuItemsOverride={menuItemsOverride}
      isLoadingOverride={isLoadingOverride}
    >
      {children}
    </SecondaryMenuProvider>
  );
}

export function ChatMenuWrapper({
  workspaceId,
  children,
  menuItemsOverride,
  isLoadingOverride,
}: SecondaryMenuWrapperProps) {
  const featureConfig = createFeatureConfig({
    allowDragAndDrop: false,
    allowDuplicate: false,
    allowFeatureInstall: false,
    allowSharing: false,
    showPreviewPanel: true,
    allowAvatarSelection: true,
    avatarMode: "both",
  });

  return (
    <SecondaryMenuProvider
      workspaceId={workspaceId}
      featureConfig={featureConfig}
      menuItemsOverride={menuItemsOverride}
      isLoadingOverride={isLoadingOverride}
    >
      {children}
    </SecondaryMenuProvider>
  );
}

export function DocumentMenuWrapper({
  workspaceId,
  children,
  menuItemsOverride,
  isLoadingOverride,
}: SecondaryMenuWrapperProps) {
  const featureConfig = createFeatureConfig({
    enableDatabaseSheet: true,
    showPreviewPanel: true,
    allowFeatureInstall: false,
    allowSharing: false,
  });

  return (
    <SecondaryMenuProvider
      workspaceId={workspaceId}
      featureConfig={featureConfig}
      menuItemsOverride={menuItemsOverride}
      isLoadingOverride={isLoadingOverride}
    >
      {children}
    </SecondaryMenuProvider>
  );
}
