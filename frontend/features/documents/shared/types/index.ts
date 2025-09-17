import type { Id } from "@convex/_generated/dataModel";

export interface DocumentAuthor {
  name?: string | null;
  image?: string | null;
}

export interface DocumentRecord {
  _id: Id<"documents">;
  title: string;
  content?: string | null;
  isPublic: boolean;
  workspaceId: Id<"workspaces">;
  createdBy: Id<"users">;
  _creationTime: number;
  lastModified?: number | null;
  author?: DocumentAuthor | null;
}

export type DocumentEditorMode = "block" | "tiptap";

export interface DocumentBrowserFilters {
  query?: string;
  visibility?: "all" | "private" | "public";
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
}

export interface DocumentManagerState {
  selectedDocumentId: Id<"documents"> | null;
  createOpen: boolean;
}

export type DocumentListItem = DocumentRecord;
