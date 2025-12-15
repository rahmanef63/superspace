"use client";

import { useCallback, useState, useEffect, useMemo, Suspense } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Info,
  Trash2,
  Bot,
  Sparkles,
  ArrowUpDown
} from "lucide-react";

// Components
import { DocumentsListView } from "./DocumentsListView";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentDetailView } from "./DocumentDetailView";
import { DocumentEditorOnly } from "./DocumentEditorOnly";
import { DocumentRightPanel } from "./DocumentRightPanel";
import { DocumentsTree } from "./DocumentsTree";
import { DocumentsBreadcrumbs } from "./DocumentsBreadcrumbs";

// Layout & Shared UI
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column";
import { StandardFeatureHeader } from "@/frontend/shared/ui/layout/header/presets";
import { ContainerHeader } from "@/frontend/shared/ui/layout/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureExportImport } from "@/frontend/shared/foundation/utils/data";
import { FeatureAIAssistant } from "@/frontend/shared/ui/ai-assistant/FeatureAIAssistant";
import { FeatureSkeletons } from "@/frontend/shared/ui/components/loading/FeatureSkeletons";
import { cn } from "@/lib/utils";

// Hooks & Logic
import { useDeleteDocument } from "../../api/documents";
import { useDocumentsManager } from "../hooks";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import type { DocumentCategory, DocumentEditorMode, DocumentRecord, DocumentSortOptions } from "../types";
import { sortDocuments } from "../utils";
import { formatRelativeTime } from "../utils";

function isWorkspaceId(
  value: Id<"workspaces"> | null | undefined
): value is Id<"workspaces"> {
  return typeof value === "string" && value.length > 0;
}

export interface DocumentsViewProps {
  manager: DocumentsManagerHook;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  workspaceId?: Id<"workspaces"> | null;
  category?: DocumentCategory;
}

export function DocumentsViewContent({
  manager,
  editorMode = "block",
  storageKey,
  workspaceId,
  category,
}: DocumentsViewProps) {
  const deleteDocument = useDeleteDocument();
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Sorting state
  const [sortOptions] = useState<DocumentSortOptions>({
    field: "modified",
    order: "desc",
  });

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Id<"documents">[]>([]);

  // Layout State
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<"inspector" | "ai" | "debug">("inspector");

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(prev => prev !== newIsMobile ? newIsMobile : prev);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleOpenCreateDialog = () => {
      manager.openCreateDialog();
    };
    window.addEventListener('open-create-document-dialog', handleOpenCreateDialog);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('open-create-document-dialog', handleOpenCreateDialog);
    };
  }, [manager]);

  // Handle selection toggling
  const handleToggleSelectDoc = useCallback((docId: Id<"documents">) => {
    setSelectedDocIds(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      }
      return [...prev, docId];
    });
  }, []);

  // Handle Bulk Delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedDocIds.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedDocIds.length} document${selectedDocIds.length > 1 ? 's' : ''}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await Promise.all(selectedDocIds.map(id => deleteDocument({ id })));
      toast.success(`Deleted ${selectedDocIds.length} documents`);
      setSelectedDocIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete documents");
    }
  }, [selectedDocIds, deleteDocument]);

  const sortedDocuments = useMemo(
    () => sortDocuments(manager.filteredDocuments, sortOptions),
    [manager.filteredDocuments, sortOptions]
  );

  const selectedDocument = useMemo(() => manager.documents.find(
    (doc) => doc._id === manager.state.selectedDocumentId
  ), [manager.documents, manager.state.selectedDocumentId]);


  // ============================================================================
  // Header Components (Unified for Desktop/Mobile)
  // ============================================================================

  // 1. Toggles (Public/Private/All)
  const headerToggles = useMemo(() => (
    <div className="flex bg-muted/50 p-1 rounded-lg border h-8 items-center shrink-0">
      {(["all", "private", "public"] as const).map((option) => (
        <button
          key={option}
          onClick={() => manager.setVisibility(option)}
          className={cn(
            "px-3 py-0.5 text-xs font-medium rounded-md transition-all h-6 flex items-center justify-center",
            manager.visibility === option
              ? "bg-background text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {option.charAt(0).toUpperCase() + option.slice(1)}
        </button>
      ))}
    </div>
  ), [manager.visibility, manager.setVisibility]);

  // 2. Actions (Export, AI, Add)
  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2">
      {/* Consolidated Export/Import Button (Dropdown) */}
      <FeatureExportImport
        featureId="knowledge/docs"
        variant="dropdown"
        selectedIds={selectedDocIds}
        className="h-8 w-8"
        buttonVariant="ghost"
        triggerIcon={<ArrowUpDown className="h-4 w-4" />}
      />

      {/* AI Assistant Toggle Button */}
      {isMobile ? (
        <FeatureAIAssistant
          featureId="knowledge/docs"
          context={selectedDocument}
          className="h-8 w-8"
          buttonVariant="ghost"
          title="Documents Assistant"
        />
      ) : (
        <Button
          variant={rightPanelMode === 'ai' && !rightPanelCollapsed ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setRightPanelMode("ai");
            setRightPanelCollapsed(false);
          }}
          title="AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      )}

      {/* New Document */}
      <Button
        size="sm"
        onClick={manager.openCreateDialog}
        className="gap-2 h-8 shrink-0"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Document</span>
        <span className="sm:hidden">New</span>
      </Button>
    </div>
  ), [selectedDocIds, manager.openCreateDialog, rightPanelMode, rightPanelCollapsed, isMobile, selectedDocument]);

  // 3. Search Config
  const searchConfig = useMemo(() => ({
    value: manager.search,
    onChange: manager.setSearch,
    placeholder: "Search documents..."
  }), [manager.search, manager.setSearch]);


  // ============================================================================
  // Sidebar Content (Selection Mode)
  // ============================================================================

  const sidebarActions = useMemo(() => {
    if (isSelectionMode) {
      return (
        <div className="flex items-center gap-1 w-full justify-between bg-muted/30 p-2 rounded-md mb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedDocIds([]);
              }}
              className="h-7 text-xs px-2"
            >
              Cancel
            </Button>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {selectedDocIds.length} selected
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              disabled={selectedDocIds.length === 0}
              onClick={handleBulkDelete}
              title="Delete Selected"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {sortedDocuments.length} Documents
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => setIsSelectionMode(true)}
        >
          Select
        </Button>
      </div>
    );
  }, [isSelectionMode, selectedDocIds, handleBulkDelete, sortedDocuments.length]);

  const sidebarContent = useMemo(() => {
    if (manager.isLoading) {
      return (
        <div className="flex h-32 items-center justify-center">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      );
    }
    if (sortedDocuments.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No documents found.
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {sidebarActions}
        <DocumentsTree
          documents={sortedDocuments}
          selectedId={manager.state.selectedDocumentId ?? null}
          onSelect={(docId) => manager.selectDocument(docId)}
          selectionMode={isSelectionMode}
          selectedIds={selectedDocIds}
          onToggleSelect={handleToggleSelectDoc}
        />
      </div>
    );
  }, [manager.isLoading, sortedDocuments, sidebarActions, manager.state.selectedDocumentId, manager.selectDocument, isSelectionMode, selectedDocIds, handleToggleSelectDoc]);


  // ============================================================================
  // View Rendering
  // ============================================================================

  // Common Header
  const commonHeader = (
    <StandardFeatureHeader
      title="Documents"
      search={searchConfig}
      toggles={headerToggles}
      actions={headerActions}
      className="border-b"
    />
  );

  // Inspector Content
  const inspector = (
    <DocumentRightPanel
      selectedDocument={selectedDocument ? {
        _id: selectedDocument._id,
        title: selectedDocument.title,
        isPublic: selectedDocument.isPublic,
        _creationTime: selectedDocument._creationTime,
        lastModified: selectedDocument.lastModified ?? undefined,
        tags: selectedDocument.tags,
        author: selectedDocument.author ? {
          name: selectedDocument.author.name || undefined,
          email: undefined,
        } : undefined,
      } : null}
      isMounted={isMounted}
      onClose={() => setRightPanelCollapsed(true)}
      mode={rightPanelMode}
      onModeChange={setRightPanelMode}
      onTagAdd={async (tag: string) => console.log("Add tag:", tag)}
      onTagRemove={async (tag: string) => console.log("Remove tag:", tag)}
    />
  );

  // Main Editor Content
  const editorContent = manager.state.selectedDocumentId ? (
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
  );

  // Mobile View
  if (isMobile) {
    if (manager.state.selectedDocumentId) {
      // Mobile Editor View
      return (
        <div className="flex flex-col h-full bg-background">
          {/* Edit Mobile Header */}
          <div className="flex items-center border-b p-2 gap-2 h-14 bg-background">
            <Button variant="ghost" size="icon" onClick={() => manager.selectDocument(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6" /></svg>
            </Button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate text-sm">{selectedDocument?.title}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {selectedDocument ? formatRelativeTime(selectedDocument.lastModified || selectedDocument._creationTime) : ''}
              </p>
            </div>
            {/* Mobile AI Button */}
            <FeatureAIAssistant
              featureId="knowledge/docs"
              context={selectedDocument}
              buttonVariant="ghost"
              buttonSize="icon"
              className="h-8 w-8"
              title="Documents Assistant"
            />
          </div>
          <div className="flex-1 overflow-hidden relative">
            {editorContent}
          </div>
        </div>
      );
    }

    // Mobile List View
    return (
      <div className="flex flex-col h-full bg-background">
        {commonHeader}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarContent}
        </div>

        {isWorkspaceId(workspaceId) ? (
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
        ) : null}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="flex flex-col h-full">
      {/* 1. Global Feature Header */}
      {commonHeader}

      {/* 2. Three Column Layout */}
      <div className="flex-1 min-h-0">
        <FeatureThreeColumnLayout
          // Sidebar
          // Empty title/stats to avoid double header with Global Header
          sidebarTitle={undefined}
          sidebarStats={undefined}
          sidebarActions={undefined}
          sidebarContent={sidebarContent}

          // Center
          mainContent={editorContent}
          mainHeader={
            // Minimal header for the editor area
            <div className="flex items-center justify-between px-4 py-2 border-b h-10 bg-muted/10">
              <DocumentsBreadcrumbs
                documents={manager.documents}
                selectedId={manager.state.selectedDocumentId ?? undefined}
                onSelect={(docId) => manager.selectDocument(docId ?? null)}
              />
              {selectedDocument && (
                <div className="flex items-center gap-1">
                  <Button
                    variant={rightPanelMode === "inspector" && !rightPanelCollapsed ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setRightPanelMode("inspector");
                      setRightPanelCollapsed(false);
                    }}
                  >
                    <Info className="h-3.5 w-3.5 mr-1" />
                    Inspector
                  </Button>
                </div>
              )}
            </div>
          }

          // Right
          inspector={inspector}

          // Layout Props
          storageKey={storageKey ?? "documents-layout"}
          rightCollapsed={rightPanelCollapsed}
          onRightCollapsedChange={setRightPanelCollapsed}
          className="border-t-0"
        />
      </div>

      {isWorkspaceId(workspaceId) ? (
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
      ) : null}
    </div>
  );
}

export interface DocumentsViewWrapperProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  initialDocumentId?: Id<"documents"> | null;
  /** Filter documents by category (article or document) */
  category?: DocumentCategory;
  mockData?: DocumentRecord[];
}

export function DocumentsView({
  workspaceId,
  editorMode = "block",
  storageKey,
  initialDocumentId = null,
  category,
  mockData,
}: DocumentsViewWrapperProps) {
  const manager = useDocumentsManager({ workspaceId, initialDocumentId, editorMode, category, mockData });

  if (manager.isLoading) {
    return <FeatureSkeletons.Documents />;
  }

  return (
    <DocumentsViewContent
      manager={manager}
      editorMode={editorMode}
      storageKey={storageKey}
      workspaceId={workspaceId}
      category={category}
    />
  );
}

// Legacy export names
export const WorkspaceDocumentsManager = DocumentsView;
export type WorkspaceDocumentsManagerProps = DocumentsViewWrapperProps;

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col p-6">
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
