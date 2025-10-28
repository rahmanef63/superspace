/**
 * Shared Library Index
 * Central export for all library modules
 */

// Registry
export * from "./registry"

// Error handling
export * from "./errors"

// Validation
export * from "./validation"

// Re-exports for convenience
export { getGlobalRegistry, loadRegistry } from "./registry"
export { handleError, getGlobalErrorHandler } from "./errors"
export { validateNode, validateProps } from "./validation"
