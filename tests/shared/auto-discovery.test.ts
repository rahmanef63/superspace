/**
 * Auto-Discovery Pattern Tests
 * Tests the import.meta.glob() auto-discovery across all 6 registry levels
 */

import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the RegistryLoader to avoid fast-glob dependency issues in browser environment
vi.mock("@/frontend/shared/foundation/utils/registry/RegistryLoader", () => ({
  RegistryLoader: class {
    async load() {
      return { loaded: 0, failed: 0, errors: [] }
    }
  }
}))
import {
  componentRegistry,
  getComponentWrapper,
  getAllComponentWrappers,
  getComponentsByCategory,
  searchComponents,
} from "@/frontend/shared/ui/components/registry"
import {
  elementRegistry,
  getElementWrapper,
  getAllElementWrappers,
} from "@/frontend/shared/builder/elements/registry"
import {
  blockRegistry,
  getBlockWrapper,
  getAllBlockWrappers,
} from "@/frontend/shared/builder/blocks/registry"
import {
  sectionRegistry,
  getSectionWrapper,
  getAllSectionWrappers,
} from "@/frontend/shared/builder/sections/registry"
import {
  templateRegistry,
  getTemplateWrapper,
  getAllTemplateWrappers,
} from "@/frontend/shared/builder/templates/registry"
import {
  flowRegistry,
  getFlowWrapper,
  getAllFlowWrappers,
} from "@/frontend/shared/builder/flows/registry"

describe("Auto-Discovery Pattern", () => {
  describe("Component Registry", () => {
    it("should auto-load component wrappers using glob", () => {
      // Registry should be populated at module load time
      expect(componentRegistry).toBeInstanceOf(Map)
      expect(componentRegistry.size).toBeGreaterThan(0)
    })

    it("should validate wrapper.id exists for all components", () => {
      const allComponents = getAllComponentWrappers()

      allComponents.forEach((wrapper) => {
        expect(wrapper).toBeDefined()
        expect(wrapper.id).toBeDefined()
        expect(typeof wrapper.id).toBe("string")
        expect(wrapper.id.length).toBeGreaterThan(0)
      })
    })

    it("should populate componentRegistry Map correctly", () => {
      const allComponents = getAllComponentWrappers()

      allComponents.forEach((wrapper) => {
        const retrieved = componentRegistry.get(wrapper.id)
        expect(retrieved).toBe(wrapper)
        expect(retrieved?.id).toBe(wrapper.id)
      })
    })

    it("should discover known components (Button, Input, Card)", () => {
      // These components should exist
      const button = getComponentWrapper("button")
      const input = getComponentWrapper("input")
      const card = getComponentWrapper("card")

      expect(button).toBeDefined()
      expect(button?.id).toBe("button")
      expect(button?.type).toBe("component")

      expect(input).toBeDefined()
      expect(input?.id).toBe("input")

      expect(card).toBeDefined()
      expect(card?.id).toBe("card")
    })

    it("should have required wrapper properties", () => {
      const allComponents = getAllComponentWrappers()

      allComponents.forEach((wrapper) => {
        expect(wrapper.id).toBeDefined()
        expect(wrapper.type).toBe("component")
        expect(wrapper.name).toBeDefined()
        expect(typeof wrapper.fromJSON).toBe("function")
        expect(typeof wrapper.toJSON).toBe("function")
        expect(typeof wrapper.toTypeScript).toBe("function")
        expect(typeof wrapper.validate).toBe("function")
      })
    })

    it("should return undefined for non-existent component", () => {
      const nonExistent = getComponentWrapper("non-existent-component-xyz")
      expect(nonExistent).toBeUndefined()
    })

    it("should filter components by category", () => {
      const allComponents = getAllComponentWrappers()

      // Get unique categories
      const categories = new Set(allComponents.map((w) => w.category).filter(Boolean))

      categories.forEach((category) => {
        if (category) {
          const filtered = getComponentsByCategory(category)
          expect(filtered.length).toBeGreaterThan(0)
          filtered.forEach((wrapper) => {
            expect(wrapper.category).toBe(category)
          })
        }
      })
    })

    it("should search components by name, displayName, or description", () => {
      const allComponents = getAllComponentWrappers()

      if (allComponents.length > 0) {
        // Search for first component's name
        const firstComponent = allComponents[0]
        const results = searchComponents(firstComponent.name || firstComponent.id)

        expect(results.length).toBeGreaterThan(0)
        expect(results.some((w) => w.id === firstComponent.id)).toBe(true)
      }
    })
  })

  describe("Element Registry", () => {
    it("should auto-load element wrappers using glob", () => {
      expect(elementRegistry).toBeInstanceOf(Map)
      // Elements may be empty or have items
    })

    it("should validate wrapper.id exists for all elements", () => {
      const allElements = getAllElementWrappers()

      allElements.forEach((wrapper) => {
        expect(wrapper).toBeDefined()
        expect(wrapper.id).toBeDefined()
        expect(typeof wrapper.id).toBe("string")
        expect(wrapper.type).toBe("element")
      })
    })

    it("should return undefined for non-existent element", () => {
      const nonExistent = getElementWrapper("non-existent-element-xyz")
      expect(nonExistent).toBeUndefined()
    })
  })

  describe("Block Registry", () => {
    it("should auto-load block wrappers using glob", () => {
      expect(blockRegistry).toBeInstanceOf(Map)
      // Blocks may be empty (currently prepared but unused)
    })

    it("should validate wrapper.id exists for all blocks", () => {
      const allBlocks = getAllBlockWrappers()

      allBlocks.forEach((wrapper) => {
        expect(wrapper).toBeDefined()
        expect(wrapper.id).toBeDefined()
        expect(wrapper.type).toBe("block")
      })
    })

    it("should return undefined for non-existent block", () => {
      const nonExistent = getBlockWrapper("non-existent-block-xyz")
      expect(nonExistent).toBeUndefined()
    })
  })

  describe("Section Registry", () => {
    it("should auto-load section wrappers using glob", () => {
      expect(sectionRegistry).toBeInstanceOf(Map)
      // Sections may be empty (currently prepared but unused)
    })

    it("should validate wrapper.id exists for all sections", () => {
      const allSections = getAllSectionWrappers()

      allSections.forEach((wrapper) => {
        expect(wrapper).toBeDefined()
        expect(wrapper.id).toBeDefined()
        expect(wrapper.type).toBe("section")
      })
    })

    it("should return undefined for non-existent section", () => {
      const nonExistent = getSectionWrapper("non-existent-section-xyz")
      expect(nonExistent).toBeUndefined()
    })
  })

  describe("Template Registry", () => {
    it("should auto-load template wrappers using glob", () => {
      expect(templateRegistry).toBeInstanceOf(Map)
      // Templates may be empty (currently prepared but unused)
    })

    it("should validate wrapper.id exists for all templates", () => {
      const allTemplates = getAllTemplateWrappers()

      allTemplates.forEach((wrapper) => {
        expect(wrapper).toBeDefined()
        expect(wrapper.id).toBeDefined()
        expect(wrapper.type).toBe("template")
      })
    })

    it("should return undefined for non-existent template", () => {
      const nonExistent = getTemplateWrapper("non-existent-template-xyz")
      expect(nonExistent).toBeUndefined()
    })
  })

  describe("Flow Registry", () => {
    it("should auto-load flow wrappers using glob", () => {
      expect(flowRegistry).toBeInstanceOf(Map)
      // Flows may be empty (currently prepared but unused)
    })

    it("should validate wrapper.id exists for all flows", () => {
      const allFlows = getAllFlowWrappers()

      allFlows.forEach((wrapper) => {
        expect(wrapper).toBeDefined()
        expect(wrapper.id).toBeDefined()
        expect(wrapper.type).toBe("flow")
      })
    })

    it("should return undefined for non-existent flow", () => {
      const nonExistent = getFlowWrapper("non-existent-flow-xyz")
      expect(nonExistent).toBeUndefined()
    })
  })

  describe("Registry Consistency", () => {
    it("should not have duplicate IDs within component registry", () => {
      const allComponents = getAllComponentWrappers()
      const ids = allComponents.map((w) => w.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    it("should not have duplicate IDs within element registry", () => {
      const allElements = getAllElementWrappers()
      const ids = allElements.map((w) => w.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    it("should maintain type consistency (type matches registry)", () => {
      getAllComponentWrappers().forEach((w) => {
        expect(w.type).toBe("component")
      })

      getAllElementWrappers().forEach((w) => {
        expect(w.type).toBe("element")
      })

      getAllBlockWrappers().forEach((w) => {
        expect(w.type).toBe("block")
      })

      getAllSectionWrappers().forEach((w) => {
        expect(w.type).toBe("section")
      })

      getAllTemplateWrappers().forEach((w) => {
        expect(w.type).toBe("template")
      })

      getAllFlowWrappers().forEach((w) => {
        expect(w.type).toBe("flow")
      })
    })

    it("should have required methods on all wrappers", () => {
      const testMethods = (wrappers: any[]) => {
        wrappers.forEach((wrapper) => {
          expect(typeof wrapper.fromJSON).toBe("function")
          expect(typeof wrapper.toJSON).toBe("function")
          expect(typeof wrapper.toTypeScript).toBe("function")
          expect(typeof wrapper.validate).toBe("function")
        })
      }

      testMethods(getAllComponentWrappers())
      testMethods(getAllElementWrappers())
      testMethods(getAllBlockWrappers())
      testMethods(getAllSectionWrappers())
      testMethods(getAllTemplateWrappers())
      testMethods(getAllFlowWrappers())
    })
  })

  describe("Glob Pattern Behavior", () => {
    it("should discover nested directories with ** pattern", () => {
      // The ./**/registry.ts pattern should discover both:
      // - ./Component/registry.ts (immediate subdirectory)
      // - ./category/Component/registry.ts (nested subdirectory)

      const allComponents = getAllComponentWrappers()

      // Should find at least Button, Input, Card (known components)
      expect(allComponents.length).toBeGreaterThanOrEqual(3)
    })
  })
})
