import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for Contacts feature
 */
export function useContacts(workspaceId: Id<"workspaces"> | null | undefined) {
  const contacts = useQuery(
    api.features.contacts.queries.getContacts,
    workspaceId ? { workspaceId } : "skip"
  )

  const createContact = useMutation(api.features.contacts.mutations.createContact)
  const updateContact = useMutation(api.features.contacts.mutations.updateContact)
  const deleteContact = useMutation(api.features.contacts.mutations.deleteContact)

  return {
    isLoading: contacts === undefined && workspaceId !== null && workspaceId !== undefined,
    contacts: contacts ?? [],
    createContact,
    updateContact,
    deleteContact,
  }
}
