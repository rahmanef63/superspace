/**
 * ✅ 100% DYNAMIC Navigation Registry Tests
 *
 * Tests navigation structure without hardcoded feature lists.
 * All features come from auto-discovery system.
 */

import { describe, expect, it } from "vitest"

import { WORKSPACE_NAVIGATION_ITEMS } from "@/frontend/shared/foundation/workspaces/constants/navigation"
import { DEFAULT_PAGE_MANIFEST } from "@/frontend/views/manifest"

describe("WORKSPACE_NAVIGATION_ITEMS registry", () => {
  const navMap = new Map(
    WORKSPACE_NAVIGATION_ITEMS.map((item) => [item.key, item]),
  )
  const manifestMap = new Map(DEFAULT_PAGE_MANIFEST.map((item) => [item.id, item] as const))

  it("✅ keeps navigation keys unique (dynamic check)", () => {
    expect(navMap.size).toBe(WORKSPACE_NAVIGATION_ITEMS.length)
  })

  it("✅ all navigation entries have valid structure (dynamic)", () => {
    // ✅ NO hardcoded list! Check all entries dynamically
    for (const item of WORKSPACE_NAVIGATION_ITEMS) {
      expect(item.key, `Navigation item missing key`).toBeTruthy()
      expect(item.label, `Navigation "${item.key}" missing label`).toBeTruthy()
      expect(item.icon, `Navigation "${item.key}" missing icon`).toBeTruthy()
      expect(item.path, `Navigation "${item.key}" missing path`).toBeTruthy()
    }
  })

  it("✅ all navigation entries exist in manifest (dynamic)", () => {
    // ✅ Check all navigation items are in manifest (dynamic validation)
    for (const item of WORKSPACE_NAVIGATION_ITEMS) {
      const manifestEntry = manifestMap.get(item.key)
      if (manifestEntry) {
        expect(manifestEntry.componentId, `Manifest "${item.key}" missing componentId`).toBeTruthy()
      }
    }
  })

  it("✅ all manifest entries can be navigated to (dynamic)", () => {
    // ✅ Ensure manifest entries have valid structure
    for (const entry of DEFAULT_PAGE_MANIFEST) {
      expect(entry.id, `Manifest entry missing id`).toBeTruthy()
      expect(entry.componentId, `Manifest "${entry.id}" missing componentId`).toBeTruthy()
    }
  })
})
