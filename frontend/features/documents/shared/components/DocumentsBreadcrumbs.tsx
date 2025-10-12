"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentRecord } from "../types";

interface DocumentsBreadcrumbsProps {
  documents: DocumentRecord[];
  selectedId?: Id<"documents"> | null;
  onSelect?: (id?: Id<"documents">) => void;
}

export function DocumentsBreadcrumbs({
  documents,
  selectedId,
  onSelect,
}: DocumentsBreadcrumbsProps) {
  const breadcrumbs = useMemo(() => {
    if (!selectedId) return [];
    const docMap = new Map<string, DocumentRecord>();
    documents.forEach((doc) => docMap.set(String(doc._id), doc));

    const trail: DocumentRecord[] = [];
    let current: DocumentRecord | undefined = docMap.get(String(selectedId));

    while (current) {
      trail.unshift(current);
      if (current.parentId) {
        current = docMap.get(String(current.parentId));
      } else {
        current = undefined;
      }
    }

    return trail;
  }, [documents, selectedId]);

  if (breadcrumbs.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect?.()}
        className="flex items-center gap-2 px-2 py-1 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span>All documents</span>
      </Button>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect?.()}
        className="flex items-center gap-2 px-2 py-1 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span>All documents</span>
      </Button>

      {breadcrumbs.map((doc, index) => (
        <div key={String(doc._id)} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect?.(doc._id)}
            className={`px-2 py-1 ${
              index === breadcrumbs.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {doc.title || "Untitled"}
          </Button>
        </div>
      ))}
    </nav>
  );
}
