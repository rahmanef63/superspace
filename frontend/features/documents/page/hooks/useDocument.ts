import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  useCreateDocument,
  useDeleteDocument,
  useDocumentById,
  useDocumentSearch,
  useGlobalDocumentSearch,
  useUpdateDocument,
  useWorkspaceDocuments,
} from "../../shared";
import type { DocumentRecord } from "../../shared";

export function useDocument(documentId: Id<"documents">) {
  const document = useDocumentById(documentId);
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  return {
    document,
    updateDocument,
    deleteDocument,
    isLoading: document === undefined,
  };
}

interface UseDocumentsOptions {
  workspaceId?: Id<"workspaces">;
  query?: string;
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { workspaceId, query } = options;

  const workspaceDocuments = useWorkspaceDocuments(workspaceId);
  const globalDocuments = useQuery(api.menu.page.documents.list, {} as Record<string, never>) as
    | DocumentRecord[]
    | undefined;

  const documents = workspaceId ? workspaceDocuments : globalDocuments;

  const workspaceSearch = useDocumentSearch(workspaceId, query);
  const globalSearch = useGlobalDocumentSearch(query);
  const searchResults = workspaceId ? workspaceSearch : globalSearch;

  const createDocument = useCreateDocument();

  return {
    documents: documents ?? [],
    createDocument,
    searchResults: searchResults ?? [],
    searchDocuments: searchResults ?? [],
    isLoading: documents === undefined,
  };
}
