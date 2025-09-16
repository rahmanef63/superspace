"use client";

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ViewSwitcher, type ViewConfig } from "@/frontend/shared/layout/view";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DocumentsViewProps {
  workspaceId: Id<"workspaces">;
  onDocumentSelect: (documentId: Id<"documents">) => void;
  onCreateDocument: () => void;
}

export function DocumentsView({ workspaceId, onDocumentSelect, onCreateDocument }: DocumentsViewProps) {
  const documents = (useQuery(api.menu.page.documents.getWorkspaceDocuments, { workspaceId }) || []) as Array<{
    _id: Id<"documents">;
    title: string;
    content?: string | null;
    _creationTime: number;
    author?: { name?: string | null } | null;
  }>;
  const deleteDocument = useMutation(api.menu.page.documents.deleteDocument);

  const config: ViewConfig<(typeof documents)[number]> = useMemo(() => ({
    getId: (d) => String(d._id),
    columns: [
      { id: "title", header: "Title", accessor: (d) => d.title },
      {
        id: "author",
        header: "Author",
        accessor: (d) => d.author?.name || "Unknown",
      },
      {
        id: "created",
        header: "Created",
        accessor: (d) => formatDistanceToNow(new Date(d._creationTime), { addSuffix: true }),
        hideOnCard: true,
      },
    ],
    actions: [
      {
        id: "open",
        label: "Open",
        icon: <Edit className="w-4 h-4" />,
        onClick: (d) => onDocumentSelect(d._id),
      },
      {
        id: "delete",
        label: "Delete",
        icon: <Trash2 className="w-4 h-4" />,
        onClick: async (d) => {
          if (!confirm("Delete this document?")) return;
          await deleteDocument({ documentId: d._id });
        },
      },
    ],
    card: {
      title: (d) => d.title,
      subtitle: (d) => (d.author?.name ? `by ${d.author.name}` : undefined),
      avatar: () => (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
      ),
      extra: (d) => (
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(d._creationTime), { addSuffix: true })}
        </span>
      ),
    },
    details: {
      fields: [
        { label: "Title", value: (d) => d.title },
        { label: "Author", value: (d) => d.author?.name || "Unknown" },
        { label: "Created", value: (d) => formatDistanceToNow(new Date(d._creationTime), { addSuffix: true }) },
      ],
    },
    searchFn: (d, q) =>
      d.title.toLowerCase().includes(q) || (d.author?.name || "").toLowerCase().includes(q),
  }), [deleteDocument, onDocumentSelect]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and collaborate on documents</p>
        </div>
        <Button onClick={onCreateDocument} className="bg-blue-600 hover:bg-blue-700">Create New</Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <ViewSwitcher
          storageKey={`documents.view.${workspaceId}`}
          initialMode="card"
          data={documents}
          config={config}
          searchable
          emptyState="No documents"
        />
      </div>
    </div>
  );
}
