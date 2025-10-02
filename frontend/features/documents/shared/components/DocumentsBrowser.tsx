"use client";

import type { ReactNode } from "react";
import { FileText, Plus, Search } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewSwitcher } from "@/frontend/shared/layout/view";
import type { DocumentRecord } from "../types";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import { createDocumentViewConfig } from "../config";
import { formatRelativeTime } from "../utils";
import { cn } from "@/lib/utils";

export interface DocumentsBrowserProps {
  documents: DocumentRecord[];
  filteredDocuments: DocumentRecord[];
  isLoading?: boolean;
  onSelect?: (documentId: Id<"documents">) => void;
  onCreate?: () => void;
  search: string;
  onSearch: (value: string) => void;
  visibility: DocumentsManagerHook["visibility"];
  onVisibilityChange: (value: DocumentsManagerHook["visibility"]) => void;
  stats: DocumentsManagerHook["stats"];
  storageKey?: string;
  emptyState?: ReactNode;
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
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
  search,
  onSearch,
  visibility,
  onVisibilityChange,
  stats,
  storageKey,
  emptyState,
  onDelete,
}: DocumentsBrowserProps) {
  const config = createDocumentViewConfig({
    onOpen: (doc) => onSelect?.(doc._id),
    onDelete,
  });

  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onSearch(event.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-gray-600">
              {stats.total} total | {stats.publicCount} public | {stats.privateCount} private
            </p>
            {stats.lastUpdated && (
              <p className="text-xs text-gray-400">Updated {formatRelativeTime(stats.lastUpdated)}</p>
            )}
          </div>

          {onCreate && (
            <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            {visibilityOptions.map((option) => (
              <Button
                key={option}
                variant={option === visibility ? "default" : "outline"}
                className={cn(
                  option === visibility
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : ""
                )}
                onClick={() => onVisibilityChange(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-400 h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span>Loading documents...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          emptyState ?? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500" >
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p>No documents match your current filters.</p>
            </div>
          )
        ) : (
          <ViewSwitcher
            storageKey={storageKey ?? "documents.view"}
            initialMode="card"
            data={filteredDocuments}
            config={config}
            searchable={false}
          />
        )}
      </div>
    </div>
  );
}
