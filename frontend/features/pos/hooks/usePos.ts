import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for POS feature
 */
export function usePos(workspaceId: Id<"workspaces"> | null | undefined) {
  const products = useQuery(
    api.features.pos.queries.getProducts,
    workspaceId ? { workspaceId } : "skip"
  )

  const todaySales = useQuery(
    api.features.pos.queries.getTodaySales,
    workspaceId ? { workspaceId } : "skip"
  )

  const createTransaction = useMutation(api.features.pos.mutations.createTransaction)

  return {
    isLoading: products === undefined && workspaceId !== null && workspaceId !== undefined,
    products: products ?? [],
    todaySales,
    createTransaction,
  }
}
