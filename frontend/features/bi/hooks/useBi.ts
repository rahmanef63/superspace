import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for BI feature
 */
export function useBi(workspaceId: Id<"workspaces"> | null | undefined) {
  const dashboards = useQuery(
    api.features.bi.queries.getDashboards,
    workspaceId ? { workspaceId } : "skip"
  )

  const metrics = useQuery(
    api.features.bi.queries.getMetrics,
    workspaceId ? { workspaceId } : "skip"
  )

  const createDashboard = useMutation(api.features.bi.mutations.createDashboard)
  const updateDashboard = useMutation(api.features.bi.mutations.updateDashboard)

  return {
    isLoading: dashboards === undefined && workspaceId !== null && workspaceId !== undefined,
    dashboards: dashboards ?? [],
    metrics,
    createDashboard,
    updateDashboard,
  }
}
