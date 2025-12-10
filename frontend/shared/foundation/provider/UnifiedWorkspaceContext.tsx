"use client"

import type { Id, Doc } from "@/convex/_generated/dataModel"

// Re-export guest types
export { 
  GUEST_USER, 
  MOCK_WORKSPACES, 
  GuestWorkspaceProvider, 
  useIsGuestMode,
  type MockWorkspaceDoc 
} from "./GuestWorkspaceProvider"

// Import both contexts
import { useWorkspaceContext as useRealWorkspaceContext } from "./WorkspaceProvider"
import { 
  useGuestWorkspaceContext, 
  useIsGuestMode,
  GUEST_USER,
} from "./GuestWorkspaceProvider"

/**
 * Unified workspace context value that works for both authenticated and guest modes
 */
export interface UnifiedWorkspaceContextValue {
  // Current workspace selection
  workspaceId: string | null
  setWorkspaceId: (id: string | null) => void
  
  // All workspaces
  workspaces: any[] | undefined
  
  // Current workspace details
  currentWorkspace: any | null
  
  // Main workspace
  mainWorkspace: any | null
  isMainWorkspace: boolean
  
  // Hierarchy
  parentWorkspace: any | null
  childWorkspaces: any[]
  siblingWorkspaces: any[]
  workspacePath: any[]
  
  // Mode indicators
  isGuestMode: boolean
  isLoading: boolean
  
  // Guest user (only in guest mode)
  guestUser?: typeof GUEST_USER
}

/**
 * Unified hook that works with both WorkspaceProvider (authenticated) 
 * and GuestWorkspaceProvider (landing page)
 */
export function useUnifiedWorkspaceContext(): UnifiedWorkspaceContextValue {
  const isGuest = useIsGuestMode()
  
  // This will throw if not in guest mode, so we catch it
  let guestContext: ReturnType<typeof useGuestWorkspaceContext> | null = null
  let realContext: ReturnType<typeof useRealWorkspaceContext> | null = null
  
  try {
    if (isGuest) {
      guestContext = useGuestWorkspaceContext()
    }
  } catch {
    // Not in guest mode
  }
  
  try {
    if (!isGuest) {
      realContext = useRealWorkspaceContext()
    }
  } catch {
    // Not in real mode
  }
  
  if (guestContext) {
    return {
      workspaceId: guestContext.workspaceId,
      setWorkspaceId: guestContext.setWorkspaceId,
      workspaces: guestContext.workspaces,
      currentWorkspace: guestContext.currentWorkspace,
      mainWorkspace: guestContext.mainWorkspace,
      isMainWorkspace: guestContext.isMainWorkspace,
      parentWorkspace: guestContext.parentWorkspace,
      childWorkspaces: guestContext.childWorkspaces,
      siblingWorkspaces: guestContext.siblingWorkspaces,
      workspacePath: guestContext.workspacePath,
      isGuestMode: true,
      isLoading: false,
      guestUser: guestContext.guestUser,
    }
  }
  
  if (realContext) {
    return {
      workspaceId: realContext.workspaceId ? String(realContext.workspaceId) : null,
      setWorkspaceId: (id) => realContext!.setWorkspaceId(id as Id<"workspaces"> | null),
      workspaces: realContext.workspaces,
      currentWorkspace: realContext.currentWorkspace,
      mainWorkspace: realContext.mainWorkspace,
      isMainWorkspace: realContext.isMainWorkspace,
      parentWorkspace: realContext.parentWorkspace,
      childWorkspaces: realContext.childWorkspaces,
      siblingWorkspaces: realContext.siblingWorkspaces,
      workspacePath: realContext.workspacePath,
      isGuestMode: false,
      isLoading: realContext.isLoading,
    }
  }
  
  // Fallback - no context available
  return {
    workspaceId: null,
    setWorkspaceId: () => {},
    workspaces: undefined,
    currentWorkspace: null,
    mainWorkspace: null,
    isMainWorkspace: false,
    parentWorkspace: null,
    childWorkspaces: [],
    siblingWorkspaces: [],
    workspacePath: [],
    isGuestMode: false,
    isLoading: true,
  }
}
