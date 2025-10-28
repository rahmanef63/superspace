/**
 * Components Registry
 * Auto-loads all component wrappers from subdirectories
 */

import type { ComponentWrapper, RegistryEntry } from "../types"

// ============================================================================
// Auto-Discovery using import.meta.glob()
// ============================================================================

const registryModules = import.meta.glob<{ default: ComponentWrapper }>(
  "./**/registry.ts",
  { eager: true }
)

// ============================================================================
// Component Registry Map
// ============================================================================

export const componentRegistry = new Map<string, ComponentWrapper>()

// Populate registry from auto-discovered modules
for (const [path, module] of Object.entries(registryModules)) {
  const wrapper = module.default
  if (wrapper && wrapper.id) {
    componentRegistry.set(wrapper.id, wrapper)
  } else {
    console.warn(`⚠️ Invalid component wrapper at ${path}`)
  }
}

// ============================================================================
// Registry Functions
// ============================================================================

export function getComponentWrapper(id: string): ComponentWrapper | undefined {
  return componentRegistry.get(id)
}

export function getAllComponentWrappers(): ComponentWrapper[] {
  return Array.from(componentRegistry.values())
}

export function getComponentsByCategory(category: string): ComponentWrapper[] {
  return getAllComponentWrappers().filter((wrapper) => wrapper.category === category)
}

export function searchComponents(query: string): ComponentWrapper[] {
  const lowerQuery = query.toLowerCase()
  return getAllComponentWrappers().filter((wrapper) => {
    const name = wrapper.name?.toLowerCase() || ""
    const displayName = wrapper.displayName?.toLowerCase() || ""
    const description = wrapper.description?.toLowerCase() || ""
    const tags = wrapper.tags?.join(" ").toLowerCase() || ""

    return (
      name.includes(lowerQuery) ||
      displayName.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      tags.includes(lowerQuery)
    )
  })
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllComponents(globalRegistry: any): void {
  for (const wrapper of getAllComponentWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "component" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register component ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Export Registry Entries (for global registry)
// ============================================================================

export function getComponentRegistryEntries(): RegistryEntry<ComponentWrapper>[] {
  return getAllComponentWrappers().map((wrapper) => ({
    id: wrapper.id,
    type: "component" as const,
    wrapper,
    metadata: wrapper.metadata || {},
  }))
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__COMPONENT_REGISTRY__ = {
    registry: componentRegistry,
    getAll: getAllComponentWrappers,
    get: getComponentWrapper,
    search: searchComponents,
  }
  console.log(`📦 Auto-loaded ${componentRegistry.size} components`)
}
