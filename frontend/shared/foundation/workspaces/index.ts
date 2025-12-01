// Legacy exports (backward compatible)
export { OnboardingFlow } from './components/OnboardingFlow';

// New robust onboarding
export { RobustOnboardingFlow } from './components/RobustOnboardingFlow';
export { BundleSelector } from './components/BundleSelector';
export { FeatureCustomizer } from './components/FeatureCustomizer';

// Bundle templates - All bundle-related exports
export {
  // Constants
  WORKSPACE_BUNDLES,
  BUNDLE_IDS,
  CORE_FEATURES,
  // Functions
  getAllBundles,
  getBundleById,
  getBundlesForWorkspaceType,
  getBundlesByCategory,
  getBundleEnabledFeatures,
  getBundleAllFeatures,
  getFeatureRoleInBundle,
  isFeatureInBundle,
  validateBundles,
  clearBundleCache,
} from './constants/bundles';
export type {
  BundleId,
  AvailableFeatureId,
  WorkspaceBundleTemplate,
} from './constants/bundles';

// Bundle hooks (database + static fallback)
export {
  usePublicBundles,
  useBundleWithFeatures,
  useBundlesForWorkspaceType,
  getMergedBundleEnabledFeatures,
  getMergedBundleAllFeatures,
} from './hooks/useBundles';
export type { MergedBundle } from './hooks/useBundles';

// Settings
export { WorkspaceSettings } from '@/frontend/shared/settings/workspace/WorkspaceSettings';
export { MemberManagementPanel as MemberManagement } from '../../../features/members/components/MemberManagementPanel';

// Types
export type {
  MemberManagementProps,
  WorkspaceSettingsProps,
  OnboardingFlowProps,
  OnboardingProgressProps,
  OnboardingStepProps,
} from './components/types';
export type {
  ExtendedOnboardingData,
  ExtendedOnboardingFlowProps,
  ExtendedOnboardingStepProps,
  FeatureSelectionState,
  OnboardingStepDef,
} from './components/onboarding-types';
export type {
  WorkspaceType,
  ViewType,
  WorkspaceNavigationItem,
  OnboardingData,
  OnboardingStepMeta,
  WorkspaceLayoutState,
} from './types';
