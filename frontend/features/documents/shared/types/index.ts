import type { Id } from "@convex/_generated/dataModel";

/**
 * Document category types for knowledge base organization.
 * - "document": Regular documents (notes, files, etc.)
 * - "article": Knowledge base articles for AI context and team documentation
 */
export type DocumentCategory = "document" | "article";

export const DOCUMENT_CATEGORY_TAG_PREFIX = "__category:";

export const getDocumentCategory = (tags?: string[]): DocumentCategory => {
  if (!tags) return "document";
  const categoryTag = tags.find(t => t.startsWith(DOCUMENT_CATEGORY_TAG_PREFIX));
  if (categoryTag) {
    const category = categoryTag.replace(DOCUMENT_CATEGORY_TAG_PREFIX, "") as DocumentCategory;
    if (category === "article" || category === "document") {
      return category;
    }
  }
  return "document";
};

export const getCategoryTag = (category: DocumentCategory): string => {
  return `${DOCUMENT_CATEGORY_TAG_PREFIX}${category}`;
};

export interface DocumentAuthor {
  name?: string | null;
  image?: string | null;
}

export interface DocumentRecord {
  _id: Id<"documents">;
  title: string;
  content?: string | null;
  isPublic: boolean;
  parentId?: Id<"documents"> | null;
  workspaceId: Id<"workspaces">;
  createdBy: Id<"users">;
  _creationTime: number;
  lastModified?: number | null;
  author?: DocumentAuthor | null;
  isPinned?: boolean;
  isStarred?: boolean;
  tags?: string[];
  metadata?: {
    description?: string;
    tags?: string[];
    lastEditedBy?: Id<"users">;
    version?: number;
  };
}

export type DocumentEditorMode = "block" | "tiptap";

export type DocumentSortField = "created" | "modified" | "name";
export type DocumentSortOrder = "asc" | "desc";

export interface DocumentSortOptions {
  field: DocumentSortField;
  order: DocumentSortOrder;
}

export interface DocumentBrowserFilters {
  query?: string;
  visibility?: "all" | "private" | "public";
  category?: DocumentCategory;
}

export interface DocumentStats {
  total: number;
  publicCount: number;
  privateCount: number;
  lastUpdated?: number;
}

export interface DocumentManagerOptions {
  workspaceId?: Id<"workspaces"> | null;
  initialDocumentId?: Id<"documents"> | null;
  editorMode?: DocumentEditorMode;
  /** Filter documents by category (article or document) */
  category?: DocumentCategory;
}

export interface DocumentManagerState {
  selectedDocumentId: Id<"documents"> | null;
  createOpen: boolean;
}

export type DocumentListItem = DocumentRecord;
