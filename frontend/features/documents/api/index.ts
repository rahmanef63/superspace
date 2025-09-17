import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Documents API hooks
export const useDocumentsApi = () => {
  // Mutations
  const createDocument = useMutation(api.menu.page.documents.create);
  const updateDocument = useMutation(api.menu.page.documents.update);
  // Note: deleteDocument function needs to be implemented in convex/documents.ts

  return {
    createDocument,
    updateDocument,
  };
};

// Individual hooks
export const useWorkspaceDocuments = (workspaceId: Id<"workspaces">) => 
  useQuery(api.menu.page.documents.getWorkspaceDocuments, { workspaceId });
export const useDocument = (documentId: Id<"documents">) => 
  useQuery(api.menu.page.documents.getDocument, { id: documentId });

export const useCreateDocument = () => useMutation(api.menu.page.documents.create);
export const useUpdateDocument = () => useMutation(api.menu.page.documents.update);

