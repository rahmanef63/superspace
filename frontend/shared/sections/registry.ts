/**
 * Sections Registry (Level 4)
 * Auto-loads all section wrappers from subdirectories
 */

import type { SectionWrapper } from "../types"

// ============================================================================
// Auto-Discovery using import.meta.glob()
// ============================================================================

const registryModules = import.meta.glob<{ default: SectionWrapper }>(
  "./**/registry.ts",
  { eager: true }
)

// ============================================================================
// Section Registry Map
// ============================================================================

export const sectionRegistry = new Map<string, SectionWrapper>()

// Populate registry from auto-discovered modules
for (const [path, module] of Object.entries(registryModules)) {
  const wrapper = module.default
  if (wrapper && wrapper.id) {
    sectionRegistry.set(wrapper.id, wrapper)
  } else {
    console.warn(`⚠️ Invalid section wrapper at ${path}`)
  }
}

// ============================================================================
// Registry Functions
// ============================================================================

export function getSectionWrapper(id: string): SectionWrapper | undefined {
  return sectionRegistry.get(id)
}

export function getAllSectionWrappers(): SectionWrapper[] {
  return Array.from(sectionRegistry.values())
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllSections(globalRegistry: any): void {
  for (const wrapper of getAllSectionWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "section" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register section ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__SECTION_REGISTRY__ = {
    registry: sectionRegistry,
    getAll: getAllSectionWrappers,
    get: getSectionWrapper,
  }
  console.log(`📦 Auto-loaded ${sectionRegistry.size} sections`)
}
