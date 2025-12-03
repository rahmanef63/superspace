"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";

// Extended workspace type with hierarchy info
type WorkspaceDoc = Doc<"workspaces"> & {
  membership?: any;
  role?: any;
  isLinked?: boolean;
  link?: Doc<"workspaceLinks">;
};

// Workspace tree structure from hierarchy query
type WorkspaceTree = {
  mainWorkspace: Doc<"workspaces"> | null;
  workspaces: Doc<"workspaces">[];
  tree: any | null;
};

interface WorkspaceContextValue {
  // Current workspace selection
  workspaceId: Id<"workspaces"> | null;
  setWorkspaceId: (id: Id<"workspaces"> | null) => void;
  
  // All user workspaces (flat list)
  workspaces: WorkspaceDoc[] | undefined;
  
  // Current workspace details
  currentWorkspace: WorkspaceDoc | null;
  
  // === Hierarchy Context ===
  // User's main/hub workspace
  mainWorkspace: Doc<"workspaces"> | null;
  isMainWorkspace: boolean;
  
  // Parent workspace (if current is a child)
  parentWorkspace: Doc<"workspaces"> | null;
  
  // Children of current workspace
  childWorkspaces: WorkspaceDoc[];
  
  // Siblings (same parent level)
  siblingWorkspaces: WorkspaceDoc[];
  
  // Breadcrumb path from main to current
  workspacePath: Doc<"workspaces">[];
  
  // Workspace tree structure
  workspaceTree: WorkspaceTree | null;
  
  // Loading state
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
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
  workspaceTree: null,
  isLoading: true,
});

const LAST_WORKSPACE_STORAGE_KEY = "superspace:lastWorkspaceId";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces) as WorkspaceDoc[] | undefined;
  const [workspaceId, setWorkspaceIdState] = useState<Id<"workspaces"> | null>(null);

  // Wait for userWorkspaces to load before fetching hierarchy data
  // This ensures we have authentication established before making additional queries
  const isUserLoaded = userWorkspaces !== undefined;

  // Fetch hierarchy data - only when user is loaded
  const mainWorkspaceQuery = useQuery(
    api.workspace.hierarchy.getMainWorkspace,
    isUserLoaded ? {} : "skip"
  );
  const workspaceTreeQuery = useQuery(
    api.workspace.hierarchy.getWorkspaceTree,
    isUserLoaded ? { maxDepth: 3 } : "skip"
  );
  
  // Fetch children of current workspace
  const childWorkspacesQuery = useQuery(
    api.workspace.hierarchy.getChildWorkspaces,
    isUserLoaded && workspaceId ? { workspaceId, includeLinked: true } : "skip"
  );
  
  // Fetch siblings of current workspace
  const siblingWorkspacesQuery = useQuery(
    api.workspace.hierarchy.getSiblingWorkspaces,
    isUserLoaded && workspaceId ? { workspaceId } : "skip"
  );
  
  // Fetch ancestors (for breadcrumb)
  const ancestorsQuery = useQuery(
    api.workspace.hierarchy.getWorkspaceAncestors,
    isUserLoaded && workspaceId ? { workspaceId } : "skip"
  );

  const setWorkspaceId = useCallback((id: Id<"workspaces"> | null) => {
    setWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        window.localStorage.setItem(LAST_WORKSPACE_STORAGE_KEY, String(id));
      } else {
        window.localStorage.removeItem(LAST_WORKSPACE_STORAGE_KEY);
      }
    }
  }, []);

  // Clear selection when user loses all workspaces (e.g. deleted the last one)
  useEffect(() => {
    if (Array.isArray(userWorkspaces) && userWorkspaces.length === 0 && workspaceId !== null) {
      setWorkspaceId(null);
    }
  }, [userWorkspaces, workspaceId, setWorkspaceId]);

  // Restore the last selected workspace from localStorage
  useEffect(() => {
    if (workspaceId !== null) return;
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LAST_WORKSPACE_STORAGE_KEY);
    if (stored) {
      setWorkspaceId(stored as Id<"workspaces">);
    }
  }, [workspaceId, setWorkspaceId]);

  // Ensure we always have a valid workspace selected
  // Prefer Main Workspace as default
  useEffect(() => {
    if (!Array.isArray(userWorkspaces) || userWorkspaces.length === 0) {
      return;
    }

    const currentExists = workspaceId
      ? userWorkspaces.some((ws) => String(ws._id) === String(workspaceId))
      : false;

    if (currentExists) {
      return;
    }

    // Prefer main workspace as default
    let nextId: Id<"workspaces">;
    if (mainWorkspaceQuery) {
      nextId = mainWorkspaceQuery._id;
    } else {
      // Find main workspace in list
      const mainWs = userWorkspaces.find((ws) => (ws as any).isMainWorkspace);
      nextId = mainWs ? mainWs._id : userWorkspaces[0]._id;
    }
    
    setWorkspaceId(nextId);

    if (process.env.NODE_ENV !== "production") {
      console.debug("WorkspaceProvider:setWorkspaceId", String(nextId));
    }
  }, [userWorkspaces, workspaceId, setWorkspaceId, mainWorkspaceQuery]);

  // Compute derived values
  const contextValue = useMemo<WorkspaceContextValue>(() => {
    const currentWorkspace = workspaceId && userWorkspaces
      ? userWorkspaces.find((ws) => String(ws._id) === String(workspaceId)) ?? null
      : null;
    
    const mainWorkspace = mainWorkspaceQuery ?? null;
    const isMainWorkspace = Boolean(currentWorkspace && (currentWorkspace as any).isMainWorkspace);
    
    // Parent workspace from ancestors
    const parentWorkspace = ancestorsQuery && ancestorsQuery.length > 0
      ? ancestorsQuery[ancestorsQuery.length - 1]
      : null;
    
    // Build workspace path (ancestors + current)
    // IMPORTANT: Deduplicate to prevent corrupted data from causing infinite loops
    const rawPath: Doc<"workspaces">[] = ancestorsQuery ?? [];
    if (currentWorkspace) {
      rawPath.push(currentWorkspace as Doc<"workspaces">);
    }
    
    // Deduplicate by _id, keeping only first occurrence
    const seenIds = new Set<string>();
    const workspacePath: Doc<"workspaces">[] = [];
    for (const ws of rawPath) {
      const idStr = String(ws._id);
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr);
        workspacePath.push(ws);
      }
    }
    
    return {
      workspaceId,
      setWorkspaceId,
      workspaces: userWorkspaces,
      currentWorkspace,
      mainWorkspace,
      isMainWorkspace,
      parentWorkspace,
      childWorkspaces: (childWorkspacesQuery ?? []) as WorkspaceDoc[],
      siblingWorkspaces: (siblingWorkspacesQuery ?? []) as WorkspaceDoc[],
      workspacePath,
      workspaceTree: workspaceTreeQuery ?? null,
      isLoading: userWorkspaces === undefined,
    };
  }, [
    workspaceId,
    setWorkspaceId,
    userWorkspaces,
    mainWorkspaceQuery,
    childWorkspacesQuery,
    siblingWorkspacesQuery,
    ancestorsQuery,
    workspaceTreeQuery,
  ]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}

/**
 * Hook to check if current workspace is the main workspace
 */
export function useIsMainWorkspace() {
  const { isMainWorkspace } = useWorkspaceContext();
  return isMainWorkspace;
}

/**
 * Hook to get workspace hierarchy path for breadcrumbs
 */
export function useWorkspaceBreadcrumbs() {
  const { workspacePath, mainWorkspace } = useWorkspaceContext();
  return { path: workspacePath, mainWorkspace };
}

/**
 * Hook to get child workspaces (for workspace switcher)
 */
export function useChildWorkspaces() {
  const { childWorkspaces, siblingWorkspaces } = useWorkspaceContext();
  return { children: childWorkspaces, siblings: siblingWorkspaces };
}
