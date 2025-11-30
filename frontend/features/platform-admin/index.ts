/**
 * Platform Admin Feature
 * 
 * Exports for the platform-admin feature module.
 */

// Main page component
export { default as PlatformAdminPage } from "./views/PlatformAdminPage"

// Hooks
export { 
  usePlatformAdmin,
  usePlatformAdminStatus,
  useCustomFeatures,
  useAllWorkspaces,
  useFeatureAccess,
  usePlatformAdminMutations,
} from "./hooks/usePlatformAdmin"

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
