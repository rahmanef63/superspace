import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Integrations feature
 */
export function useIntegrations(workspaceId: Id<"workspaces"> | null | undefined) {
  const integrations = useQuery(
    api.features.integrations.queries.getIntegrations,
    workspaceId ? { workspaceId } : "skip"
  )

  const availableIntegrations = useQuery(
    api.features.integrations.queries.getAvailableIntegrations
  )

  const connectIntegration = useMutation(api.features.integrations.mutations.connect)
  const disconnectIntegration = useMutation(api.features.integrations.mutations.disconnect)

  return {
    isLoading: integrations === undefined && workspaceId !== null && workspaceId !== undefined,
    integrations: integrations ?? [],
    availableIntegrations: availableIntegrations ?? [],
    connectIntegration,
    disconnectIntegration,
  }
}
