import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

// Documents API hooks
export const useDocumentsApi = () => {
  // Mutations
  const createDocument = useMutation((api as any)["features/docs/documents"].create);
  const updateDocument = useMutation((api as any)["features/docs/documents"].update);
  const deleteDocument = useMutation((api as any)["features/docs/documents"].deleteDocument);

  return {
    createDocument,
    updateDocument,
    deleteDocument,
  };
};

// Individual hooks
export const useWorkspaceDocuments = (workspaceId: Id<"workspaces">) => 
  useQuery((api as any)["features/docs/documents"].getWorkspaceDocuments, { workspaceId });
export const useDocument = (documentId: Id<"documents">) => 
  useQuery((api as any)["features/docs/documents"].getDocument, { id: documentId });

export const useCreateDocument = () => useMutation((api as any)["features/docs/documents"].create);
export const useUpdateDocument = () => useMutation((api as any)["features/docs/documents"].update);
export const useDeleteDocument = () => useMutation((api as any)["features/docs/documents"].deleteDocument);
