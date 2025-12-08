import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Marketing feature
 */
export function useMarketing(workspaceId: Id<"workspaces"> | null | undefined) {
  const campaigns = useQuery(
    api.features.marketing.queries.getCampaigns,
    workspaceId ? { workspaceId } : "skip"
  )

  const stats = useQuery(
    api.features.marketing.queries.getStats,
    workspaceId ? { workspaceId } : "skip"
  )

  const createCampaign = useMutation(api.features.marketing.mutations.createCampaign)
  const updateCampaign = useMutation(api.features.marketing.mutations.updateCampaign)

  return {
    isLoading: campaigns === undefined && workspaceId !== null && workspaceId !== undefined,
    campaigns: campaigns ?? [],
    stats,
    createCampaign,
    updateCampaign,
  }
}
