/**
 * Unified DnD Types
 * 
 * Type definitions for the unified drag-and-drop system
 * Supports workspace-store, menu-store, and custom features
 */

import type { ReactNode, ComponentType } from "react"
import type { LucideIcon } from "lucide-react"

// ============================================================================
// Drop Position Types
// ============================================================================

/**
 * Position where an item can be dropped relative to target
 */
export type DropPosition = "above" | "below" | "inside"

/**
 * Drop preview state during drag operation
 */
export interface DropPreview {
  id: string
  position: DropPosition
}

// ============================================================================
// Tree Item Types
// ============================================================================

/**
 * Base tree item interface that all tree items must implement
 */
export interface BaseTreeItem {
  id: string
  name: string
  icon?: string
  color?: string
  parentId?: string | null
  order?: number
  children?: BaseTreeItem[]
  metadata?: Record<string, unknown>
}

/**
 * Generic tree node with children
 */
export interface TreeNode<T extends BaseTreeItem = BaseTreeItem> extends BaseTreeItem {
  children?: TreeNode<T>[]
  data?: T
}

// ============================================================================
// DnD Configuration
// ============================================================================

/**
 * Accent colors for drag and drop visuals
 */
export interface DnDAccentColors {
  primary: string
  boundary: string
  background: string
}

/**
 * Default accent colors - using blue for high visibility
 */
export const DEFAULT_ACCENT_COLORS: DnDAccentColors = {
  primary: "#3b82f6", // Blue-500 - high visibility for drop indicators
  boundary: "rgba(59, 130, 246, 0.5)", // Blue with 50% opacity
  background: "rgba(59, 130, 246, 0.15)", // Blue with 15% opacity for overlays
}

/**
 * DnD feature configuration
 */
export interface DnDFeatureConfig {
  /** Enable drag and drop */
  allowDragAndDrop?: boolean
  /** Allow renaming items inline */
  allowRename?: boolean
  /** Allow duplicating items */
  allowDuplicate?: boolean
  /** Allow deleting items */
  allowDelete?: boolean
  /** Allow changing icon/appearance */
  allowAppearanceChange?: boolean
  /** Allow dropping to root level */
  allowDropToRoot?: boolean
  /** Show action buttons on hover */
  showActions?: boolean
  /** Show grip handle */
  showGripHandle?: boolean
  /** Max depth for hierarchy */
  maxDepth?: number
  /** Threshold for above/below drop zones (0-0.5) */
  dropThreshold?: number
  /** Custom accent colors */
  accentColors?: Partial<DnDAccentColors>
  /** Indent size per level (px) */
  indentSize?: number
}

/**
 * Default DnD configuration
 */
export const DEFAULT_DND_CONFIG: Required<DnDFeatureConfig> = {
  allowDragAndDrop: true,
  allowRename: true,
  allowDuplicate: true,
  allowDelete: true,
  allowAppearanceChange: true,
  allowDropToRoot: true,
  showActions: true,
  showGripHandle: true,
  maxDepth: 6,
  dropThreshold: 0.25,
  accentColors: DEFAULT_ACCENT_COLORS,
  indentSize: 20,
}

// ============================================================================
// DnD State
// ============================================================================

/**
 * DnD state managed by the tree component
 */
export interface DnDState {
  isDragging: boolean
  draggedId: string | null
  dropPreview: DropPreview | null
  expandedIds: Set<string>
}

/**
 * DnD state actions
 */
export interface DnDStateActions {
  setDraggedId: (id: string | null) => void
  setDropPreview: (preview: DropPreview | null) => void
  clearDragState: () => void
  toggleExpanded: (id: string) => void
  expandItem: (id: string) => void
  collapseItem: (id: string) => void
}

// ============================================================================
// Tree Item Callbacks
// ============================================================================

/**
 * Move operation data
 */
export interface MoveOperation<T extends BaseTreeItem = BaseTreeItem> {
  itemId: string
  item: T
  fromParentId: string | null
  toParentId: string | null
  newOrder: number
  position: DropPosition
}

/**
 * Callbacks for tree item operations
 */
export interface TreeItemCallbacks<T extends BaseTreeItem = BaseTreeItem> {
  onSelect?: (item: T) => void
  onMove?: (operation: MoveOperation<T>) => Promise<void> | void
  onRename?: (item: T, newName: string) => Promise<void> | void
  onDuplicate?: (item: T) => Promise<void> | void
  onDelete?: (item: T) => Promise<void> | void
  onIconChange?: (item: T, newIcon: string) => Promise<void> | void
  onColorChange?: (item: T, newColor: string) => Promise<void> | void
  onAddChild?: (parent: T) => Promise<void> | void
  onCopyId?: (item: T) => void
}

// ============================================================================
// Tree Component Props
// ============================================================================

/**
 * Custom action definition for dropdown menu
 */
export interface TreeItemAction<T extends BaseTreeItem = BaseTreeItem> {
  id: string
  label: string
  icon?: LucideIcon
  onClick: (item: T) => void
  variant?: "default" | "destructive"
  disabled?: boolean | ((item: T) => boolean)
  hidden?: boolean | ((item: T) => boolean)
}

/**
 * Props for rendering tree item content
 */
export interface TreeItemRenderProps<T extends BaseTreeItem = BaseTreeItem> {
  item: T
  isSelected: boolean
  isExpanded: boolean
  isRenaming: boolean
  depth: number
  hasChildren: boolean
  isDragging: boolean
  isDropTarget: boolean
  dropPosition: DropPosition | null
  config: Required<DnDFeatureConfig>
}

/**
 * Custom renderer for tree item content
 */
export type TreeItemRenderer<T extends BaseTreeItem = BaseTreeItem> = 
  ComponentType<TreeItemRenderProps<T>>

/**
 * Custom icon renderer
 */
export interface IconRendererProps {
  icon: string
  className?: string
  color?: string
}

export type IconRenderer = ComponentType<IconRendererProps>

/**
 * Render slot props for customizing tree item parts
 */
export interface TreeItemSlotProps<T extends BaseTreeItem = BaseTreeItem> {
  item: T
  isSelected: boolean
  isExpanded: boolean
  isRenaming: boolean
  depth: number
  config: Required<DnDFeatureConfig>
}

/**
 * Custom render slots for tree item customization
 */
export interface TreeItemSlots<T extends BaseTreeItem = BaseTreeItem> {
  /** Custom icon renderer (replaces default icon) */
  renderIcon?: (props: TreeItemSlotProps<T> & IconRendererProps) => ReactNode
  /** Render additional content after the name */
  renderNameSuffix?: (props: TreeItemSlotProps<T>) => ReactNode
  /** Render additional content before actions dropdown */
  renderBeforeActions?: (props: TreeItemSlotProps<T>) => ReactNode
  /** Render additional menu items at the start of dropdown */
  renderMenuItemsStart?: (props: TreeItemSlotProps<T>) => ReactNode
  /** Render additional menu items before delete */
  renderMenuItemsEnd?: (props: TreeItemSlotProps<T>) => ReactNode
}

/**
 * Props for the unified DnD tree component
 */
export interface UnifiedDnDTreeProps<T extends BaseTreeItem = BaseTreeItem> {
  /** Array of tree items (flat or nested) */
  items: T[]
  /** Currently selected item ID */
  selectedId?: string | null
  /** Configuration options */
  config?: DnDFeatureConfig
  /** Callbacks for tree operations */
  callbacks: TreeItemCallbacks<T>
  /** Custom actions for dropdown menu */
  customActions?: TreeItemAction<T>[]
  /** Custom renderer for tree item content */
  renderItem?: TreeItemRenderer<T>
  /** Custom icon renderer (legacy - prefer slots.renderIcon) */
  renderIcon?: IconRenderer
  /** Custom render slots for fine-grained customization */
  slots?: TreeItemSlots<T>
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Root drop zone message */
  rootDropMessage?: string
  /** Additional class name */
  className?: string
  /** ID field name (default: "id") */
  idField?: keyof T
  /** Parent ID field name (default: "parentId") */
  parentIdField?: keyof T
  /** Order field name (default: "order") */
  orderField?: keyof T
  /** Children field name (default: "children") */
  childrenField?: keyof T
}

// ============================================================================
// Context Types
// ============================================================================

/**
 * DnD Tree context value
 */
export interface DnDTreeContextValue<T extends BaseTreeItem = BaseTreeItem> {
  config: Required<DnDFeatureConfig>
  state: DnDState
  actions: DnDStateActions
  callbacks: TreeItemCallbacks<T>
  customActions: TreeItemAction<T>[]
  selectedId: string | null
  renderIcon?: IconRenderer
  slots?: TreeItemSlots<T>
}
