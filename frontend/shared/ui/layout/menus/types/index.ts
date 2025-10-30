import { Id } from "@convex/_generated/dataModel";
import { ElementType } from "react";

// Core menu item type
export interface MenuItemRecord {
  _id: Id<"menuItems">;
  workspaceId: Id<"workspaces">;
  menuSetId?: Id<"menuSets">;
  parentId?: Id<"menuItems">;
  name: string;
  slug: string;
  type: MenuItemType;
  icon?: string;
  path?: string;
  component?: string;
  order: number;
  isVisible: boolean;
  visibleForRoleIds: Id<"roles">[];
  metadata?: MenuItemMetadata;
  createdBy?: Id<"users">;
  children?: MenuItemRecord[];
}

// Menu item types
export type MenuItemType =
  | "folder"
  | "route"
  | "document"
  | "chat"
  | "database"
  | "action"
  | "divider";

// Menu item metadata
export interface MenuItemMetadata {
  description?: string;
  badge?: string;
  color?: string;
  version?: string;
  category?: string;
  lastUpdated?: number;
  previousVersion?: string;
  targetId?: string;
  jsonPlaceholder?: Record<string, any>;
  avatarStyle?: "icon" | "profile";
  featureType?: "default" | "system" | "optional" | "experimental" | "custom";
  originalFeatureType?: "default" | "system" | "optional" | "experimental";
  requiresPermission?: string;
  originalRequiresPermission?: string;
}

// Tree node type for rendering (with guaranteed children array)
export interface MenuTreeNode extends MenuItemRecord {
  children: MenuTreeNode[];
}

// Available feature type
export interface AvailableFeature {
  slug: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  category: string;
  featureType?: "default" | "system" | "optional" | "experimental";
}

// Share result type
export interface ShareMenuResult {
  shareableId: string;
  menuItemId: Id<"menuItems">;
  name: string;
  slug: string;
}

// Import result type
export interface ImportMenuResult {
  menuItemId: Id<"menuItems">;
  imported: boolean;
  sourceName: string;
}

// Drop position type
export type DropPosition = "above" | "below" | "inside";

// Drop preview type
export interface DropPreview {
  id: string;
  position: DropPosition;
}

// Form data type
export interface MenuItemFormData {
  name: string;
  slug: string;
  type: MenuItemType;
  icon: string;
  path: string;
  component: string;
  description: string;
  badge: string;
  color: string;
}

// Dialog mode type
export type DialogMode = "create" | "edit" | null;

// Dialog state type
export interface DialogState {
  mode: DialogMode;
  itemId?: Id<"menuItems">;
  parentId?: Id<"menuItems">;
  data: MenuItemFormData;
}

// Breadcrumb item type
export interface MenuBreadcrumbItem {
  _id: Id<"menuItems">;
  name: string;
  parentId?: Id<"menuItems">;
}

// Component props types
export interface MenuStoreProps {
  workspaceId: Id<"workspaces">;
}

export interface MenuDisplayProps {
  workspaceId: Id<"workspaces">;
  menuItemId?: Id<"menuItems">;
  enableActions?: boolean;
  onSelect?: (item: MenuItemRecord) => void;
  featureConfig?: Partial<SecondaryMenuFeatureConfig>;
  variant?: "menu" | "chat" | "document";
  onOpenDatabaseSheet?: (item: MenuItemRecord) => void;
}

export interface MenuItemFormProps {
  workspaceId: Id<"workspaces">;
  parentId?: Id<"menuItems">;
  editingItemId?: Id<"menuItems">;
  onSave: () => void;
  onCancel: () => void;
}

export interface DragDropMenuTreeProps {
  workspaceId: Id<"workspaces">;
  onItemSelect: (itemId: Id<"menuItems">) => void;
  selectedItemId?: Id<"menuItems">;
  featureConfig?: Partial<SecondaryMenuFeatureConfig>;
}

export interface MenuTreeProps {
  workspaceId: Id<"workspaces">;
  onItemSelect?: (itemId: Id<"menuItems">) => void;
  selectedItemId?: Id<"menuItems">;
  showActions?: boolean;
}

export interface BreadcrumbNavigationProps {
  workspaceId: Id<"workspaces">;
  currentMenuItemId?: Id<"menuItems">;
  onNavigate: (menuItemId?: Id<"menuItems">) => void;
}

// Menu item type options for forms
export const MENU_ITEM_TYPES: Array<{ value: MenuItemType; label: string }> = [
  { value: 'folder', label: 'Folder' },
  { value: 'route', label: 'Route' },
  { value: 'document', label: 'Document' },
  { value: 'chat', label: 'Chat' },
  { value: 'action', label: 'Action' },
  { value: 'divider', label: 'Divider' }
];

// Color constants
export const ACCENT_COLORS = {
  primary: 'var(--accent, rgba(59,130,246,0.68))',
  background: 'var(--accent, rgba(59,130,246,0.12))',
  boundary: 'var(--accent, rgba(59,130,246,0.45))',
} as const;

// Drop threshold for drag and drop
export const DROP_THRESHOLD = 0.3;

export type SecondaryMenuAvatarMode = "icon" | "profile" | "both";

export interface SecondaryMenuFeatureConfig {
  allowDragAndDrop: boolean;
  allowRename: boolean;
  allowEditDetails: boolean;
  allowDelete: boolean;
  allowDuplicate: boolean;
  allowAppearanceChange: boolean;
  showPreviewPanel: boolean;
  allowAvatarSelection: boolean;
  avatarMode: SecondaryMenuAvatarMode;
  enableDatabaseSheet: boolean;
  allowFeatureInstall: boolean;
  allowSharing: boolean;
}

export const DEFAULT_MENU_FEATURE_CONFIG: SecondaryMenuFeatureConfig = {
  allowDragAndDrop: true,
  allowRename: true,
  allowEditDetails: true,
  allowDelete: true,
  allowDuplicate: true,
  allowAppearanceChange: true,
  showPreviewPanel: false,
  allowAvatarSelection: false,
  avatarMode: "both",
  enableDatabaseSheet: false,
  allowFeatureInstall: true,
  allowSharing: true,
};
