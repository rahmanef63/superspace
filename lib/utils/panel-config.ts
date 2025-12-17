/**
 * Panel Configuration Utilities
 * 
 * Centralized panel mode configurations for workspace store
 */

import { Info, Layers, Package, Sliders, Download, Check, type LucideIcon } from "lucide-react"

/**
 * Panel modes for workspace store
 */
export type PanelMode = "inspector" | "features" | "available" | "settings" | "import"

/**
 * Panel configuration interface
 */
export interface PanelConfig {
    mode: PanelMode
    title: string
    icon: LucideIcon
    getSubtitle: (context: PanelContext) => string
    requiresWorkspace: boolean
    group: "contextual" | "global"
}

/**
 * Context for panel subtitle generation
 */
export interface PanelContext {
    selectedWorkspace?: { name: string } | null
    featureCount?: number
    templateCount?: number
}

/**
 * Tab configuration for panel navigation
 */
export interface TabConfig {
    mode: PanelMode
    label: string
    icon: LucideIcon
    requiresWorkspace: boolean
    group: "contextual" | "global"
    tooltip?: string
}

/**
 * Panel configurations
 */
const PANEL_CONFIGS: Record<PanelMode, PanelConfig> = {
    inspector: {
        mode: "inspector",
        title: "Inspector",
        icon: Info,
        getSubtitle: (ctx) => ctx.selectedWorkspace
            ? "Workspace Details"
            : "Select a workspace",
        requiresWorkspace: true,
        group: "contextual"
    },
    features: {
        mode: "features",
        title: "Features",
        icon: Check,
        getSubtitle: (ctx) => ctx.selectedWorkspace
            ? `${ctx.featureCount ?? 0} features installed`
            : "Select a workspace",
        requiresWorkspace: true,
        group: "contextual"
    },
    settings: {
        mode: "settings",
        title: "Feature Settings",
        icon: Sliders,
        getSubtitle: () => "Configure installed features",
        requiresWorkspace: true,
        group: "contextual"
    },
    available: {
        mode: "available",
        title: "Available Templates",
        icon: Package,
        getSubtitle: (ctx) => `${ctx.templateCount ?? 0} templates available`,
        requiresWorkspace: false,
        group: "global"
    },
    import: {
        mode: "import",
        title: "Import Workspace",
        icon: Download,
        getSubtitle: () => "Import from another source",
        requiresWorkspace: false,
        group: "global"
    },
}

/**
 * Get panel configuration
 */
export function getPanelConfig(mode: PanelMode): PanelConfig {
    return PANEL_CONFIGS[mode]
}

/**
 * Get panel title
 */
export function getPanelTitle(mode: PanelMode): string {
    return PANEL_CONFIGS[mode].title
}

/**
 * Get panel subtitle
 */
export function getPanelSubtitle(mode: PanelMode, context: PanelContext): string {
    return PANEL_CONFIGS[mode].getSubtitle(context)
}

/**
 * Get panel icon
 */
export function getPanelIcon(mode: PanelMode): LucideIcon {
    return PANEL_CONFIGS[mode].icon
}

/**
 * Get all tab configurations
 */
export function getPanelTabs(): TabConfig[] {
    return [
        {
            mode: "inspector",
            label: "Inspector",
            icon: Info,
            requiresWorkspace: true,
            group: "contextual",
            tooltip: "View Details"
        },
        {
            mode: "features",
            label: "Installed",
            icon: Check,
            requiresWorkspace: true,
            group: "contextual",
            tooltip: "Manage Features"
        },
        {
            mode: "settings",
            label: "Settings",
            icon: Sliders,
            requiresWorkspace: true,
            group: "contextual",
            tooltip: "Feature Settings"
        },
        {
            mode: "available",
            label: "Browse",
            icon: Package,
            requiresWorkspace: false,
            group: "global",
            tooltip: "Browse all available features and templates"
        },
        {
            mode: "import",
            label: "Import",
            icon: Download,
            requiresWorkspace: false,
            group: "global"
        },
    ]
}

/**
 * Get tabs by group
 */
export function getTabsByGroup(group: "contextual" | "global"): TabConfig[] {
    return getPanelTabs().filter(tab => tab.group === group)
}

/**
 * Check if mode requires workspace selection
 */
export function requiresWorkspace(mode: PanelMode): boolean {
    return PANEL_CONFIGS[mode].requiresWorkspace
}
