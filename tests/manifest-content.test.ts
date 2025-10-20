import { describe, it, expect } from "vitest"

import { DEFAULT_PAGE_MANIFEST, getDefaultPages } from "@/frontend/views/manifest"

/**
 * Manifest content regression tests
 *
 * Ensure the core navigation pages remain present so users
 * always see the expected sections in the dashboard sidebar.
 */

const REQUIRED_FEATURES = [
  { id: "reports", title: "Reports", componentId: "ReportsPage" },
  { id: "support", title: "Support", componentId: "SupportPage" },
  { id: "projects", title: "Projects", componentId: "ProjectsPage" },
  { id: "crm", title: "CRM", componentId: "CRMPage" },
  { id: "notifications", title: "Notifications", componentId: "NotificationsPage" },
  { id: "workflows", title: "Workflows", componentId: "WorkflowsPage" },
  { id: "status", title: "Status", componentId: "StatusPage" },
  { id: "calls", title: "Calls", componentId: "CallsPage" },
  { id: "ai", title: "AI", componentId: "AIPage" },
  { id: "starred", title: "Starred", componentId: "StarredPage" },
  { id: "archived", title: "Archived", componentId: "ArchivedPage" },
]

const WORKING_REFERENCE_FEATURE_IDS = ["overview", "chats", "documents", "members"]

const getManifestEntryStructure = (entry: (typeof DEFAULT_PAGE_MANIFEST)[number]) => ({
  hasDescription: Boolean(entry.description && entry.description.trim().length > 0),
  hasIcon: Boolean(entry.icon),
  hasLazyComponent: Boolean(entry.component && "$$typeof" in entry.component),
})

describe("DEFAULT_PAGE_MANIFEST content", () => {
  const manifestById = new Map(DEFAULT_PAGE_MANIFEST.map((item) => [item.id, item]))

  it("includes all required feature entries with matching metadata", () => {
    for (const feature of REQUIRED_FEATURES) {
      const entry = manifestById.get(feature.id)
      expect(entry, `Missing manifest entry for "${feature.id}"`).toBeDefined()
      expect(entry?.title, `Unexpected title for "${feature.id}"`).toBe(feature.title)
      expect(entry?.componentId, `Unexpected componentId for "${feature.id}"`).toBe(feature.componentId)
      expect(entry?.description, `Missing description for "${feature.id}"`).toBeTruthy()
      expect(entry?.component, `Missing lazy component for "${feature.id}"`).toBeDefined()
      expect(entry?.component && "$$typeof" in entry.component, `Feature "${feature.id}" is not a lazy component`).toBe(true)
    }
  })

  it("matches the metadata structure of working feature entries", () => {
    const referenceStructures = new Set(
      WORKING_REFERENCE_FEATURE_IDS.map((id) => {
        const referenceEntry = manifestById.get(id)
        expect(referenceEntry, `Missing reference manifest entry for "${id}"`).toBeDefined()
        return JSON.stringify(getManifestEntryStructure(referenceEntry!))
      }),
    )

    for (const feature of REQUIRED_FEATURES) {
      const entry = manifestById.get(feature.id)
      expect(entry, `Missing manifest entry for "${feature.id}"`).toBeDefined()
      const structure = JSON.stringify(getManifestEntryStructure(entry!))
      expect(
        referenceStructures.has(structure),
        `Manifest entry for "${feature.id}" does not match the structure of known working features`,
      ).toBe(true)
    }
  })

  it("keeps getDefaultPages in sync with DEFAULT_PAGE_MANIFEST", () => {
    const defaultPagesIds = getDefaultPages().map((page) => page.id)
    expect(defaultPagesIds).toStrictEqual(DEFAULT_PAGE_MANIFEST.map((page) => page.id))
  })
})
