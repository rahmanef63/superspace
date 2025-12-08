import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { DocumentRecord } from "../shared/types";

export const useWorkspaceDocuments = (workspaceId?: Id<"workspaces"> | null) => {
  return useQuery(
    (api as any)["features/docs/documents"].getWorkspaceDocuments,
    workspaceId ? { workspaceId } : undefined
  ) as DocumentRecord[] | undefined;
};

export const useDocumentById = (documentId?: Id<"documents"> | null) =>
  useQuery((api as any)["features/docs/documents"].getDocument, documentId ? { id: documentId } : "skip");

export const useDocumentSearch = (
  workspaceId?: Id<"workspaces"> | null,
  query?: string
) =>
  useQuery(
    (api as any)["features/docs/documents"].searchDocuments,
    workspaceId && query !== undefined
      ? { workspaceId, query }
      : "skip"
  ) as DocumentRecord[] | undefined;

export const useGlobalDocumentSearch = (query?: string) =>
  useQuery(
    (api as any)["features/docs/documents"].search,
    query !== undefined ? { query } : undefined
  ) as DocumentRecord[] | undefined;

export const useCreateDocument = () => useMutation((api as any)["features/docs/documents"].create);
export const useUpdateDocument = () => useMutation((api as any)["features/docs/documents"].update);
export const useUpdateDocumentTitle = () => useMutation((api as any)["features/docs/documents"].updateTitle);
export const useToggleDocumentPublic = () => useMutation((api as any)["features/docs/documents"].togglePublic);
export const useDeleteDocument = () => useMutation((api as any)["features/docs/documents"].deleteDocument);
export const useMenuPresenceUserId = () => useQuery((api as any)["features/docs/presence"].getUserId);

export const documentsApi = {
  useWorkspaceDocuments,
  useDocumentById,
  useDocumentSearch,
  useGlobalDocumentSearch,
  useCreateDocument,
  useUpdateDocument,
  useUpdateDocumentTitle,
  useToggleDocumentPublic,
  useDeleteDocument,
  useMenuPresenceUserId,
};
