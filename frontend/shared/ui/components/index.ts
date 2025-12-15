/**
 * Components Module Index
 * Exports all component wrappers and utilities
 */

// Registry
export * from "./registry"

// Utilities
export * from "./utils"

// Component wrappers (individual exports)
export * from "./button"
export * from "./input"
export * from "./card"
export * from "./search-bar"

// Rich Text Components
export * from "./rich-text"

// Re-export for convenience
export {
  componentRegistry,
  getComponentWrapper,
  getAllComponentWrappers,
  getComponentsByCategory,
  searchComponents,
  registerAllComponents,
} from "./registry"

export {
  createComponent,
  textProp,
  numberProp,
  booleanProp,
  selectProp,
  childrenProp,
} from "./utils"
