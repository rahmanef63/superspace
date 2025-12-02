"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentCategory, DocumentEditorMode, DocumentRecord, DocumentSortOptions } from "../types";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentsListCompact } from "./DocumentsListCompact";
import { DocumentEditorOnly } from "./DocumentEditorOnly";

// Lazy load heavy components
const DocumentInspector = lazy(() => 
  import("./DocumentInspector").then((mod) => ({ default: mod.DocumentInspector }))
);

export interface DocumentsThreeColumnLayoutProps {
  manager: DocumentsManagerHook;
  workspaceId: Id<"workspaces">;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
  onPin?: (document: DocumentRecord) => Promise<void> | void;
  onStar?: (document: DocumentRecord) => Promise<void> | void;
  sortOptions?: DocumentSortOptions;
  onSortChange?: (options: DocumentSortOptions) => void;
  sortedDocuments: DocumentRecord[];
  /** Document category for filtering and creation */
  category?: DocumentCategory;
}

/**
 * 3-Column Layout for Desktop Documents View
 * 
 * Column 1: Secondary Sidebar (20-25%) - Document list with search/filter
 * Column 2: Editor (50-55%) - Document editor with content
 * Column 3: Inspector (20-25%) - Metadata, tags, sharing, TOC
 * 
 * Features:
 * - Lazy loading for performance
 * - Skeleton states during loading
 * - Responsive width adjustments
 * - Collapsible inspector
 */
export function DocumentsThreeColumnLayout({
  manager,
  workspaceId,
  editorMode = "block",
  storageKey,
  onDelete,
  onPin,
  onStar,
  sortOptions,
  onSortChange,
  sortedDocuments,
  category,
}: DocumentsThreeColumnLayoutProps) {
  const [showInspector, setShowInspector] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedDocument = manager.documents.find(
    (doc) => doc._id === manager.state.selectedDocumentId
  );

  return (
    <div className="flex h-full bg-background">
      {/* COLUMN 1: Secondary Sidebar - Document List */}
      <div className="w-80 flex-shrink-0 border-r border-border">
        <DocumentsListCompact
          documents={manager.documents}
          filteredDocuments={sortedDocuments}
          isLoading={manager.isLoading}
          onSelect={manager.selectDocument}
          onCreate={manager.openCreateDialog}
          selectedDocumentId={manager.state.selectedDocumentId}
          search={manager.search}
          onSearch={manager.setSearch}
          visibility={manager.visibility}
          onVisibilityChange={manager.setVisibility}
          stats={manager.stats}
          storageKey={storageKey}
          onDelete={onDelete}
          onPin={onPin}
          onStar={onStar}
          sortOptions={sortOptions}
          onSortChange={onSortChange}
          workspaceId={workspaceId}
        />
      </div>

      {/* COLUMN 2: Editor - Document Content */}
      <div className={showInspector ? "flex-1 min-w-0" : "flex-1"}>
        {manager.state.selectedDocumentId ? (
          <Suspense fallback={<EditorSkeleton />}>
            {isMounted && (
              <DocumentEditorOnly
                documentId={manager.state.selectedDocumentId}
                mode={editorMode}
                onBack={() => manager.selectDocument(null)}
                className="h-full"
              />
            )}
          </Suspense>
        ) : (
          <EmptyEditorState onCreate={manager.openCreateDialog} />
        )}
      </div>

      {/* COLUMN 3: Inspector - Metadata & Settings */}
      {showInspector && manager.state.selectedDocumentId && selectedDocument && (
        <div className="w-80 flex-shrink-0 border-l border-border bg-muted/30">
          <Suspense fallback={<InspectorSkeleton />}>
            {isMounted && (
              <DocumentInspector
                document={{
                  _id: selectedDocument._id,
                  title: selectedDocument.title,
                  isPublic: selectedDocument.isPublic,
                  createdAt: selectedDocument._creationTime,
                  updatedAt: selectedDocument.lastModified || selectedDocument._creationTime,
                  tags: selectedDocument.tags,
                  owner: selectedDocument.author ? {
                    name: selectedDocument.author.name || undefined,
                    email: undefined,
                  } : undefined,
                }}
                onTagAdd={async (tag: string) => {
                  // TODO: Implement tag add mutation
                  console.log("Add tag:", tag);
                }}
                onTagRemove={async (tag: string) => {
                  // TODO: Implement tag remove mutation
                  console.log("Remove tag:", tag);
                }}
                onClose={() => setShowInspector(false)}
                isMobile={false}
              />
            )}
          </Suspense>
        </div>
      )}

      {/* Create Document Dialog */}
      <CreateDocumentDialog
        open={manager.state.createOpen}
        onOpenChange={manager.toggleCreateDialog}
        workspaceId={workspaceId}
        category={category}
        onCreated={(documentId) => {
          manager.toggleCreateDialog(false);
          manager.selectDocument(documentId);
        }}
      />
    </div>
  );
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-8 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-32 h-8 rounded-full" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/6" />
        <div className="pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      </div>
    </div>
  );
}

function InspectorSkeleton() {
  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>

      {/* Metadata Section */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-16" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* Sharing Section */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

function EmptyEditorState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No document selected
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select a document from the sidebar or create a new one
          </p>
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Document
          </button>
        </div>
      </div>
    </div>
  );
}
