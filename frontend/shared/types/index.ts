/**
 * Shared Types Index
 * Central export for all type definitions
 */

// Core types
export * from "./core"

// JSON Schema types
export * from "./json-schema"

// Registry types
export * from "./registry"

// Conversion types
export * from "./conversion"

// Error types
export * from "./errors"

// Re-export commonly used types for convenience
export type {
  // Core
  BaseNode,
  AnyNode,
  AnyWrapper,
  AnyJSON,
  NodeLevel,
  NodeType,
  ComponentNode,
  ElementNode,
  BlockNode,
  SectionNode,
  TemplateNode,
  FlowNode,
  GroupNode,
  ComponentInstance,
  ComponentDefinition,

  // Wrappers
  ComponentWrapper,
  ElementWrapper,
  BlockWrapper,
  SectionWrapper,
  TemplateWrapper,
  FlowWrapper,

  // Props
  PropDefinition,
  PropDefinitions,
  PropType,

  // Metadata
  NodeMetadata,

  // Layout
  LayoutConfig,
  RouteConfig,

  // Registry
  IRegistry,
  RegistryEntry,
  RegistryConfig,

  // Conversion
  ConversionOptions,
  ConversionResult,
  IConverter,

  // JSON
  ComponentJSONType as ComponentJSON,
  ElementJSONType as ElementJSON,
  BlockJSONType as BlockJSON,
  SectionJSONType as SectionJSON,
  TemplateJSONType as TemplateJSON,
  FlowJSONType as FlowJSON,
  ExportSchemaV1Type as ExportSchema,
} from "./core"

export type {
  Result,
} from "./errors"
