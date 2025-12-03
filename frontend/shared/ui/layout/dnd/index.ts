/**
 * Unified DnD System
 * 
 * A reusable drag-and-drop tree system for:
 * - Workspace Store (workspace hierarchy)
 * - Menu Store (menu item organization)  
 * - Custom features (any hierarchical data)
 * 
 * Features:
 * - Drop above/below/inside targets
 * - Root level drop zone
 * - Inline renaming
 * - Customizable actions dropdown
 * - Icon/color customization
 * - Consistent hover and drag effects
 * - Configurable appearance
 */

// Types
export * from "./types"

// Context
export { 
  DnDTreeProvider, 
  useDnDTreeContext, 
  useOptionalDnDTreeContext 
} from "./context"

// Components
export { UnifiedDnDTree, ScrollableUnifiedDnDTree } from "./UnifiedDnDTree"
export { DnDTreeItem } from "./DnDTreeItem"
export { RootDropZone } from "./RootDropZone"

// Utilities
export {
  buildTree,
  flattenTree,
  computeNextOrder,
  calculateInsertOrder,
  wouldCreateCycle,
  getAncestorIds,
  getDescendantIds,
  calculateDropPosition,
  buildMoveOperation,
} from "./utils"

// Hooks
export {
  useDnDState,
  useDnDConfig,
  useTreeExpansion,
  useTreeSelection,
} from "./hooks"

// Adapters (pre-configured for specific features)
export * from "./adapters"
