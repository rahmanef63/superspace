/**
 * Foundation Domain Facade
 *
 * Base layer functionality including:
 * - Authentication & Authorization
 * - Common hooks (useDebounce, useLocalStorage, etc.)
 * - Utility functions
 * - Type definitions
 * - Component manifest system
 * - Registry patterns
 *
 * @example
 * import { useAuth, useDebounce, cn } from '@/frontend/shared/foundation'
 */

// ============================================================
// Authentication & Authorization
// ============================================================
export * from './auth'
export type { User, AuthState, AuthConfig } from './auth/types'

// ============================================================
// Common Hooks
// ============================================================
export { useDebounce } from './hooks/useDebounce'
export { useLocalStorage } from './hooks/useLocalStorage'
export { useMediaQuery } from './hooks/useMediaQuery'
export { useMounted } from './hooks/useMounted'
export { useClickOutside } from './hooks/useClickOutside'
export { useKeyPress } from './hooks/useKeyPress'
export { useInterval } from './hooks/useInterval'
export { useTimeout } from './hooks/useTimeout'
export { usePrevious } from './hooks/usePrevious'
export { useToggle } from './hooks/useToggle'

// ============================================================
// Utility Functions
// ============================================================
export { cn } from './utils/cn'
export * from './utils/string'
export * from './utils/array'
export * from './utils/object'
export * from './utils/date'
export * from './utils/validation'
export * from './utils/format'

// ============================================================
// Component Manifest System
// ============================================================
export * from './manifest'
export type {
  ComponentManifest,
  ManifestEntry,
  ManifestConfig,
} from './manifest/types'

// ============================================================
// Registry Patterns
// ============================================================
export { Registry } from './registry/Registry'
export { createRegistry } from './registry/factory'
export type {
  RegistryItem,
  RegistryConfig,
  RegistryOptions,
} from './registry/types'

// ============================================================
// Core Types
// ============================================================
export type {
  // Common types
  ID,
  Timestamp,
  Status,
  ErrorType,
  SuccessType,

  // Component types
  ComponentType,
  ComponentProps,

  // Event types
  EventHandler,
  EventType,

  // State types
  StateUpdate,
  StateAction,

  // API types
  ApiResponse,
  ApiError,
  ApiSuccess,
} from './types'
