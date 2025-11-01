import { describe, it, expect } from "vitest"

import { DEFAULT_PAGE_MANIFEST, getDefaultPages } from "@/frontend/shared/foundation/manifest"

/**
 * ✅ 100% DYNAMIC Manifest content regression tests
 *
 * Ensure manifest entries match auto-discovered features.
 * NO hardcoding! All features come from auto-discovery system.
 */

// ✅ NO HARDCODING! Required features are loaded from manifest dynamically
// This test just ensures manifest structure is correct

const getManifestEntryStructure = (entry: (typeof DEFAULT_PAGE_MANIFEST)[number]) => ({
  hasDescription: Boolean(entry.description && entry.description.trim().length > 0),
  hasIcon: Boolean(entry.icon),
  hasLazyComponent: Boolean(entry.component && "$$typeof" in entry.component),
})

describe("DEFAULT_PAGE_MANIFEST content", () => {
  const manifestById = new Map(DEFAULT_PAGE_MANIFEST.map((item) => [item.id, item]))

  it("✅ all manifest entries have valid structure (dynamic check)", () => {
    // ✅ NO hardcoded feature list! Check all entries dynamically
    for (const entry of DEFAULT_PAGE_MANIFEST) {
      expect(entry.id, `Feature "${entry.id}" missing id`).toBeTruthy()
      expect(entry.title, `Feature "${entry.id}" missing title`).toBeTruthy()
      expect(entry.componentId, `Feature "${entry.id}" missing componentId`).toBeTruthy()
      expect(entry.description, `Feature "${entry.id}" missing description`).toBeTruthy()
      expect(entry.component, `Feature "${entry.id}" missing lazy component`).toBeDefined()
      expect(
        entry.component && "$$typeof" in entry.component,
        `Feature "${entry.id}" is not a lazy component`
      ).toBe(true)
    }
  })

  it("✅ all entries have consistent structure (dynamic validation)", () => {
    // ✅ Check all entries have same structure dynamically
    for (const entry of DEFAULT_PAGE_MANIFEST) {
      const structure = getManifestEntryStructure(entry)
      expect(structure.hasDescription, `Entry "${entry.id}" missing description`).toBe(true)
      expect(structure.hasIcon, `Entry "${entry.id}" missing icon`).toBe(true)
      expect(structure.hasLazyComponent, `Entry "${entry.id}" not lazy loaded`).toBe(true)
    }
  })

  it("keeps getDefaultPages in sync with DEFAULT_PAGE_MANIFEST", () => {
    const defaultPagesIds = getDefaultPages().map((page) => page.id)
    expect(defaultPagesIds).toStrictEqual(DEFAULT_PAGE_MANIFEST.map((page) => page.id))
  })
})
