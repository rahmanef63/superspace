import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Accounting feature
 * 
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 * 
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export function useAccounting(workspaceId: Id<"workspaces"> | null | undefined) {
  // Query data from Convex - returns undefined while loading
  const data = useQuery(
    api.features.accounting.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    // undefined = loading, null = no data, otherwise = data
    isLoading: data === undefined && workspaceId !== null && workspaceId !== undefined,
    data,
    // Error handling is done by Convex automatically
  }
}
