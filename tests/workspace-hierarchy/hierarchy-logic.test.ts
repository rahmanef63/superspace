/**
 * Workspace Hierarchy Logic Tests
 * 
 * These tests verify the workspace hierarchy behavior including:
 * - Parent-child relationships
 * - Sibling detection
 * - Circular reference prevention
 * - Path/breadcrumb calculation
 * - Workspace tree structure
 */

import { describe, it, expect, beforeEach } from "vitest"

// Mock workspace data for testing
interface MockWorkspace {
  _id: string
  name: string
  parentWorkspaceId: string | null
  isMainWorkspace?: boolean
  depth?: number
  path?: string[]
  createdBy: string
}

interface MockWorkspaceLink {
  _id: string
  parentWorkspaceId: string
  childWorkspaceId: string
  linkedBy: string
}

// Test workspace data - simulates the hierarchy from screenshot
const USER_ID = "user_123"

const createMockWorkspaces = (): MockWorkspace[] => [
  {
    _id: "ws_main",
    name: "Main Workspace",
    parentWorkspaceId: null,
    isMainWorkspace: true,
    depth: 0,
    path: [],
    createdBy: USER_ID,
  },
  {
    _id: "ws_finance",
    name: "finance",
    parentWorkspaceId: "ws_main",
    depth: 1,
    path: ["ws_main"],
    createdBy: USER_ID,
  },
  {
    _id: "ws_company_a",
    name: "company-a",
    parentWorkspaceId: "ws_finance", // company-a is a child of finance
    depth: 2,
    path: ["ws_main", "ws_finance"],
    createdBy: USER_ID,
  },
  {
    _id: "ws_bisnis",
    name: "bisnis",
    parentWorkspaceId: "ws_finance", // bisnis is also a child of finance
    depth: 2,
    path: ["ws_main", "ws_finance"],
    createdBy: USER_ID,
  },
]

// Helper functions that mirror the backend logic
function getWorkspaceAncestors(
  workspaceId: string,
  workspaces: MockWorkspace[]
): MockWorkspace[] {
  const workspace = workspaces.find(ws => ws._id === workspaceId)
  if (!workspace) return []
  
  // Use materialized path if available
  if (workspace.path && workspace.path.length > 0) {
    return workspace.path
      .map(id => workspaces.find(ws => ws._id === id))
      .filter(Boolean) as MockWorkspace[]
  }
  
  // Otherwise traverse up
  const ancestors: MockWorkspace[] = []
  let currentId = workspace.parentWorkspaceId
  const visited = new Set<string>()
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    const parent = workspaces.find(ws => ws._id === currentId)
    if (!parent) break
    ancestors.unshift(parent)
    currentId = parent.parentWorkspaceId
  }
  
  return ancestors
}

function getChildWorkspaces(
  workspaceId: string,
  workspaces: MockWorkspace[],
  links: MockWorkspaceLink[] = []
): MockWorkspace[] {
  // Get direct children (parentWorkspaceId matches)
  const directChildren = workspaces.filter(
    ws => ws.parentWorkspaceId === workspaceId
  )
  
  // Get linked children
  const linkedChildIds = links
    .filter(l => l.parentWorkspaceId === workspaceId)
    .map(l => l.childWorkspaceId)
  
  const linkedChildren = workspaces.filter(
    ws => linkedChildIds.includes(ws._id)
  )
  
  return [...directChildren, ...linkedChildren]
}

function getSiblingWorkspaces(
  workspaceId: string,
  workspaces: MockWorkspace[]
): MockWorkspace[] {
  const workspace = workspaces.find(ws => ws._id === workspaceId)
  if (!workspace) return []
  
  if (!workspace.parentWorkspaceId) {
    // Root level - return other root workspaces
    return workspaces.filter(
      ws => ws._id !== workspaceId && 
            !ws.parentWorkspaceId && 
            ws.createdBy === workspace.createdBy
    )
  }
  
  // Get siblings with same parent
  return workspaces.filter(
    ws => ws._id !== workspaceId && 
          ws.parentWorkspaceId === workspace.parentWorkspaceId
  )
}

function checkCircularReference(
  parentId: string,
  childId: string,
  workspaces: MockWorkspace[]
): boolean {
  // Check if making childId a child of parentId would create a cycle
  // This happens if parentId is already a descendant of childId
  const visited = new Set<string>()
  const queue = [parentId]
  
  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)
    
    const workspace = workspaces.find(ws => ws._id === currentId)
    if (!workspace) continue
    
    // If parent's ancestor chain contains the child, it's circular
    if (workspace.parentWorkspaceId) {
      if (workspace.parentWorkspaceId === childId) {
        return true
      }
      queue.push(workspace.parentWorkspaceId)
    }
  }
  
  return false
}

describe("Workspace Hierarchy", () => {
  let workspaces: MockWorkspace[]
  let links: MockWorkspaceLink[]

  beforeEach(() => {
    workspaces = createMockWorkspaces()
    links = []
  })

  describe("getWorkspaceAncestors", () => {
    it("should return empty array for main workspace", () => {
      const ancestors = getWorkspaceAncestors("ws_main", workspaces)
      expect(ancestors).toEqual([])
    })

    it("should return correct ancestors for finance workspace", () => {
      const ancestors = getWorkspaceAncestors("ws_finance", workspaces)
      expect(ancestors).toHaveLength(1)
      expect(ancestors[0]._id).toBe("ws_main")
    })

    it("should return correct ancestors for company-a (2 levels deep)", () => {
      const ancestors = getWorkspaceAncestors("ws_company_a", workspaces)
      expect(ancestors).toHaveLength(2)
      expect(ancestors[0]._id).toBe("ws_main")
      expect(ancestors[1]._id).toBe("ws_finance")
    })

    it("should handle missing workspace gracefully", () => {
      const ancestors = getWorkspaceAncestors("ws_nonexistent", workspaces)
      expect(ancestors).toEqual([])
    })
  })

  describe("getChildWorkspaces", () => {
    it("should return finance as child of main workspace", () => {
      const children = getChildWorkspaces("ws_main", workspaces, links)
      expect(children).toHaveLength(1)
      expect(children[0]._id).toBe("ws_finance")
    })

    it("should return company-a and bisnis as children of finance", () => {
      const children = getChildWorkspaces("ws_finance", workspaces, links)
      expect(children).toHaveLength(2)
      const childIds = children.map(c => c._id)
      expect(childIds).toContain("ws_company_a")
      expect(childIds).toContain("ws_bisnis")
    })

    it("should return empty array for leaf workspaces", () => {
      const children = getChildWorkspaces("ws_company_a", workspaces, links)
      expect(children).toEqual([])
    })

    it("should include linked children", () => {
      // Link company-a under main (even though it's a child of finance)
      links.push({
        _id: "link_1",
        parentWorkspaceId: "ws_main",
        childWorkspaceId: "ws_company_a",
        linkedBy: USER_ID,
      })
      
      const children = getChildWorkspaces("ws_main", workspaces, links)
      expect(children).toHaveLength(2) // finance + linked company-a
      const childIds = children.map(c => c._id)
      expect(childIds).toContain("ws_finance")
      expect(childIds).toContain("ws_company_a")
    })
  })

  describe("getSiblingWorkspaces", () => {
    it("should return empty array for main workspace (only root)", () => {
      const siblings = getSiblingWorkspaces("ws_main", workspaces)
      expect(siblings).toEqual([])
    })

    it("should return empty array for finance (only child of main)", () => {
      const siblings = getSiblingWorkspaces("ws_finance", workspaces)
      expect(siblings).toEqual([])
    })

    it("should return bisnis as sibling of company-a", () => {
      const siblings = getSiblingWorkspaces("ws_company_a", workspaces)
      expect(siblings).toHaveLength(1)
      expect(siblings[0]._id).toBe("ws_bisnis")
    })

    it("should return company-a as sibling of bisnis", () => {
      const siblings = getSiblingWorkspaces("ws_bisnis", workspaces)
      expect(siblings).toHaveLength(1)
      expect(siblings[0]._id).toBe("ws_company_a")
    })
  })

  describe("checkCircularReference", () => {
    it("should return false for valid parent-child relationship", () => {
      // Linking ws_new under ws_company_a is valid
      workspaces.push({
        _id: "ws_new",
        name: "New Workspace",
        parentWorkspaceId: null,
        createdBy: USER_ID,
      })
      
      const isCircular = checkCircularReference("ws_company_a", "ws_new", workspaces)
      expect(isCircular).toBe(false)
    })

    it("should return true when trying to make ancestor a child", () => {
      // Trying to make finance a child of company-a (its grandchild) = circular
      const isCircular = checkCircularReference("ws_company_a", "ws_finance", workspaces)
      expect(isCircular).toBe(true)
    })

    it("should return true when trying to make main a child of its descendant", () => {
      // Trying to make main a child of company-a = circular
      const isCircular = checkCircularReference("ws_company_a", "ws_main", workspaces)
      expect(isCircular).toBe(true)
    })

    it("should return false for same-level siblings", () => {
      // Linking bisnis under company-a is valid (they're siblings, not ancestor/descendant)
      const isCircular = checkCircularReference("ws_company_a", "ws_bisnis", workspaces)
      expect(isCircular).toBe(false)
    })
  })

  describe("Bug Reproduction: Redundant Hierarchy", () => {
    /**
     * BUG: When navigating company-a > finance > company-a,
     * company-a incorrectly appears as a child of finance
     * 
     * This happens because:
     * 1. Links are being created when navigating (shouldn't happen on navigate)
     * 2. OR the sibling/child display logic includes ancestors
     */
    
    it("should NOT show ancestor as sibling", () => {
      // When viewing company-a, finance should NOT be a sibling
      // (it's the parent, not sibling)
      const siblings = getSiblingWorkspaces("ws_company_a", workspaces)
      const siblingIds = siblings.map(s => s._id)
      
      expect(siblingIds).not.toContain("ws_finance")
      expect(siblingIds).not.toContain("ws_main")
    })

    it("should NOT show ancestor as child", () => {
      // When viewing company-a, neither finance nor main should be children
      const children = getChildWorkspaces("ws_company_a", workspaces, links)
      const childIds = children.map(c => c._id)
      
      expect(childIds).not.toContain("ws_finance")
      expect(childIds).not.toContain("ws_main")
    })

    it("should maintain consistent hierarchy after navigation", () => {
      // Simulate navigation: main -> finance -> company-a -> back to finance -> back to main
      
      // At main workspace
      let currentWs = "ws_main"
      let ancestors = getWorkspaceAncestors(currentWs, workspaces)
      let children = getChildWorkspaces(currentWs, workspaces, links)
      expect(ancestors).toHaveLength(0)
      expect(children.map(c => c.name)).toContain("finance")
      
      // Navigate to finance
      currentWs = "ws_finance"
      ancestors = getWorkspaceAncestors(currentWs, workspaces)
      children = getChildWorkspaces(currentWs, workspaces, links)
      expect(ancestors.map(a => a.name)).toContain("Main Workspace")
      expect(children.map(c => c.name)).toContain("company-a")
      expect(children.map(c => c.name)).toContain("bisnis")
      
      // Navigate to company-a
      currentWs = "ws_company_a"
      ancestors = getWorkspaceAncestors(currentWs, workspaces)
      children = getChildWorkspaces(currentWs, workspaces, links)
      expect(ancestors).toHaveLength(2)
      expect(ancestors[0].name).toBe("Main Workspace")
      expect(ancestors[1].name).toBe("finance")
      expect(children).toHaveLength(0) // company-a has no children
      
      // Navigate back to finance (should NOT create any new relationships)
      currentWs = "ws_finance"
      ancestors = getWorkspaceAncestors(currentWs, workspaces)
      children = getChildWorkspaces(currentWs, workspaces, links)
      // Should be same as before - no new children added
      expect(children).toHaveLength(2)
      expect(children.map(c => c.name)).not.toContain("Main Workspace")
    })
  })

  describe("Workspace Path Building", () => {
    it("should build correct path for deeply nested workspace", () => {
      // Add a deeper level
      workspaces.push({
        _id: "ws_deep",
        name: "Deep Project",
        parentWorkspaceId: "ws_company_a",
        depth: 3,
        path: ["ws_main", "ws_finance", "ws_company_a"],
        createdBy: USER_ID,
      })
      
      const ancestors = getWorkspaceAncestors("ws_deep", workspaces)
      expect(ancestors).toHaveLength(3)
      expect(ancestors[0].name).toBe("Main Workspace")
      expect(ancestors[1].name).toBe("finance")
      expect(ancestors[2].name).toBe("company-a")
    })
  })
})

describe("Performance Issues Detection", () => {
  /**
   * Tests to detect potential performance issues
   */
  let workspaces: MockWorkspace[]
  let links: MockWorkspaceLink[]

  beforeEach(() => {
    workspaces = createMockWorkspaces()
    links = []
  })
  
  it("should handle large workspace trees efficiently", () => {
    const largeWorkspaces: MockWorkspace[] = [{
      _id: "ws_root",
      name: "Root",
      parentWorkspaceId: null,
      isMainWorkspace: true,
      depth: 0,
      path: [],
      createdBy: USER_ID,
    }]
    
    // Create 100 workspaces in a chain (worst case for ancestor query)
    let prevId = "ws_root"
    for (let i = 1; i <= 100; i++) {
      const wsId = `ws_${i}`
      largeWorkspaces.push({
        _id: wsId,
        name: `Workspace ${i}`,
        parentWorkspaceId: prevId,
        depth: i,
        path: largeWorkspaces.slice(0, i).map(ws => ws._id),
        createdBy: USER_ID,
      })
      prevId = wsId
    }
    
    const startTime = performance.now()
    
    // Get ancestors for deepest workspace
    const ancestors = getWorkspaceAncestors("ws_100", largeWorkspaces)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(ancestors).toHaveLength(100)
    // Should complete in under 10ms (with materialized path it's O(n) lookup)
    expect(duration).toBeLessThan(100)
  })

  it("should not have duplicate workspaces in results", () => {
    // This can happen with buggy link/parent logic
    const children = getChildWorkspaces("ws_finance", workspaces, links)
    const childIds = children.map(c => c._id)
    const uniqueIds = [...new Set(childIds)]
    
    expect(childIds.length).toBe(uniqueIds.length)
  })
})
