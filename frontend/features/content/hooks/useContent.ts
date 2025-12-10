import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { ContentData } from "../types"

// Initial empty data for real Content usage
const INITIAL_DATA: ContentData = {
  stats: {
    totalItems: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    views: 0
  },
  recentContent: []
}

/**
 * Hook for Content feature
 */
export function useContent(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: ContentData } {
  const remoteData = useQuery(
    api.features.content.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as ContentData) || INITIAL_DATA,
  }
}
