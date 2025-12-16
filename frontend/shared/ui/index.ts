/**
 * UI Domain Facade
 *
 * Generic UI components and primitives including:
 * - Basic components (Button, Input, Card, Badge, etc.)
 * - Layout components (Container, Grid, Stack)
 * - Data display (Charts, Tables, Lists)
 * - Navigation (Sidebar, Breadcrumbs, Tabs)
 * - Icons and assets
 * - Loading states and error boundaries
 * - shadcn/ui components
 *
 * @example
 * import { Button, Card, Input, Container } from '@/frontend/shared/ui'
 */

// ============================================================
// Basic Components
// ============================================================
// Export wrappers (default exports from index.ts)
export * from './components/Button'
export * from './components/Input'
export * from './components/Textarea'
export * from './components/Label'
export * from './components/Badge'
export * from './components/Card'
export * from './components/Text'
export * from './components/Image'
export * from './components/Container'

// Export base components (for direct usage)
export { TextComponent } from './components/Text/text-component'
export { ContainerComponent } from './components/Container/container-component'
export { ImageComponent } from './components/Image/image-component'

// For components that wrap shadcn directly, alias wrapper as Component
export { InputWrapper as InputComponent } from './components/Input/input-wrapper'
export { LabelWrapper as LabelComponent } from './components/Label/label-wrapper'
export { TextareaWrapper as TextareaComponent } from './components/Textarea/textarea-wrapper'

// ============================================================
// Feature Components
// ============================================================
export { FeatureBadge } from './components/feature-badge'
export { FeatureNotReady } from './components/feature-not-ready'
export { SearchBar } from './components/search-bar'
export type { SearchBarProps } from './components/search-bar'

// ============================================================
// Loading & Error States
// ============================================================

export * from './components/loading'
// export * from './components/error'  // TODO: Add if exists

// ============================================================
// Data Display
// ============================================================
export * from './components/data-display'
// export * from './components/charts'  // TODO: Add if exists

// ============================================================
// Layout Components
// ============================================================
export * from './layout'
// export { MainLayout } from './layout/MainLayout'  // TODO: Add if exists
// export { ContentLayout } from './layout/ContentLayout'  // TODO: Add if exists

// ============================================================
// Navigation
// ============================================================
export * from './components/navigation'

// ============================================================
// Controls & Interactions
// ============================================================
export * from './components/controls'

// ============================================================
// Canvas Components
// ============================================================
export * from './components/canvas'

// ============================================================
// Preview & Display
// ============================================================
export * from './components/preview'

// ============================================================
// Session Info (Shared across features)
// ============================================================
export * from './components/session-info'

// ============================================================
// Agent Chat (Shared AI chat container)
// ============================================================
export * from './agent-chat'

// ============================================================
// AI Assistant (Feature AI Assistant components)
// ============================================================
export * from './ai-assistant'

// ============================================================
// User Components
// ============================================================
export * from './components/user'

// ============================================================
// Component Utilities
// ============================================================
export * from './components/utils'
export {
  createComponent,
  textProp,
  numberProp,
  booleanProp,
  selectProp,
  multiSelectProp,
  colorProp,
  imageProp,
  iconProp,
  sliderProp,
  childrenProp,
  classNameProp,
  layoutProps,
  sizeProps,
  spacingProps,
} from './components/utils/componentFactory'

// ============================================================
// Component Registry
// ============================================================
export * from './components/registry'
export {
  componentRegistry,
  getComponentWrapper,
  getAllComponents,
} from './components/registry'

// ============================================================
// Pages & Templates (DEPRECATED - use layout/container and layout/header)
// ============================================================
// NOTE: PageContainer and PageHeader are now in layout/container and layout/header
// Re-export for backward compatibility
export { PageContainer } from './layout/container'
export { PageHeader } from './layout/header'

// ============================================================
// Performance Components
// ============================================================
export * from './components/performance'

// ============================================================
// Icons - SSOT is at ./icons
// ============================================================
export * from './icons'

// ============================================================
// Color Picker - SSOT is at ./color-picker
// ============================================================
export * from './color-picker'
// ============================================================
// Assets
// ============================================================
// TODO: Fix broken imports in AssetGallery and FileUploadZone
// export * from './components/assets'

// ============================================================
// Utility Components
// ============================================================
export * from './components/utils'

// ============================================================
// shadcn/ui Components
// ============================================================
export * from './components'
