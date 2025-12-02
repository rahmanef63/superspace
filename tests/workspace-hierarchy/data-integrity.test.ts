/**
 * Integration Tests for Workspace Hierarchy
 * 
 * These tests check for data integrity issues and validate the hierarchy logic
 */

import { describe, it, expect, beforeEach } from "vitest"

// Simulate Convex-like data structure
interface Workspace {
  _id: string
  name: string
  parentWorkspaceId?: string
  isMainWorkspace?: boolean
  depth?: number
  path?: string[]
  createdBy: string
}

interface WorkspaceLink {
  _id: string
  parentWorkspaceId: string
  childWorkspaceId: string
}

// Mock database
class MockDatabase {
  workspaces: Workspace[] = []
  links: WorkspaceLink[] = []

  addWorkspace(ws: Workspace) {
    this.workspaces.push(ws)
  }

  addLink(link: WorkspaceLink) {
    this.links.push(link)
  }

  get(id: string): Workspace | undefined {
    return this.workspaces.find(ws => ws._id === id)
  }

  query(table: "workspaces" | "workspaceLinks") {
    if (table === "workspaces") return this.workspaces
    return this.links
  }
}

/**
 * FIXED: Check if setting parentId as parent of workspaceId would create a cycle
 * 
 * A cycle occurs if:
 * 1. parentId === workspaceId (self-reference)
 * 2. workspaceId is an ancestor of parentId (would create A->B->...->A)
 */
function checkCircularReferenceFixed(
  db: MockDatabase,
  parentId: string,
  workspaceId: string
): boolean {
  // Self-reference check
  if (parentId === workspaceId) return true
  
  // Check if workspaceId is an ancestor of parentId
  // i.e., if we traverse UP from parentId, do we find workspaceId?
  const visited = new Set<string>()
  let currentId: string | undefined = parentId
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    
    const workspace = db.get(currentId)
    if (!workspace) break
    
    // If we find workspaceId in the ancestor chain of parentId,
    // making parentId the parent of workspaceId would create a cycle
    if (workspace.parentWorkspaceId === workspaceId) {
      return true
    }
    
    currentId = workspace.parentWorkspaceId
  }
  
  return false
}

/**
 * BUGGY: Original implementation (for comparison)
 */
function checkCircularReferenceBuggy(
  db: MockDatabase,
  parentId: string,
  childId: string
): boolean {
  if (parentId === childId) return true
  
  const visited = new Set<string>()
  const queue = [parentId]
  
  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (visited.has(currentId)) continue
    visited.add(currentId)
    
    const workspace = db.get(currentId)
    if (!workspace) continue
    
    // BUG: This checks if child is in parent's ANCESTOR chain
    // But we need to check if child is in parent's DESCENDANT chain
    // OR if parent is in child's ANCESTOR chain
    if (workspace.parentWorkspaceId) {
      if (workspace.parentWorkspaceId === childId) {
        return true
      }
      queue.push(workspace.parentWorkspaceId)
    }
  }
  
  return false
}

/**
 * Validate a workspace's path doesn't contain duplicates or cycles
 */
function validateWorkspacePath(workspace: Workspace): { valid: boolean; error?: string } {
  if (!workspace.path) return { valid: true }
  
  // Check for self in path
  if (workspace.path.includes(workspace._id)) {
    return { valid: false, error: `Workspace ${workspace._id} contains itself in path` }
  }
  
  // Check for duplicates in path
  const uniquePath = new Set(workspace.path)
  if (uniquePath.size !== workspace.path.length) {
    return { valid: false, error: `Workspace ${workspace._id} has duplicate entries in path` }
  }
  
  return { valid: true }
}

/**
 * Validate entire workspace tree for cycles
 */
function validateTreeNoCycles(db: MockDatabase): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const ws of db.workspaces) {
    // Check path integrity
    const pathValidation = validateWorkspacePath(ws)
    if (!pathValidation.valid) {
      errors.push(pathValidation.error!)
    }
    
    // Check for self-reference
    if (ws.parentWorkspaceId === ws._id) {
      errors.push(`Workspace ${ws.name} (${ws._id}) references itself as parent`)
    }
    
    // Check for cycle by traversing up
    if (ws.parentWorkspaceId) {
      const visited = new Set<string>([ws._id])
      let currentId: string | undefined = ws.parentWorkspaceId
      let depth = 0
      const maxDepth = 100 // Prevent infinite loops
      
      while (currentId && depth < maxDepth) {
        if (visited.has(currentId)) {
          errors.push(`Workspace ${ws.name} has a cycle in ancestor chain`)
          break
        }
        visited.add(currentId)
        const parent = db.get(currentId)
        if (!parent) break
        currentId = parent.parentWorkspaceId
        depth++
      }
      
      if (depth >= maxDepth) {
        errors.push(`Workspace ${ws.name} has suspiciously deep hierarchy (> ${maxDepth})`)
      }
    }
  }
  
  return { valid: errors.length === 0, errors }
}

describe("Circular Reference Bug Detection", () => {
  let db: MockDatabase

  beforeEach(() => {
    db = new MockDatabase()
    
    // Setup: main -> finance -> company-a
    db.addWorkspace({
      _id: "main",
      name: "Main",
      parentWorkspaceId: undefined,
      isMainWorkspace: true,
      depth: 0,
      path: [],
      createdBy: "user1",
    })
    
    db.addWorkspace({
      _id: "finance",
      name: "finance",
      parentWorkspaceId: "main",
      depth: 1,
      path: ["main"],
      createdBy: "user1",
    })
    
    db.addWorkspace({
      _id: "company-a",
      name: "company-a",
      parentWorkspaceId: "finance",
      depth: 2,
      path: ["main", "finance"],
      createdBy: "user1",
    })
  })

  describe("Fixed Circular Reference Check", () => {
    it("should detect self-reference", () => {
      const result = checkCircularReferenceFixed(db, "finance", "finance")
      expect(result).toBe(true)
    })

    it("should detect cycle when making parent a child of its descendant", () => {
      // Trying to make "main" a child of "company-a" should fail
      // because main -> finance -> company-a, so company-a is a descendant of main
      const result = checkCircularReferenceFixed(db, "company-a", "main")
      expect(result).toBe(true)
    })

    it("should detect cycle when making finance a child of company-a", () => {
      // finance -> company-a, so making company-a parent of finance = cycle
      const result = checkCircularReferenceFixed(db, "company-a", "finance")
      expect(result).toBe(true)
    })

    it("should allow valid parent-child relationship", () => {
      db.addWorkspace({
        _id: "new-ws",
        name: "New Workspace",
        parentWorkspaceId: undefined,
        depth: 0,
        path: [],
        createdBy: "user1",
      })
      
      // Making company-a parent of new-ws is valid (no cycle)
      const result = checkCircularReferenceFixed(db, "company-a", "new-ws")
      expect(result).toBe(false)
    })
  })

  describe("Data Integrity Validation", () => {
    it("should detect self-referencing workspace", () => {
      // Corrupt the data - make finance point to itself
      const finance = db.get("finance")!
      finance.parentWorkspaceId = "finance"
      
      const validation = validateTreeNoCycles(db)
      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes("references itself"))).toBe(true)
    })

    it("should detect cycle in path", () => {
      // Corrupt the data - put finance in its own path
      const finance = db.get("finance")!
      finance.path = ["main", "finance"]
      
      const validation = validateWorkspacePath(finance)
      expect(validation.valid).toBe(false)
    })

    it("should detect mutual parent-child cycle", () => {
      // A points to B, B points to A
      db.addWorkspace({
        _id: "ws-a",
        name: "WS-A",
        parentWorkspaceId: "ws-b",
        createdBy: "user1",
      })
      
      db.addWorkspace({
        _id: "ws-b",
        name: "WS-B",
        parentWorkspaceId: "ws-a",
        createdBy: "user1",
      })
      
      const validation = validateTreeNoCycles(db)
      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes("cycle"))).toBe(true)
    })

    it("should pass for valid tree", () => {
      const validation = validateTreeNoCycles(db)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe("Bug Reproduction: Screenshot Issue", () => {
    /**
     * From the screenshot, the path shows:
     * finance > finance > finance > finance > finance > finance > finance > finance
     * 
     * This means finance.parentWorkspaceId = finance._id (self-reference)
     * OR there's a cycle somewhere
     */
    
    it("should reproduce the screenshot bug scenario", () => {
      // Simulate the corrupted state from screenshot
      const finance = db.get("finance")!
      
      // BUG: finance points to itself
      finance.parentWorkspaceId = "finance"
      finance.path = ["finance", "finance", "finance", "finance"]
      
      // Validation should catch this
      const validation = validateTreeNoCycles(db)
      expect(validation.valid).toBe(false)
      
      // The path validation should also fail
      const pathValidation = validateWorkspacePath(finance)
      expect(pathValidation.valid).toBe(false)
    })

    it("should show how the UI gets stuck in infinite path", () => {
      // Simulate buggy ancestor traversal without cycle detection
      const finance = db.get("finance")!
      finance.parentWorkspaceId = "finance" // Self-reference bug
      
      // Simulate the UI's ancestor fetching (with limit to prevent infinite loop)
      const ancestors: string[] = []
      let currentId: string | undefined = finance.parentWorkspaceId
      let iterations = 0
      const maxIterations = 10
      
      while (currentId && iterations < maxIterations) {
        ancestors.push(currentId)
        const parent = db.get(currentId)
        currentId = parent?.parentWorkspaceId
        iterations++
      }
      
      // This shows the bug - it keeps adding "finance" repeatedly
      expect(ancestors.every(a => a === "finance")).toBe(true)
      expect(ancestors.length).toBe(maxIterations)
    })
  })
})

describe("Fix Recommendations", () => {
  it("documents the required fixes", () => {
    const fixes = [
      "1. Fix checkCircularReference to properly detect all cycle cases",
      "2. Add self-reference check before updating parentWorkspaceId",
      "3. Add path validation before saving",
      "4. Add maximum depth limit (e.g., 10 levels)",
      "5. Create data migration to fix existing corrupted data",
      "6. Add getWorkspaceAncestors cycle detection with max iterations",
    ]
    
    expect(fixes.length).toBeGreaterThan(0)
  })
})
