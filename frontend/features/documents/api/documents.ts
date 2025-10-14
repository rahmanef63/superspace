import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { DocumentRecord } from "../shared/types";

export const useWorkspaceDocuments = (workspaceId?: Id<"workspaces"> | null) => {
  return useQuery(
    api.menu.page.documents.getWorkspaceDocuments,
    workspaceId ? { workspaceId } : "skip"
  ) as DocumentRecord[] | undefined;
};

export const useDocumentById = (documentId?: Id<"documents"> | null) =>
  useQuery(api.menu.page.documents.getDocument, documentId ? { id: documentId } : "skip");

export const useDocumentSearch = (
  workspaceId?: Id<"workspaces"> | null,
  query?: string
) =>
  useQuery(
    api.menu.page.documents.searchDocuments,
    workspaceId && query !== undefined
      ? { workspaceId, query }
      : "skip"
  ) as DocumentRecord[] | undefined;

export const useGlobalDocumentSearch = (query?: string) =>
  useQuery(
    api.menu.page.documents.search,
    query !== undefined ? { query } : "skip"
  ) as DocumentRecord[] | undefined;

export const useCreateDocument = () => useMutation(api.menu.page.documents.create);
export const useUpdateDocument = () => useMutation(api.menu.page.documents.update);
export const useUpdateDocumentTitle = () => useMutation(api.menu.page.documents.updateTitle);
export const useToggleDocumentPublic = () => useMutation(api.menu.page.documents.togglePublic);
export const useDeleteDocument = () => useMutation(api.menu.page.documents.deleteDocument);
export const useMenuPresenceUserId = () => useQuery(api.menu.page.presence.getUserId);

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
