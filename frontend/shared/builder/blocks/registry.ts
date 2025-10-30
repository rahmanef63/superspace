/**
 * Blocks Registry (Level 3)
 * Auto-loads all block wrappers from subdirectories
 */

import type { BlockWrapper } from "@/frontend/shared/foundation"

// ============================================================================
// Auto-Discovery Registry
// Note: import.meta.glob() not supported in Next.js, using empty registry
// ============================================================================

const registryModules: Record<string, { default: BlockWrapper }> = {
  // TODO: Add block registries here when available
}

// ============================================================================
// Block Registry Map
// ============================================================================

export const blockRegistry = new Map<string, BlockWrapper>()

// Populate registry from auto-discovered modules
for (const [path, module] of Object.entries(registryModules)) {
  const wrapper = module.default
  if (wrapper && wrapper.id) {
    blockRegistry.set(wrapper.id, wrapper)
  } else {
    console.warn(`⚠️ Invalid block wrapper at ${path}`)
  }
}

// ============================================================================
// Registry Functions
// ============================================================================

export function getBlockWrapper(id: string): BlockWrapper | undefined {
  return blockRegistry.get(id)
}

export function getAllBlockWrappers(): BlockWrapper[] {
  return Array.from(blockRegistry.values())
}

// ============================================================================
// Register with Global Registry
// ============================================================================

export function registerAllBlocks(globalRegistry: any): void {
  for (const wrapper of getAllBlockWrappers()) {
    try {
      globalRegistry.register({
        id: wrapper.id,
        type: "block" as const,
        wrapper,
        metadata: wrapper.metadata || {},
      })
    } catch (error) {
      console.error(`Failed to register block ${wrapper.id}:`, error)
    }
  }
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__BLOCK_REGISTRY__ = {
    registry: blockRegistry,
    getAll: getAllBlockWrappers,
    get: getBlockWrapper,
  }
  console.log(`📦 Auto-loaded ${blockRegistry.size} blocks`)
}
