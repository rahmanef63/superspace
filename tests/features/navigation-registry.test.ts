import { describe, expect, it } from "vitest"

import { WORKSPACE_NAVIGATION_ITEMS } from "@/frontend/views/static/workspaces/constants/navigation"
import type { ViewType } from "@/frontend/views/static/workspaces/types"
import { DEFAULT_PAGE_MANIFEST } from "@/frontend/views/manifest"

const REQUIRED_SLUGS = [
  "overview",
  "chats",
  "ai",
  "calls",
  "status",
  "starred",
  "archived",
  "documents",
  "projects",
  "reports",
  "support",
  "crm",
  "notifications",
  "workflows",
  "members",
  "friends",
  "menus",
  "invitations",
  "user-settings",
  "workspace-settings",
] as const satisfies readonly ViewType[]

const PATH_OVERRIDES: Partial<Record<ViewType, string>> = {
  "workspace-settings": "/settings",
  "user-settings": "/user-settings",
}

describe("WORKSPACE_NAVIGATION_ITEMS registry", () => {
  const navMap = new Map<ViewType, (typeof WORKSPACE_NAVIGATION_ITEMS)[number]>(
    WORKSPACE_NAVIGATION_ITEMS.map((item) => [item.key, item]),
  )
  const manifestMap = new Map(DEFAULT_PAGE_MANIFEST.map((item) => [item.id, item] as const))

  it("keeps navigation keys unique", () => {
    expect(navMap.size).toBe(WORKSPACE_NAVIGATION_ITEMS.length)
  })

  it("exposes all required slugs for dashboard navigation", () => {
    for (const slug of REQUIRED_SLUGS) {
      const entry = navMap.get(slug)
      expect(entry, `Missing workspace navigation entry for "${slug}"`).toBeDefined()
      expect(entry?.label, `Missing label for workspace navigation slug "${slug}"`).toBeTruthy()
      expect(entry?.icon, `Missing icon for workspace navigation slug "${slug}"`).toBeTruthy()

      const expectedPath = PATH_OVERRIDES[slug] ?? `/${slug}`
      expect(entry?.path, `Unexpected path for slug "${slug}"`).toBe(expectedPath)
    }
  })

  it("stays in sync with the page manifest for required slugs", () => {
    for (const slug of REQUIRED_SLUGS) {
      const manifestEntry = manifestMap.get(slug)
      expect(manifestEntry, `Missing manifest page for "${slug}"`).toBeDefined()
      expect(
        typeof manifestEntry?.componentId === "string" && manifestEntry?.componentId.length > 0,
        `Manifest entry for "${slug}" is missing a componentId`,
      ).toBe(true)
    }
  })
})
