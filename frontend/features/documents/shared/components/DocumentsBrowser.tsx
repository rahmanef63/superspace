"use client";

import { useCallback } from "react";
import type { ReactNode } from "react";
import { FileText, Plus } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ViewSwitcher } from "@/frontend/shared/ui/layout/view";
import { ViewToolbar } from "@/frontend/shared/ui/layout/view/ViewToolbar";
import { useViewMode } from "@/frontend/shared/ui/layout/view/useViewMode";
import {
  SecondarySidebarLayout,
  type SecondarySidebarHeaderProps,
  type SecondarySidebarProps,
  SecondarySidebarTools,
} from "@/frontend/shared/ui/layout/sidebar/secondary";
import { DocumentMenuWrapper } from "@/frontend/shared/ui/layout/menus/components/SecondaryMenuWrappers";
import type { DocumentRecord } from "../types";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import { createDocumentViewConfig } from "../config";
import { formatRelativeTime } from "../utils";
import { DocumentsTree } from "./DocumentsTree";
import { DocumentsBreadcrumbs } from "./DocumentsBreadcrumbs";

export interface DocumentsBrowserProps {
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
  workspaceId: Id<"workspaces">;
}

const visibilityOptions: Array<DocumentsManagerHook["visibility"]> = [
  "all",
  "private",
  "public",
];

export function DocumentsBrowser({
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
  workspaceId,
}: DocumentsBrowserProps) {
  const viewStorageKey = storageKey ?? "documents.view";
  const [viewMode, setViewMode] = useViewMode(viewStorageKey, "card");
  const noop = useCallback(() => {}, []);

  const config = createDocumentViewConfig({
    onOpen: (doc) => onSelect?.(doc._id),
    onDelete,
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
          <ViewToolbar
            mode={viewMode}
            setMode={setViewMode}
            query=""
            setQuery={noop}
            searchable={false}
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

  return (
    <DocumentMenuWrapper workspaceId={workspaceId}>
      <SecondarySidebarLayout
        className="h-full"
        headerProps={headerProps}
        sidebarProps={sidebarProps}
        sidebarClassName="border-r border bg-background"
        contentClassName="overflow-auto p-6"
      >
        {isLoading ? (
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
            mode={viewMode}
            onModeChange={setViewMode}
            data={filteredDocuments}
            config={config}
            searchable={false}
            showToolbar={false}
          />
        )}
      </SecondarySidebarLayout>
    </DocumentMenuWrapper>
  );
}
