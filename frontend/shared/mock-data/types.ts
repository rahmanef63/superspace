/**
 * Mock Data Types for Guest Dashboard
 * Supports multiple workspaces with unique menus and nested structures
 */

import type { Id } from "@/convex/_generated/dataModel";

// Icon names from lucide-react
export type IconName = string;

/**
 * Mock workspace document structure
 */
export interface MockWorkspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: IconName;
    color?: string;
    parentId?: string | null;
    children?: MockWorkspace[];
}

/**
 * Mock menu item for sidebar navigation
 */
export interface MockMenuItem {
    id: string;
    label: string;
    slug: string;
    icon: IconName;
    badge?: string | number;
    disabled?: boolean;
    children?: MockMenuItem[];
}

/**
 * Complete workspace configuration with menu
 */
export interface WorkspaceConfig {
    workspace: MockWorkspace;
    menuItems: MockMenuItem[];
    /** Feature IDs enabled for this workspace */
    enabledFeatures?: string[];
}

/**
 * Mock system feature for feature store
 * Compatible with SystemFeatureVisibility interface
 */
export interface MockSystemFeature {
    featureId: string;
    name: string;
    description: string;
    icon: IconName;
    category: string;
    isInstalled: boolean;
    isPremium?: boolean;
    isEnabled: boolean;
    isPublic: boolean;
    isReady: boolean;
    status: string;
}

/**
 * All workspaces registry
 */
export interface MockDataRegistry {
    workspaces: WorkspaceConfig[];
    systemFeatures: MockSystemFeature[];
}
