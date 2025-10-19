import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Documents API hooks
export const useDocumentsApi = () => {
  // Mutations
  const createDocument = useMutation(api.menu.page.documents.create);
  const updateDocument = useMutation(api.menu.page.documents.update);
  const deleteDocument = useMutation(api.menu.page.documents.deleteDocument);

  return {
    createDocument,
    updateDocument,
    deleteDocument,
  };
};

// Individual hooks
export const useWorkspaceDocuments = (workspaceId: Id<"workspaces">) => 
  useQuery(api.menu.page.documents.getWorkspaceDocuments, { workspaceId });
export const useDocument = (documentId: Id<"documents">) => 
  useQuery(api.menu.page.documents.getDocument, { id: documentId });

export const useCreateDocument = () => useMutation(api.menu.page.documents.create);
export const useUpdateDocument = () => useMutation(api.menu.page.documents.update);
export const useDeleteDocument = () => useMutation(api.menu.page.documents.deleteDocument);
