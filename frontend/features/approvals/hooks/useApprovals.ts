import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Approvals feature
 */
export function useApprovals(workspaceId: Id<"workspaces"> | null | undefined) {
  const pendingApprovals = useQuery(
    api.features.approvals.queries.getPendingApprovals,
    workspaceId ? { workspaceId } : "skip"
  )

  const myRequests = useQuery(
    api.features.approvals.queries.getMyRequests,
    workspaceId ? { workspaceId } : "skip"
  )

  const createRequest = useMutation(api.features.approvals.mutations.createRequest)
  const approveRequest = useMutation(api.features.approvals.mutations.approveRequest)
  const rejectRequest = useMutation(api.features.approvals.mutations.rejectRequest)

  return {
    isLoading: pendingApprovals === undefined && workspaceId !== null && workspaceId !== undefined,
    pendingApprovals: pendingApprovals ?? [],
    myRequests: myRequests ?? [],
    createRequest,
    approveRequest,
    rejectRequest,
  }
}
