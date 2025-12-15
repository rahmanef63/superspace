/**
 * Components Registry
 * Auto-loads all component wrappers from subdirectories
 */

import type { ComponentWrapper, RegistryEntry } from "@/frontend/shared/foundation"

// Import all wrapper components
import { BadgeWrapper } from "./badge/badge-wrapper"
import { ButtonWrapper } from "./button/button-wrapper"
import { CardWrapper } from "./card/card-wrapper"
import { ContainerWrapper } from "./container/container-wrapper"
import { ImageWrapper } from "./image/image-wrapper"
import { InputWrapper } from "./input/input-wrapper"
import { LabelWrapper } from "./label/label-wrapper"
import { TextWrapper } from "./text/text-wrapper"
import { TextareaWrapper } from "./textarea/textarea-wrapper"

// ============================================================================
// Component Registry
// ============================================================================

const registryModules: Record<string, { default: ComponentWrapper }> = {
  badge: { default: BadgeWrapper },
  button: { default: ButtonWrapper },
  card: { default: CardWrapper },
  container: { default: ContainerWrapper },
  image: { default: ImageWrapper },
  input: { default: InputWrapper },
  label: { default: LabelWrapper },
  text: { default: TextWrapper },
  textarea: { default: TextareaWrapper },
}

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

// Alias for consistency
export const getAllComponents = getAllComponentWrappers

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
