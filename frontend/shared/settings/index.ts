/**
 * Settings Domain Facade
 *
 * Workspace and feature settings system including:
 * - Settings registry and management
 * - Settings UI components (SettingsView, SettingsSidebar, SettingsPopup)
 * - Category pages (Account, Personalization, Notifications, Storage, etc.)
 * - Settings hooks (useSettings, useSettingsRegistry)
 * - Feature settings integration
 *
 * @example
 * import { SettingsView, useSettings, SettingsRegistry } from '@/frontend/shared/settings'
 */

// ============================================================
// Core Components
// ============================================================
export { SettingsView } from './SettingsView'
export { SettingsSidebar } from './SettingsSidebar'
export { SettingsPopup } from './SettingsPopup'
export { SettingsRegistryProvider, useSettingsRegistry, useRegisterFeatureSettings } from './SettingsRegistry'
export { default as SettingsPage } from './page'

// ============================================================
// Feature Settings Registry
// ============================================================
export {
  registerFeatureSettings,
  unregisterFeatureSettings,
  getFeatureSettingsBuilder,
  getAllRegisteredFeatures,
  hasFeatureSettings,
  clearFeatureSettingsRegistry
} from './featureSettingsRegistry'

// ============================================================
// Settings Categories
// ============================================================
export * from './general'
export * from './account'
export * from './chats'
export * from './video-voice'
export * from './notifications'
export * from './personalization'
export * from './storage'
export * from './shortcuts'
export * from './help'
export * from './workspace'

// ============================================================
// Shared Components
// ============================================================
export * from './components'

// ============================================================
// Hooks
// ============================================================
export * from './hooks'

// ============================================================
// Types
// ============================================================
export type * from './types'
