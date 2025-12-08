import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Import/Export feature
 */
export function useImportExport(workspaceId: Id<"workspaces"> | null | undefined) {
  const history = useQuery(
    api.features.importExport.queries.getHistory,
    workspaceId ? { workspaceId } : "skip"
  )

  const startImport = useMutation(api.features.importExport.mutations.startImport)
  const startExport = useMutation(api.features.importExport.mutations.startExport)

  return {
    isLoading: history === undefined && workspaceId !== null && workspaceId !== undefined,
    history: history ?? [],
    startImport,
    startExport,
  }
}
