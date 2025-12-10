import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { ApprovalsData } from "../types"

// Initial empty data for real Approvals usage
const INITIAL_DATA: ApprovalsData = {
  stats: {
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgTime: '-'
  },
  recentRequests: [],
  pendingRequests: []
}

/**
 * Hook for Approvals feature
 */
export function useApprovals(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: ApprovalsData } {
  const remoteData = useQuery(
    api.features.approvals.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as ApprovalsData) || INITIAL_DATA,
  }
}
