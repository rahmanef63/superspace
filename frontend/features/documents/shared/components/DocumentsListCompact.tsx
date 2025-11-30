"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Plus, Clock, Calendar, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UniversalToolbar,
  toolType,
  type SortToolParams,
} from "@/frontend/shared/ui/layout/toolbar";
import { SecondarySidebarTools } from "@/frontend/shared/ui";
import type { DocumentRecord, DocumentSortOptions } from "../types";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import { formatRelativeTime } from "../utils";
import { DocumentsTree } from "./DocumentsTree";
import { DocumentsBreadcrumbs } from "./DocumentsBreadcrumbs";

export interface DocumentsListCompactProps {
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
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
  onPin?: (document: DocumentRecord) => Promise<void> | void;
  onStar?: (document: DocumentRecord) => Promise<void> | void;
  sortOptions?: DocumentSortOptions;
  onSortChange?: (options: DocumentSortOptions) => void;
  workspaceId: Id<"workspaces">;
}

const visibilityOptions: Array<DocumentsManagerHook["visibility"]> = [
  "all",
  "private",
  "public",
];

/**
 * DocumentsListCompact - Simplified list for 3-column layout
 * 
 * No SecondarySidebarLayout wrapper - just pure content
 * Used inside DocumentsThreeColumnLayout column 1
 */
export function DocumentsListCompact({
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
  sortOptions = { field: "modified", order: "desc" },
  onSortChange,
}: DocumentsListCompactProps) {
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Documents</h2>
            <p className="text-xs text-muted-foreground">
              {stats.total} total | {stats.publicCount} public | {stats.privateCount} private
            </p>
            {stats.lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Updated {formatRelativeTime(stats.lastUpdated)}
              </p>
            )}
          </div>
          {onCreate && (
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
        </div>

        {/* Search */}
        <SecondarySidebarTools
          search={{
            value: search,
            onChange: onSearch,
            placeholder: "Search documents...",
          }}
        />

        {/* Sort & Filters */}
        <div className="space-y-2">
          <UniversalToolbar
            tools={[
              {
                id: "sort-compact" as any,
                type: toolType.sort,
                params: sortToolParams,
              },
            ]}
            spacing="compact"
            background="transparent"
          />

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

        {/* Breadcrumbs */}
        <DocumentsBreadcrumbs
          documents={documents}
          selectedId={selectedDocumentId ?? undefined}
          onSelect={(docId) => onSelect?.(docId ?? null)}
        />
      </div>

      {/* Document Tree - Single source of document list */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-3" />
              <span className="text-sm text-muted-foreground">Loading documents...</span>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm text-muted-foreground text-center">
              No documents match your current filters.
            </p>
          </div>
        ) : (
          <DocumentsTree
            documents={filteredDocuments}
            selectedId={selectedDocumentId ?? null}
            onSelect={(docId) => onSelect?.(docId)}
          />
        )}
      </div>
    </div>
  );
}
