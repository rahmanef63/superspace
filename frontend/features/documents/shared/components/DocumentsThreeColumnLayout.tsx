"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import { 
  FileText, 
  Plus, 
  Info, 
  X, 
  Clock, 
  Calendar, 
  FileType,
  TreeDeciduous,
  LayoutGrid,
} from "lucide-react";
import type { DocumentCategory, DocumentEditorMode, DocumentRecord, DocumentSortOptions } from "../types";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentEditorOnly } from "./DocumentEditorOnly";
import { DocumentsTree } from "./DocumentsTree";
import { DocumentsBreadcrumbs } from "./DocumentsBreadcrumbs";
import { formatRelativeTime } from "../utils";

// Shared UI imports
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { 
  ContainerHeader,
  HeaderControls,
} from "@/frontend/shared/ui/layout/header";
import { 
  UniversalToolbar,
  toolType,
  type SortToolParams,
} from "@/frontend/shared/ui/layout/toolbar";

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
 * Uses ThreeColumnLayoutAdvanced from shared UI:
 * - Left: Document tree with search/filter (collapsible)
 * - Center: Document editor
 * - Right: Document inspector (collapsible)
 * 
 * Pattern follows WorkspaceStorePage for consistency.
 */
export function DocumentsThreeColumnLayout({
  manager,
  workspaceId,
  editorMode = "block",
  storageKey,
  sortOptions = { field: "modified", order: "desc" },
  onSortChange,
  sortedDocuments,
  category,
}: DocumentsThreeColumnLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "grid">("tree");
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectedDocument = manager.documents.find(
    (doc) => doc._id === manager.state.selectedDocumentId
  );

  // Sort tool params for toolbar
  const sortToolParams: SortToolParams = useMemo(
    () => ({
      options: [
        { label: "Recently Modified", value: "modified", icon: Clock },
        { label: "Recently Created", value: "created", icon: Calendar },
        { label: "Name", value: "name", icon: FileType },
      ],
      currentSort: sortOptions.field,
      currentDirection: sortOptions.order,
      onChange: (field, direction) => {
        if (onSortChange) {
          onSortChange({
            field: field as "created" | "modified" | "name",
            order: direction || "desc",
          });
        }
      },
      showDirection: true,
    }),
    [sortOptions, onSortChange]
  );

  // Visibility filter options
  const visibilityOptions: Array<DocumentsManagerHook["visibility"]> = [
    "all",
    "private",
    "public",
  ];

  // ============================================================================
  // LEFT PANEL - Document Tree
  // ============================================================================
  const leftPanelContent = useMemo(() => (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header - Compact */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{sortedDocuments.length}</span>
            {sortedDocuments.length !== manager.documents.length && (
              <span>of {manager.documents.length}</span>
            )}
            <span>documents</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex border rounded-md">
              <Toggle
                pressed={viewMode === "tree"}
                onPressedChange={() => setViewMode("tree")}
                size="sm"
                className="rounded-r-none h-7 w-7 p-0"
              >
                <TreeDeciduous className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                pressed={viewMode === "grid"}
                onPressedChange={() => setViewMode("grid")}
                size="sm"
                className="rounded-l-none h-7 w-7 p-0"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Toggle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={manager.openCreateDialog}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-3 pb-2 space-y-2">
          <HeaderControls
            searchable
            searchProps={{
              value: manager.search,
              onChange: manager.setSearch,
              placeholder: "Search documents...",
            }}
            responsive
          />
          
          {/* Sort */}
          <UniversalToolbar
            tools={[
              {
                id: "sort-docs" as any,
                type: toolType.sort,
                params: sortToolParams,
              },
            ]}
            spacing="compact"
            background="transparent"
          />

          {/* Visibility Filter */}
          <div className="flex flex-wrap items-center gap-1">
            {visibilityOptions.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={option === manager.visibility ? "default" : "outline"}
                onClick={() => manager.setVisibility(option)}
                className="h-6 text-xs px-2"
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>

          {/* Breadcrumbs */}
          <DocumentsBreadcrumbs
            documents={manager.documents}
            selectedId={manager.state.selectedDocumentId ?? undefined}
            onSelect={(docId) => manager.selectDocument(docId ?? null)}
          />
        </div>
      </div>
      
      {/* Document Tree */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {manager.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary mx-auto mb-2" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            </div>
          ) : sortedDocuments.length === 0 ? (
            <div className="flex h-32 items-center justify-center p-4">
              <p className="text-sm text-muted-foreground text-center">
                No documents match your filters.
              </p>
            </div>
          ) : (
            <DocumentsTree
              documents={sortedDocuments}
              selectedId={manager.state.selectedDocumentId ?? null}
              onSelect={(docId) => manager.selectDocument(docId)}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  ), [manager, sortedDocuments, viewMode, sortToolParams, visibilityOptions]);

  // ============================================================================
  // CENTER PANEL - Document Editor
  // ============================================================================
  const centerPanelContent = useMemo(() => (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title={selectedDocument?.title || "Editor"}
          subtitle={selectedDocument 
            ? `Modified ${formatRelativeTime(selectedDocument.lastModified || selectedDocument._creationTime)}`
            : "Select a document to edit"
          }
          icon={FileText}
          actions={selectedDocument && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setRightPanelCollapsed(false)}
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              Inspector
            </Button>
          )}
        />
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 min-h-0 overflow-auto">
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
    </div>
  ), [manager, selectedDocument, editorMode, isMounted]);

  // ============================================================================
  // RIGHT PANEL - Document Inspector
  // ============================================================================
  const rightPanelContent = useMemo(() => (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title="Inspector"
          subtitle={selectedDocument ? "Document Details" : "Select a document"}
          icon={Info}
          actions={
            selectedDocument && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setRightPanelCollapsed(true)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )
          }
        />
      </div>
      
      {/* Inspector Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {selectedDocument ? (
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
                onClose={() => setRightPanelCollapsed(true)}
                isMobile={false}
              />
            )}
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <Info className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a document to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  ), [selectedDocument, isMounted]);

  return (
    <>
      <ThreeColumnLayoutAdvanced
        left={leftPanelContent}
        center={centerPanelContent}
        right={rightPanelContent}
        // Labels
        leftLabel="Documents"
        centerLabel="Editor"
        rightLabel="Inspector"
        // Widths
        leftWidth={280}
        rightWidth={320}
        centerMinWidth={400}
        minSideWidth={200}
        maxSideWidth={500}
        collapsedWidth={44}
        // Features
        resizable={true}
        showCollapseButtons={true}
        persistState={true}
        storageKey={storageKey ?? "documents-layout"}
        // Responsive
        collapseLeftAt={900}
        collapseRightAt={1100}
        stackAt={640}
        // Right panel state
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />

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
    </>
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
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No document selected
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select a document from the sidebar or create a new one
          </p>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Document
          </Button>
        </div>
      </div>
    </div>
  );
}
