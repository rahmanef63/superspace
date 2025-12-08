import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Audit Log feature
 */
export function useAuditLog(workspaceId: Id<"workspaces"> | null | undefined, filters?: {
  action?: string
  entityType?: string
  userId?: Id<"users">
  startDate?: number
  endDate?: number
  limit?: number
}) {
  const logs = useQuery(
    api.features.auditLog.queries.getLogs,
    workspaceId ? { workspaceId, ...filters } : "skip"
  )

  const stats = useQuery(
    api.features.auditLog.queries.getStats,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: logs === undefined && workspaceId !== null && workspaceId !== undefined,
    logs: logs ?? [],
    stats,
  }
}
