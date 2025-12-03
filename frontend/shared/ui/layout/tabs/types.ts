/**
 * Tabs System Type Definitions
 * 
 * Standardized types for tabs across the application.
 * Supports various tab styles, orientations, and configurations.
 */

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

// ============================================================================
// Tab Item Types
// ============================================================================

/**
 * Individual tab item configuration
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string
  /** Display label for the tab */
  label: string
  /** Optional icon (Lucide icon component) */
  icon?: LucideIcon
  /** Tab content (rendered when active) */
  content?: ReactNode
  /** Whether tab is disabled */
  disabled?: boolean
  /** Badge text or count */
  badge?: string | number
  /** Custom class names for this tab */
  className?: string
  /** Metadata for extensibility */
  meta?: Record<string, unknown>
}

/**
 * Tab with required content
 */
export interface TabItemWithContent extends TabItem {
  content: ReactNode
}

// ============================================================================
// Tab Styles & Variants
// ============================================================================

/**
 * Visual style variants for tabs
 */
export type TabVariant = 
  | "default"      // Standard underline/pill tabs
  | "pills"        // Pill-shaped background
  | "underline"    // Underline indicator
  | "boxed"        // Boxed/bordered tabs
  | "segment"      // iOS-style segmented control
  | "minimal"      // Minimal with hover effects only

/**
 * Tab size variants
 */
export type TabSize = "sm" | "md" | "lg"

/**
 * Tab orientation
 */
export type TabOrientation = "horizontal" | "vertical"

/**
 * Tab alignment within container
 */
export type TabAlignment = "start" | "center" | "end" | "stretch"

// ============================================================================
// Tab Container Props
// ============================================================================

/**
 * Props for the main Tabs container
 */
export interface TabsProps {
  /** Array of tab items */
  tabs: TabItem[]
  /** Currently active tab ID (controlled) */
  activeTab?: string
  /** Default active tab ID (uncontrolled) */
  defaultActiveTab?: string
  /** Callback when active tab changes */
  onTabChange?: (tabId: string) => void
  
  // Styling
  /** Visual variant */
  variant?: TabVariant
  /** Size variant */
  size?: TabSize
  /** Tab orientation */
  orientation?: TabOrientation
  /** Tab alignment */
  alignment?: TabAlignment
  /** Full width tabs */
  fullWidth?: boolean
  
  // Features
  /** Enable keyboard navigation */
  keyboard?: boolean
  /** Lazy load tab content (only render active) */
  lazy?: boolean
  /** Keep mounted (don't unmount inactive tabs) */
  keepMounted?: boolean
  /** Allow deselection (clicking active tab deselects) */
  allowDeselect?: boolean
  
  // Customization
  /** Additional class for tabs container */
  className?: string
  /** Additional class for tab list */
  tabListClassName?: string
  /** Additional class for tab panels */
  panelClassName?: string
  /** Render function for custom tab trigger */
  renderTab?: (tab: TabItem, isActive: boolean) => ReactNode
  /** Render function for custom tab panel */
  renderPanel?: (tab: TabItem, isActive: boolean) => ReactNode
}

/**
 * Props for TabsList component (compound pattern)
 */
export interface TabsListProps {
  children: ReactNode
  className?: string
  /** Override variant from parent */
  variant?: TabVariant
  /** Override size from parent */
  size?: TabSize
  /** Override alignment from parent */
  alignment?: TabAlignment
}

/**
 * Props for individual TabsTrigger
 */
export interface TabsTriggerProps {
  /** Tab ID to activate */
  value: string
  /** Tab label content */
  children: ReactNode
  /** Icon to display */
  icon?: LucideIcon
  /** Badge content */
  badge?: string | number
  /** Whether disabled */
  disabled?: boolean
  /** Additional class names */
  className?: string
}

/**
 * Props for TabsContent panel
 */
export interface TabsContentProps {
  /** Tab ID this content belongs to */
  value: string
  /** Panel content */
  children: ReactNode
  /** Force mount (override lazy loading) */
  forceMount?: boolean
  /** Additional class names */
  className?: string
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * Context value for tabs
 */
export interface TabsContextValue {
  /** Currently active tab ID */
  activeTab: string | null
  /** Set active tab */
  setActiveTab: (id: string) => void
  /** Visual variant */
  variant: TabVariant
  /** Size variant */
  size: TabSize
  /** Orientation */
  orientation: TabOrientation
  /** Alignment */
  alignment: TabAlignment
  /** Lazy loading enabled */
  lazy: boolean
  /** Keep mounted enabled */
  keepMounted: boolean
  /** All registered tabs */
  tabs: Map<string, TabItem>
  /** Register a tab */
  registerTab: (tab: TabItem) => void
  /** Unregister a tab */
  unregisterTab: (id: string) => void
}

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Preset tab configurations for common use cases
 */
export interface TabPreset {
  variant: TabVariant
  size: TabSize
  orientation: TabOrientation
  alignment: TabAlignment
  fullWidth?: boolean
}

export const TAB_PRESETS = {
  /** Default horizontal tabs */
  default: {
    variant: "default" as TabVariant,
    size: "md" as TabSize,
    orientation: "horizontal" as TabOrientation,
    alignment: "start" as TabAlignment,
  },
  /** Pill-style tabs */
  pills: {
    variant: "pills" as TabVariant,
    size: "md" as TabSize,
    orientation: "horizontal" as TabOrientation,
    alignment: "start" as TabAlignment,
  },
  /** Full-width segment control */
  segment: {
    variant: "segment" as TabVariant,
    size: "md" as TabSize,
    orientation: "horizontal" as TabOrientation,
    alignment: "stretch" as TabAlignment,
    fullWidth: true,
  },
  /** Vertical sidebar tabs */
  sidebar: {
    variant: "pills" as TabVariant,
    size: "md" as TabSize,
    orientation: "vertical" as TabOrientation,
    alignment: "stretch" as TabAlignment,
  },
  /** Compact underline tabs */
  compact: {
    variant: "underline" as TabVariant,
    size: "sm" as TabSize,
    orientation: "horizontal" as TabOrientation,
    alignment: "start" as TabAlignment,
  },
} as const

export type TabPresetName = keyof typeof TAB_PRESETS
