/**
 * Platform Admin Components
 * 
 * Export all reusable components for the Platform Admin feature.
 */

// Bundle components
export { default as BundleMultiSelect, BundleBadges } from './BundleMultiSelect'
export type { BundleOption, SelectedBundle, BundleRole } from './BundleMultiSelect'
export { default as BundleCategoriesTable } from './BundleCategoriesTable'

// Navigation
export { AdminNavigation, ADMIN_NAV_ITEMS } from './navigation/AdminNavigation'
export type { AdminSection, AdminNavItem } from './navigation/AdminNavigation'

// Inspector
export { 
  AdminInspector, 
  FeatureInspector, 
  UserInspector, 
  BundleInspector, 
  EmptyInspector,
  StatusBadge,
} from './inspector/AdminInspector'
export type { AdminInspectorProps } from './inspector/AdminInspector'

// Cards
export { StatCard } from './cards/StatCard'

// Tables
export { EnhancedTableHeader } from './EnhancedTableHeader'
export { PlatformUsersTable } from './PlatformUsersTable'
export { PlatformInvitationsTable } from './PlatformInvitationsTable'
