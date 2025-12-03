/**
 * IDE Layout Types
 * 
 * Type definitions for VS Code-style IDE layout with resizable panels
 * and drag-and-drop support.
 */

import type { LucideIcon } from "lucide-react"

// Panel positions in the IDE layout
export type PanelPosition = 
  | "activity-bar"   // Left icon bar (fixed width)
  | "primary"        // Left sidebar (resizable)
  | "editor"         // Main editor area
  | "secondary"      // Right sidebar (resizable)
  | "panel"          // Bottom panel (resizable)

// Panel visibility states
export type PanelState = "visible" | "collapsed" | "hidden"

// Activity bar item configuration
export interface ActivityBarItem {
  id: string
  icon: LucideIcon
  label: string
  tooltip?: string
  badge?: number | string
  isActive?: boolean
  onClick?: () => void
}

// Editor tab configuration
export interface EditorTab {
  id: string
  title: string
  icon?: LucideIcon
  isDirty?: boolean        // Unsaved changes indicator
  isPinned?: boolean       // Pinned tab (won't close)
  isPreview?: boolean      // Preview mode (italicized)
  closable?: boolean
  tooltip?: string
}

// Panel configuration
export interface PanelConfig {
  id: string
  position: PanelPosition
  title?: string
  icon?: LucideIcon
  minSize?: number         // Minimum size in percentage
  maxSize?: number         // Maximum size in percentage
  defaultSize?: number     // Default size in percentage
  collapsible?: boolean
  defaultCollapsed?: boolean
}

// Layout configuration
export interface IDELayoutConfig {
  activityBar?: {
    visible?: boolean
    position?: "left" | "right"
    items?: ActivityBarItem[]
  }
  primarySidebar?: {
    visible?: boolean
    defaultSize?: number
    minSize?: number
    maxSize?: number
  }
  secondarySidebar?: {
    visible?: boolean
    defaultSize?: number
    minSize?: number
    maxSize?: number
  }
  panel?: {
    visible?: boolean
    defaultSize?: number
    minSize?: number
    maxSize?: number
    position?: "bottom" | "right"
  }
}

// Layout state (for persistence)
export interface IDELayoutState {
  activityBarActive?: string
  primaryVisible?: boolean
  primarySize?: number
  secondaryVisible?: boolean
  secondarySize?: number
  panelVisible?: boolean
  panelSize?: number
  editorTabs?: EditorTab[]
  activeTabId?: string
}

// Props for main IDE layout component
export interface IDELayoutProps {
  config?: IDELayoutConfig
  initialState?: IDELayoutState
  onStateChange?: (state: IDELayoutState) => void
  persistKey?: string            // localStorage key for persisting layout
  
  // Slot props for custom content
  activityBar?: React.ReactNode
  primarySidebar?: React.ReactNode
  secondarySidebar?: React.ReactNode
  panel?: React.ReactNode
  children?: React.ReactNode     // Main editor content
  
  className?: string
}

// Props for individual panels
export interface IDEPanelProps {
  children?: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

// Activity bar props
export interface IDEActivityBarProps {
  items: ActivityBarItem[]
  activeId?: string
  onItemClick?: (id: string) => void
  position?: "left" | "right"
  className?: string
}

// Editor tabs props
export interface IDEEditorTabsProps {
  tabs: EditorTab[]
  activeId?: string
  onTabClick?: (id: string) => void
  onTabClose?: (id: string) => void
  onTabReorder?: (fromIndex: number, toIndex: number) => void
  onTabPin?: (id: string) => void
  className?: string
}

// Panel header props
export interface IDEPanelHeaderProps {
  title?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  onCollapse?: () => void
  onClose?: () => void
  className?: string
}
