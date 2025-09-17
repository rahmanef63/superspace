import { useCallback, useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useWorkspaceDocuments } from "../api";
import type {
  DocumentBrowserFilters,
  DocumentManagerOptions,
  DocumentManagerState,
  DocumentRecord,
  DocumentStats,
} from "../types";
import { formatRelativeTime, stripHtml } from "../utils";

type VisibilityFilter = NonNullable<DocumentBrowserFilters["visibility"]>;

const matchesVisibility = (document: DocumentRecord, visibility: VisibilityFilter) => {
  if (visibility === "all") return true;
  if (visibility === "public") return document.isPublic;
  return !document.isPublic;
};

export interface DocumentsManagerHook {
  documents: DocumentRecord[];
  filteredDocuments: DocumentRecord[];
  isLoading: boolean;
  state: DocumentManagerState;
  selectDocument: (documentId: Id<"documents"> | null) => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  toggleCreateDialog: (open?: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
  visibility: VisibilityFilter;
  setVisibility: (value: VisibilityFilter) => void;
  stats: DocumentStats;
  lastUpdatedHumanized: string;
}

export function useDocumentsManager(options: DocumentManagerOptions = {}): DocumentsManagerHook {
  const { workspaceId, initialDocumentId = null } = options;

  const [state, setState] = useState<DocumentManagerState>({
    selectedDocumentId: initialDocumentId,
    createOpen: false,
  });
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");

  const documents = useWorkspaceDocuments(workspaceId);
  const isLoading = documents === undefined;
  const availableDocuments = documents ?? [];

  const filteredDocuments = useMemo(() => {
    const loweredQuery = search.trim().toLowerCase();
    return availableDocuments.filter((document) => {
      const matchesQuery = loweredQuery
        ? document.title.toLowerCase().includes(loweredQuery) ||
          (document.content ? stripHtml(document.content).toLowerCase().includes(loweredQuery) : false)
        : true;

      const matches = matchesQuery && matchesVisibility(document, visibility);
      return matches;
    });
  }, [availableDocuments, search, visibility]);

  const stats = useMemo<DocumentStats>(() => {
    const total = availableDocuments.length;
    const publicCount = availableDocuments.filter((doc) => doc.isPublic).length;
    const privateCount = total - publicCount;
    const lastUpdated = availableDocuments.reduce<number | undefined>((acc, doc) => {
      const docUpdated = doc.lastModified ?? doc._creationTime;
      return acc === undefined || docUpdated > acc ? docUpdated : acc;
    }, undefined);

    return {
      total,
      publicCount,
      privateCount,
      lastUpdated,
    };
  }, [availableDocuments]);

  const selectDocument = useCallback((documentId: Id<"documents"> | null) => {
    setState((prev) => ({ ...prev, selectedDocumentId: documentId }));
  }, []);

  const openCreateDialog = useCallback(() => {
    setState((prev) => ({ ...prev, createOpen: true }));
  }, []);

  const closeCreateDialog = useCallback(() => {
    setState((prev) => ({ ...prev, createOpen: false }));
  }, []);

  const toggleCreateDialog = useCallback((open?: boolean) => {
    setState((prev) => ({ ...prev, createOpen: open ?? !prev.createOpen }));
  }, []);

  const lastUpdatedHumanized = formatRelativeTime(stats.lastUpdated);

  return {
    documents: availableDocuments,
    filteredDocuments,
    isLoading,
    state,
    selectDocument,
    openCreateDialog,
    closeCreateDialog,
    toggleCreateDialog,
    search,
    setSearch,
    visibility,
    setVisibility,
    stats,
    lastUpdatedHumanized,
  };
}
