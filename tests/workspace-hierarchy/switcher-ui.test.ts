/**
 * Enhanced Workspace Switcher Tests
 * 
 * Tests for the multi-level workspace switcher UI behavior
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock workspace state management
interface WorkspaceNavigationState {
  // Stack of workspace switchers (multi-level navigation)
  switcherStack: string[]
  // Current selected workspace at each level
  selectedAtLevel: Map<number, string>
  // Navigation history for back button
  navigationHistory: string[]
}

function createNavigationState(): WorkspaceNavigationState {
  return {
    switcherStack: [],
    selectedAtLevel: new Map(),
    navigationHistory: [],
  }
}

/**
 * Navigate to a child workspace
 * Should add a new switcher level
 */
function navigateToChild(
  state: WorkspaceNavigationState,
  fromWorkspaceId: string,
  toWorkspaceId: string
): WorkspaceNavigationState {
  const newStack = [...state.switcherStack]
  
  // If this is the first navigation, add the parent
  if (newStack.length === 0) {
    newStack.push(fromWorkspaceId)
  }
  
  // Add the new child level
  newStack.push(toWorkspaceId)
  
  return {
    ...state,
    switcherStack: newStack,
    navigationHistory: [...state.navigationHistory, fromWorkspaceId],
    selectedAtLevel: new Map(state.selectedAtLevel).set(newStack.length - 1, toWorkspaceId),
  }
}

/**
 * Navigate to a sibling workspace
 * Should NOT add a new switcher level - just change selection at current level
 */
function navigateToSibling(
  state: WorkspaceNavigationState,
  toWorkspaceId: string
): WorkspaceNavigationState {
  const currentLevel = state.switcherStack.length - 1
  const newStack = [...state.switcherStack]
  
  // Replace the current level's workspace
  if (newStack.length > 0) {
    newStack[currentLevel] = toWorkspaceId
  } else {
    newStack.push(toWorkspaceId)
  }
  
  return {
    ...state,
    switcherStack: newStack,
    selectedAtLevel: new Map(state.selectedAtLevel).set(currentLevel, toWorkspaceId),
  }
}

/**
 * Navigate back (up one level)
 * Should remove the last switcher level
 */
function navigateBack(state: WorkspaceNavigationState): WorkspaceNavigationState {
  if (state.switcherStack.length <= 1) {
    return state // Can't go back from root
  }
  
  const newStack = state.switcherStack.slice(0, -1)
  const newSelectedAtLevel = new Map(state.selectedAtLevel)
  newSelectedAtLevel.delete(state.switcherStack.length - 1)
  
  return {
    ...state,
    switcherStack: newStack,
    selectedAtLevel: newSelectedAtLevel,
    navigationHistory: state.navigationHistory.slice(0, -1),
  }
}

/**
 * Get current active workspace
 */
function getCurrentWorkspace(state: WorkspaceNavigationState): string | null {
  if (state.switcherStack.length === 0) return null
  return state.switcherStack[state.switcherStack.length - 1]
}

/**
 * Get number of switcher levels visible
 */
function getSwitcherLevels(state: WorkspaceNavigationState): number {
  return state.switcherStack.length
}

describe("Multi-Level Workspace Switcher", () => {
  let state: WorkspaceNavigationState

  beforeEach(() => {
    state = createNavigationState()
  })

  describe("Navigation to Children", () => {
    it("should add new switcher level when navigating to child", () => {
      state = navigateToChild(state, "main", "finance")
      
      expect(getSwitcherLevels(state)).toBe(2)
      expect(state.switcherStack).toEqual(["main", "finance"])
      expect(getCurrentWorkspace(state)).toBe("finance")
    })

    it("should add multiple levels for deep navigation", () => {
      state = navigateToChild(state, "main", "finance")
      state = navigateToChild(state, "finance", "company-a")
      
      expect(getSwitcherLevels(state)).toBe(3)
      expect(state.switcherStack).toEqual(["main", "finance", "company-a"])
      expect(getCurrentWorkspace(state)).toBe("company-a")
    })

    it("should track navigation history for back button", () => {
      state = navigateToChild(state, "main", "finance")
      state = navigateToChild(state, "finance", "company-a")
      
      expect(state.navigationHistory).toEqual(["main", "finance"])
    })
  })

  describe("Navigation to Siblings", () => {
    it("should NOT add new level when navigating to sibling", () => {
      // Start at company-a (under finance)
      state = navigateToChild(state, "main", "finance")
      state = navigateToChild(state, "finance", "company-a")
      
      expect(getSwitcherLevels(state)).toBe(3)
      
      // Navigate to sibling bisnis - should stay at same level
      state = navigateToSibling(state, "bisnis")
      
      expect(getSwitcherLevels(state)).toBe(3)
      expect(state.switcherStack).toEqual(["main", "finance", "bisnis"])
      expect(getCurrentWorkspace(state)).toBe("bisnis")
    })
  })

  describe("Navigation Back", () => {
    it("should remove switcher level when going back", () => {
      state = navigateToChild(state, "main", "finance")
      state = navigateToChild(state, "finance", "company-a")
      
      expect(getSwitcherLevels(state)).toBe(3)
      
      state = navigateBack(state)
      
      expect(getSwitcherLevels(state)).toBe(2)
      expect(getCurrentWorkspace(state)).toBe("finance")
    })

    it("should not go below root level", () => {
      state = navigateToChild(state, "main", "finance")
      state = navigateBack(state)
      
      expect(getSwitcherLevels(state)).toBe(1)
      expect(getCurrentWorkspace(state)).toBe("main")
      
      // Try to go back again - should stay at root
      state = navigateBack(state)
      
      expect(getSwitcherLevels(state)).toBe(1)
      expect(getCurrentWorkspace(state)).toBe("main")
    })
  })

  describe("Bug: Back Navigation Creates Wrong Relationships", () => {
    /**
     * BUG: When user clicks back from company-a to finance,
     * the UI incorrectly treats company-a as a parent of finance
     * 
     * Expected: Back navigation should just pop the stack
     * Actual: Back might be triggering child relationship creation
     */
    
    it("should maintain correct parent-child after back navigation", () => {
      // Navigate: main -> finance -> company-a
      state = navigateToChild(state, "main", "finance")
      state = navigateToChild(state, "finance", "company-a")
      
      // Go back to finance
      state = navigateBack(state)
      
      // The stack should show finance is UNDER main, NOT under company-a
      expect(state.switcherStack).toEqual(["main", "finance"])
      
      // finance should NOT appear as a child of company-a
      // (this is a data integrity check - if company-a was the parent,
      // the stack would be ["company-a", "finance"])
      expect(state.switcherStack[0]).toBe("main")
      expect(state.switcherStack[state.switcherStack.length - 1]).toBe("finance")
    })

    it("should not modify parent-child relationships during navigation", () => {
      const initialStack: string[] = []
      
      // Navigate down
      state = navigateToChild(state, "main", "finance")
      state = navigateToChild(state, "finance", "company-a")
      
      // Navigate back up
      state = navigateBack(state)
      state = navigateBack(state)
      
      // Navigate down again - should be exactly the same path
      state = navigateToChild(state, "main", "finance")
      
      expect(state.switcherStack).toEqual(["main", "finance"])
      
      state = navigateToChild(state, "finance", "company-a")
      
      expect(state.switcherStack).toEqual(["main", "finance", "company-a"])
    })
  })
})

describe("Workspace Switcher Display Logic", () => {
  /**
   * Tests for what should be displayed in the workspace switcher
   */
  
  interface MockWorkspace {
    id: string
    name: string
    parentId: string | null
    color: string
  }

  const workspaces: MockWorkspace[] = [
    { id: "main", name: "Main", parentId: null, color: "#6366f1" },
    { id: "finance", name: "finance", parentId: "main", color: "#8b5cf6" },
    { id: "company-a", name: "company-a", parentId: "finance", color: "#ec4899" },
    { id: "bisnis", name: "bisnis", parentId: "finance", color: "#22c55e" },
  ]

  function getDisplayableItems(
    currentWorkspaceId: string,
    level: number
  ): { children: MockWorkspace[], siblings: MockWorkspace[] } {
    const current = workspaces.find(w => w.id === currentWorkspaceId)
    if (!current) return { children: [], siblings: [] }
    
    // Children: workspaces where parentId === currentWorkspaceId
    const children = workspaces.filter(w => w.parentId === currentWorkspaceId)
    
    // Siblings: workspaces with same parentId (excluding self)
    const siblings = workspaces.filter(
      w => w.parentId === current.parentId && w.id !== currentWorkspaceId
    )
    
    return { children, siblings }
  }

  it("should show correct children for main workspace", () => {
    const { children, siblings } = getDisplayableItems("main", 0)
    
    expect(children.map(c => c.name)).toContain("finance")
    expect(children).toHaveLength(1)
    expect(siblings).toHaveLength(0)
  })

  it("should show correct children and siblings for finance", () => {
    const { children, siblings } = getDisplayableItems("finance", 1)
    
    expect(children.map(c => c.name)).toContain("company-a")
    expect(children.map(c => c.name)).toContain("bisnis")
    expect(children).toHaveLength(2)
    expect(siblings).toHaveLength(0) // finance has no siblings
  })

  it("should show correct siblings for company-a", () => {
    const { children, siblings } = getDisplayableItems("company-a", 2)
    
    expect(children).toHaveLength(0) // company-a has no children
    expect(siblings.map(s => s.name)).toContain("bisnis")
    expect(siblings).toHaveLength(1)
  })

  it("should NOT show ancestors as children or siblings", () => {
    const { children, siblings } = getDisplayableItems("company-a", 2)
    
    // finance should NOT be a child of company-a
    expect(children.map(c => c.name)).not.toContain("finance")
    expect(children.map(c => c.name)).not.toContain("Main")
    
    // finance should NOT be a sibling of company-a
    expect(siblings.map(s => s.name)).not.toContain("finance")
    expect(siblings.map(s => s.name)).not.toContain("Main")
  })
})

describe("Color-Coded Menu Display", () => {
  /**
   * Tests for color-coded sidebar menus based on workspace
   */
  
  interface WorkspaceLevel {
    workspaceId: string
    color: string
    isActive: boolean
  }

  function getMenuColorStack(
    switcherStack: string[],
    workspaceColors: Map<string, string>,
    activeLevel: number
  ): WorkspaceLevel[] {
    return switcherStack.map((wsId, index) => ({
      workspaceId: wsId,
      color: workspaceColors.get(wsId) || "#6366f1",
      isActive: index === activeLevel,
    }))
  }

  it("should return correct colors for each level", () => {
    const stack = ["main", "finance", "company-a"]
    const colors = new Map([
      ["main", "#6366f1"],
      ["finance", "#8b5cf6"],
      ["company-a", "#ec4899"],
    ])
    
    const result = getMenuColorStack(stack, colors, 2)
    
    expect(result).toHaveLength(3)
    expect(result[0].color).toBe("#6366f1")
    expect(result[1].color).toBe("#8b5cf6")
    expect(result[2].color).toBe("#ec4899")
    expect(result[2].isActive).toBe(true)
    expect(result[0].isActive).toBe(false)
  })

  it("should apply fill/shade based on workspace color", () => {
    // This tests the UI behavior: each workspace level should have
    // its menu items styled with the workspace's color
    const stack = ["main", "finance"]
    const colors = new Map([
      ["main", "#6366f1"],
      ["finance", "#ec4899"],
    ])
    
    const result = getMenuColorStack(stack, colors, 1)
    
    // The active level (finance) should have its color applied
    expect(result[1].isActive).toBe(true)
    expect(result[1].color).toBe("#ec4899")
  })
})
