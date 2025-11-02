/**
 * Workspace Context Helper
 * 
 * Temporary helper to get workspace ID from current user.
 * In production, this should be replaced with proper React Context.
 * 
 * @todo Implement WorkspaceContext provider at app level
 */

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

/**
 * Get the active workspace ID for the current user
 * Returns the first workspace ID from getUserWorkspaces query
 * 
 * @returns workspaceId or null if user has no workspaces
 */
export function useWorkspaceId(): Id<"workspaces"> | null {
  // Use getUserWorkspaces query to get user's workspaces
  const workspaces = useQuery(api.workspace.workspaces.getUserWorkspaces);
  
  if (!workspaces) {
    return null;
  }
  
  if (workspaces.length === 0) {
    return null;
  }
  
  return workspaces[0]._id;
}

/**
 * Get all workspace IDs for the current user
 */
export function useWorkspaceIds(): Id<"workspaces">[] {
  const workspaces = useQuery(api.workspace.workspaces.getUserWorkspaces);
  
  if (!workspaces) return [];
  
  return workspaces.map((ws: any) => ws._id);
}
