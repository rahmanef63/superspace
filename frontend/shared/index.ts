/**
 * Shared System Index
 * Main export for the entire shared component system
 */

// Types
export * from "./types"

// Library modules
export * from "./lib"

// Re-export commonly used items for convenience
export type {
  ComponentWrapper,
  ElementWrapper,
  BlockWrapper,
  SectionWrapper,
  TemplateWrapper,
  FlowWrapper,
  AnyNode,
  AnyWrapper,
  AnyJSON,
  ComponentNode,
  PropDefinitions,
  PropDefinition,
  RegistryConfig,
  ConversionOptions,
  ExportSchema,
} from "./types"

export {
  getGlobalRegistry,
  loadRegistry,
  handleError,
  validateNode,
  validateProps,
} from "./lib"
