/**
 * Workspace Store Feature
 * 
 * Public exports for workspace store management
 */

// Main page component
export { WorkspaceStorePage } from "./WorkspaceStorePage"

// Store
export { useWorkspaceStore } from "./store"

// Hooks
export {
  useWorkspaceStoreData,
  useWorkspaceTree,
  useWorkspaceStoreTree,
  useFilteredWorkspaces,
  useWorkspaceStoreFiltered,
  useWorkspaceById,
  useWorkspaceStoreById,
  useWorkspaceChildren,
  useWorkspaceSiblings,
  useWorkspaceAncestors,
} from "./hooks/useWorkspaceStoreData"
export { useWorkspaceStoreMutations } from "./hooks/useWorkspaceStoreMutations"
export {
  useWorkspaceStoreState,
  useWorkspaceStoreFilters,
  useWorkspaceDnDState,
  useWorkspaceStoreDnD,
  useWorkspaceDialogs,
} from "./hooks/useWorkspaceStoreState"

// Components
export {
  WorkspaceCard,
  WorkspaceTree,
  ColorPicker,
  InlineColorPicker,
  IconPicker,
  WorkspaceIcon,
  getIconByName,
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
  WorkspaceToolbar,
} from "./components"

// Types
export type {
  WorkspaceType,
  WorkspaceStoreItem,
  WorkspaceTreeNode,
  WorkspaceFilters,
  WorkspaceStoreState,
  IconPickerProps,
  ColorPickerProps,
  CreateWorkspaceFormData,
  UpdateWorkspaceFormData,
  MoveWorkspaceData,
} from "./types"

// Constants
export {
  WORKSPACE_TYPES,
  WORKSPACE_TYPE_OPTIONS,
  WORKSPACE_TYPE_LABELS,
  WORKSPACE_TYPE_ICONS,
  WORKSPACE_COLORS,
  HIERARCHY_LEVEL_NAMES,
  WORKSPACE_STORE_CONFIG,
  MAX_WORKSPACE_DEPTH,
  MAX_CHILDREN_PER_WORKSPACE,
  WORKSPACE_ICONS,
  WORKSPACE_ICON_CATEGORIES,
} from "./constants"
