/**
 * Feature Preview System - Public API
 * 
 * @module frontend/shared/features/preview
 */

// Types
export * from './types'

// Registry
export {
  registerFeaturePreview,
  getFeaturePreview,
  getAllFeaturePreviews,
  getFeaturePreviewsByCategory,
  hasFeaturePreview,
  getFeatureIdsWithPreviews,
  defineFeaturePreview,
  unregisterFeaturePreview,
  clearPreviewRegistry,
} from './registry'

// Components
export { FeaturePreviewWrapper } from './FeaturePreviewWrapper'
export { FeatureListPanel } from './FeatureListPanel'
export { PreviewPanel } from './PreviewPanel'

// Re-export the all-previews registry (this auto-registers all previews when imported)
export * from './all-previews'
