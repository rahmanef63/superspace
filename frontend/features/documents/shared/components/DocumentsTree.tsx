"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "../types";

import { Checkbox } from "@/components/ui/checkbox";

interface DocumentsTreeProps {
  documents: DocumentRecord[];
  selectedId?: Id<"documents"> | null;
  onSelect?: (id: Id<"documents">) => void;
  className?: string;
  // Selection Mode Props
  selectionMode?: boolean;
  selectedIds?: Id<"documents">[];
  onToggleSelect?: (id: Id<"documents">) => void;
}

interface TreeNode {
  document: DocumentRecord;
  children: TreeNode[];
}

function buildDocumentTree(documents: DocumentRecord[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  documents.forEach((doc) => {
    nodeMap.set(String(doc._id), { document: doc, children: [] });
  });

  documents.forEach((doc) => {
    const node = nodeMap.get(String(doc._id));
    if (!node) return;

    const parentId = doc.parentId;
    if (parentId) {
      const parentNode = nodeMap.get(String(parentId));
      if (parentNode) {
        parentNode.children.push(node);
        return;
      }
    }

    roots.push(node);
  });

  const sortRecursive = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.document.title.localeCompare(b.document.title));
    nodes.forEach((node) => {
      if (node.children.length) {
        sortRecursive(node.children);
      }
    });
  };

  sortRecursive(roots);
  return roots;
}

export function DocumentsTree({
  documents,
  selectedId,
  onSelect,
  className,
  selectionMode = false,
  selectedIds = [],
  onToggleSelect,
}: DocumentsTreeProps) {
  const tree = useMemo(() => buildDocumentTree(documents), [documents]);

  const renderNode = (node: TreeNode, depth = 0) => {
    const { document, children } = node;
    const isActive = selectedId ? String(selectedId) === String(document._id) : false;
    const isChecked = selectedIds.includes(document._id);
    const hasChildren = children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
      if (selectionMode) {
        e.preventDefault();
        onToggleSelect?.(document._id);
      } else {
        onSelect?.(document._id);
      }
    };

    return (
      <div key={String(document._id)}>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition group",
            isActive && !selectionMode
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          style={{ paddingLeft: `${depth * 18 + 8}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectionMode && (
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onToggleSelect?.(document._id)}
                className="mr-1 h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {hasChildren ? (
              <Folder className={cn("h-4 w-4 shrink-0", isActive && !selectionMode ? "text-primary/80" : "text-muted-foreground")} />
            ) : (
              <FileText className={cn("h-4 w-4 shrink-0", isActive && !selectionMode ? "text-primary/80" : "text-muted-foreground")} />
            )}
            <span className="truncate">{document.title || "Untitled"}</span>
          </div>
        </button>

        {children.length > 0 && (
          <div className="space-y-1">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tree.length === 0) {
    return (
      <div className={cn("rounded-md border border-dashed border-muted p-4 text-sm text-muted-foreground", className)}>
        No documents yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {tree.map((node) => renderNode(node))}
    </div>
  );
}
