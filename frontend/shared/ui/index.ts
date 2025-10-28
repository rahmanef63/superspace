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
export * from './components/Button'
export * from './components/Input'
export * from './components/Textarea'
export * from './components/Label'
export * from './components/Badge'
export * from './components/Card'
export * from './components/Text'
export * from './components/Image'
export * from './components/Container'

// ============================================================
// Feature Components
// ============================================================
export { FeatureBadge } from './components/FeatureBadge'
export { FeatureNotReady } from './components/FeatureNotReady'

// ============================================================
// Loading & Error States
// ============================================================
export { LoadingSpinner } from './components/LoadingSpinner'
export * from './components/loading'
export * from './components/error'

// ============================================================
// Data Display
// ============================================================
export * from './components/data-display'
export * from './components/charts'

// ============================================================
// Layout Components
// ============================================================
export * from './layout'
export { MainLayout } from './layout/MainLayout'
export { ContentLayout } from './layout/ContentLayout'

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
// User Components
// ============================================================
export * from './components/user'

// ============================================================
// Pages & Templates
// ============================================================
export * from './components/pages'

// ============================================================
// Performance Components
// ============================================================
export * from './components/performance'

// ============================================================
// Icons
// ============================================================
export * from './icons'
export * from './components/icons'

// ============================================================
// Assets
// ============================================================
export * from './components/assets'

// ============================================================
// Utility Components
// ============================================================
export * from './components/utils'

// ============================================================
// shadcn/ui Components
// ============================================================
export * from './components/ui'

// ============================================================
// Component Registry
// ============================================================
export { componentRegistry } from './components/registry'
