/**
 * Builder Domain Facade
 *
 * Core CMS/Builder functionality including:
 * - Canvas system (SharedCanvasProvider, DnD, Layout)
 * - Inspector components (Dynamic, Composite, Smart)
 * - Component library management
 * - Blocks, Elements, Sections, Templates
 * - Flow builder
 *
 * @example
 * import { SharedCanvasProvider, useSharedCanvas, DynamicInspector } from '@/frontend/shared/builder'
 */

// ============================================================
// Canvas System
// ============================================================
export * from './canvas'
export * from './canvas/core'
export * from './canvas/nodes'

// ============================================================
// Inspector Components
// ============================================================
export { DynamicInspector } from './inspector/DynamicInspector'
export { CompositeInspector, useCompositeInspector } from './inspector/CompositeInspector'
export { SmartInspector } from './inspector/SmartInspector'
export { ChildrenManager } from './inspector/ChildrenManager'
export { InspectorTabs } from './inspector/InspectorTabs'
export { PropertyEditor } from './inspector/PropertyEditor'
export { StyleEditor } from './inspector/StyleEditor'
export { ChatAI } from './inspector/ChatAI'

// ============================================================
// Component Library
// ============================================================
export { ComponentLibrary } from './library/ComponentLibrary'
export { LibraryPanel } from './library/LibraryPanel'
export { LibrarySearch } from './library/LibrarySearch'
export { ComponentCard } from './library/ComponentCard'

// ============================================================
// Blocks (Composite Components)
// ============================================================
export * from './blocks'
export type { BlockDefinition, BlockProps, BlockConfig } from './blocks/types'

// ============================================================
// Elements (Atomic Components)
// ============================================================
export * from './elements'
export type { ElementDefinition, ElementProps, ElementConfig } from './elements/types'

// ============================================================
// Sections (Page Sections)
// ============================================================
export * from './sections'
export type { SectionDefinition, SectionProps, SectionConfig } from './sections/types'

// ============================================================
// Templates (Full Pages)
// ============================================================
export * from './templates'
export type { TemplateDefinition, TemplateProps, TemplateConfig } from './templates/types'

// ============================================================
// Flows (Visual Programming)
// ============================================================
export * from './flows'
export type { FlowDefinition, FlowNodeType, FlowEdgeType } from './flows/types'

// ============================================================
// Types
// ============================================================
export type {
  // Canvas types
  CanvasNode,
  CanvasEdge,
  CanvasState,
  CanvasConfig,

  // Common builder types
  BuilderComponent,
  BuilderProperty,
  BuilderStyle,
  BuilderEvent,
} from './canvas/core/types'
