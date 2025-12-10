/**
 * Platform Admin Feature
 * 
 * Exports for the platform-admin feature module.
 */

// Main page component (New Three Column Layout)
export { default as PlatformAdminPage } from "./views/PlatformAdminPageNew"

// Legacy page (for backward compatibility - can be removed after testing)
export { default as PlatformAdminPageLegacy } from "./views/PlatformAdminPage"

// Hooks
export { 
  usePlatformAdmin,
  usePlatformAdminStatus,
  useCustomFeatures,
  useAllWorkspaces,
  useFeatureAccess,
  usePlatformAdminMutations,
  useSystemFeatures,
  useSystemFeatureMutations,
  useBundleCategories,
  useBundleCategoryMutations,
} from "./hooks/usePlatformAdmin"

// Components
export {
  AdminNavigation,
  AdminInspector,
  StatCard,
  BundleMultiSelect,
  BundleBadges,
  BundleCategoriesTable,
  PlatformUsersTable,
  PlatformInvitationsTable,
  EnhancedTableHeader,
} from "./components"

export type {
  AdminSection,
  AdminNavItem,
  AdminInspectorProps,
  BundleOption,
  SelectedBundle,
  BundleRole,
} from "./components"

// Types
export type {
  PlatformAdminUser,
  CustomFeature,
  FeatureAccess,
  Workspace,
  FeatureStatus,
  AccessLevel,
  SystemFeatureTag,
} from "./types"
export { FEATURE_TAGS } from "./types"

// Config
export { default as config } from "./config"
