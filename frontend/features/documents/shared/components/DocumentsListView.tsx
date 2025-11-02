"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FileText, Plus, Clock, Calendar, FileType, LayoutGrid, List as ListIcon, Table2 } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ViewSwitcher } from "@/frontend/shared/ui";
import {
  SecondarySidebarLayout,
  type SecondarySidebarHeaderProps,
  type SecondarySidebarProps,
  SecondarySidebarTools,
} from "@/frontend/shared/ui";
import { DocumentMenuWrapper } from "@/frontend/shared/ui";
import {
  UniversalToolbar,
  toolType,
  viewMode as toolbarViewMode,
  useViewMode as useToolbarViewMode,
  type SortToolParams,
} from "@/frontend/shared/ui/layout/toolbar";
import type { DocumentRecord, DocumentSortOptions } from "../types";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import { createDocumentViewConfig } from "../config";
import { formatRelativeTime } from "../utils";
import { DocumentsTree } from "./DocumentsTree";
import { DocumentsBreadcrumbs } from "./DocumentsBreadcrumbs";
import { DocumentInspector } from "./DocumentInspector";

export interface DocumentsListViewProps {
  documents: DocumentRecord[];
  filteredDocuments: DocumentRecord[];
  isLoading?: boolean;
  onSelect?: (documentId: Id<"documents"> | null) => void;
  onCreate?: () => void;
  selectedDocumentId?: Id<"documents"> | null;
  search: string;
  onSearch: (value: string) => void;
  visibility: DocumentsManagerHook["visibility"];
  onVisibilityChange: (value: DocumentsManagerHook["visibility"]) => void;
  stats: DocumentsManagerHook["stats"];
  storageKey?: string;
  emptyState?: ReactNode;
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
  onPin?: (document: DocumentRecord) => Promise<void> | void;
  onStar?: (document: DocumentRecord) => Promise<void> | void;
  sortOptions?: DocumentSortOptions;
  onSortChange?: (options: DocumentSortOptions) => void;
  workspaceId: Id<"workspaces">;
  isMobile?: boolean;
}

const visibilityOptions: Array<DocumentsManagerHook["visibility"]> = [
  "all",
  "private",
  "public",
];

export function DocumentsListView({
  documents,
  filteredDocuments,
  isLoading,
  onSelect,
  onCreate,
  selectedDocumentId,
  search,
  onSearch,
  visibility,
  onVisibilityChange,
  stats,
  storageKey,
  emptyState,
  onDelete,
  onPin,
  onStar,
  sortOptions = { field: "modified", order: "desc" },
  onSortChange,
  workspaceId,
  isMobile = false,
}: DocumentsListViewProps) {
  const viewStorageKey = storageKey ?? "documents.view";
  // Use new toolbar viewMode system - map to toolbar view modes
  const [viewMode, setViewMode] = useToolbarViewMode(viewStorageKey, toolbarViewMode.tiles);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorDocument, setInspectorDocument] = useState<DocumentRecord | null>(null);
  const noop = useCallback(() => {}, []);

  // Map toolbar viewMode to legacy ViewSwitcher modes
  const legacyViewMode = useMemo(() => {
    if (viewMode === toolbarViewMode.list) return "table";
    if (viewMode === toolbarViewMode.tiles) return "card";
    if (viewMode === toolbarViewMode.detail) return "details";
    return "card"; // default
  }, [viewMode]);

  const handleShowDetails = useCallback((doc: DocumentRecord) => {
    setInspectorDocument(doc);
    setInspectorOpen(true);
  }, []);

  const handleTagAdd = async (tag: string) => {
    // TODO: Implement tag add mutation
    console.log("Add tag:", tag, "to document:", inspectorDocument?._id);
  };

  const handleTagRemove = async (tag: string) => {
    // TODO: Implement tag remove mutation
    console.log("Remove tag:", tag, "from document:", inspectorDocument?._id);
  };

  const config = createDocumentViewConfig({
    onOpen: (doc) => onSelect?.(doc._id),
    onDelete,
    onPin,
    onStar,
    onShowDetails: isMobile ? handleShowDetails : undefined,
  });

  const handleBreadcrumbSelect = useCallback(
    (docId?: Id<"documents">) => {
      onSelect?.(docId ?? null);
    },
    [onSelect]
  );

  const handleTreeSelect = useCallback(
    (docId: Id<"documents">) => {
      onSelect?.(docId);
    },
    [onSelect]
  );

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

  const headerProps: SecondarySidebarHeaderProps = {
    title: "Documents",
    description: (
      <>
        {stats.total} total | {stats.publicCount} public | {stats.privateCount} private
      </>
    ),
    meta: stats.lastUpdated ? (
      <span>
        Updated {formatRelativeTime(stats.lastUpdated)}
      </span>
    ) : undefined,
    primaryAction: onCreate
      ? {
          label: "New Document",
          icon: Plus,
          onClick: onCreate,
        }
      : undefined,
    toolbar: (
      <div className="space-y-3">
        <SecondarySidebarTools
          search={{
            value: search,
            onChange: onSearch,
            placeholder: "Search documents...",
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <UniversalToolbar
            tools={[
              {
                id: "sort-documents" as any,
                type: toolType.sort,
                params: sortToolParams,
              },
            ]}
            spacing="compact"
            background="transparent"
            className="flex-1"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {visibilityOptions.map((option) => (
            <Button
              key={option}
              variant={option === visibility ? "default" : "outline"}
              className={cn(
                option === visibility
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              )}
              onClick={() => onVisibilityChange(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    ),
  };

  const sidebarProps: SecondarySidebarProps = {
    header: (
      <div className="space-y-4">
        <DocumentsBreadcrumbs
          documents={documents}
          selectedId={selectedDocumentId ?? undefined}
          onSelect={handleBreadcrumbSelect}
        />
        <div className="rounded-lg border border-border bg-background p-3">
          <UniversalToolbar
            tools={[
              {
                id: "view-mode" as any,
                type: toolType.view,
                params: {
                  options: [
                    { label: "Tiles", value: toolbarViewMode.tiles, icon: LayoutGrid },
                    { label: "List", value: toolbarViewMode.list, icon: ListIcon },
                    { label: "Table", value: toolbarViewMode.table, icon: Table2 },
                  ],
                  currentView: viewMode,
                  onChange: setViewMode,
                  layout: "buttons",
                  showLabels: !isMobile,
                },
              },
            ]}
            spacing="compact"
            background="transparent"
            className="w-full"
          />
        </div>
      </div>
    ),
    sections: [
      {
        id: "documents-tree",
        content: (
          <div className="pr-1">
            <DocumentsTree
              documents={documents}
              selectedId={selectedDocumentId ?? null}
              onSelect={handleTreeSelect}
              className="pr-1"
            />
          </div>
        ),
      },
    ],
    contentClassName: "p-4 pr-2",
  };

  const content = isLoading ? (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      <span>Loading documents...</span>
    </div>
  ) : filteredDocuments.length === 0 ? (
    emptyState ?? (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
        <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
        <p>No documents match your current filters.</p>
      </div>
    )
  ) : (
    <ViewSwitcher
      storageKey={viewStorageKey}
      initialMode="card"
      mode={legacyViewMode as any}
      onModeChange={(mode: any) => {
        // Map legacy mode back to toolbar viewMode
        if (mode === "table") setViewMode(toolbarViewMode.list);
        else if (mode === "card") setViewMode(toolbarViewMode.tiles);
        else if (mode === "details") setViewMode(toolbarViewMode.detail);
      }}
      data={filteredDocuments}
      config={config}
      searchable={false}
      showToolbar={false}
    />
  );

  // Mobile: Simple layout without sidebar
  if (isMobile) {
    return (
      <DocumentMenuWrapper workspaceId={workspaceId}>
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex-shrink-0 border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold">{headerProps.title}</h1>
                {headerProps.description && typeof headerProps.description === 'string' && (
                  <p className="text-sm text-muted-foreground">{headerProps.description}</p>
                )}
              </div>
              {headerProps.primaryAction && typeof headerProps.primaryAction === 'object' && 'onClick' in headerProps.primaryAction && (
                <Button size="sm" onClick={headerProps.primaryAction.onClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              )}
            </div>

            {/* Search, Sort, and Filters */}
            <div className="space-y-3">
              <SecondarySidebarTools
                search={{
                  value: search,
                  onChange: onSearch,
                  placeholder: "Search documents...",
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <UniversalToolbar
                  tools={[
                    {
                      id: "sort-documents-mobile" as any,
                      type: toolType.sort,
                      params: sortToolParams,
                    },
                  ]}
                  spacing="compact"
                  background="transparent"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {visibilityOptions.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={option === visibility ? "default" : "outline"}
                    onClick={() => onVisibilityChange(option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-auto p-4">
            {content}
          </div>
        </div>

        {/* Mobile Inspector Drawer */}
        {inspectorDocument && (
          <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
            <SheetContent side="bottom" className="h-[80vh]">
              <DocumentInspector
                document={{
                  _id: inspectorDocument._id,
                  title: inspectorDocument.title,
                  isPublic: inspectorDocument.isPublic,
                  createdAt: inspectorDocument._creationTime,
                  updatedAt: inspectorDocument.lastModified || inspectorDocument._creationTime,
                  tags: inspectorDocument.tags,
                  owner: inspectorDocument.author ? {
                    name: inspectorDocument.author.name || undefined,
                    email: undefined,
                  } : undefined,
                }}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                onClose={() => setInspectorOpen(false)}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>
        )}
      </DocumentMenuWrapper>
    );
  }

  // Desktop: Full layout with sidebar
  return (
    <DocumentMenuWrapper workspaceId={workspaceId}>
      <SecondarySidebarLayout
        className="h-full"
        headerProps={headerProps}
        sidebarProps={sidebarProps}
        sidebarClassName="border-r border bg-background"
        contentClassName="overflow-auto p-6"
      >
        {content}
      </SecondarySidebarLayout>
    </DocumentMenuWrapper>
  );
}

// Legacy export for backwards compatibility
export const DocumentsBrowser = DocumentsListView;
export type DocumentsBrowserProps = DocumentsListViewProps;
