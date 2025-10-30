import { FileText, Trash2, Edit } from "lucide-react";
import type { ViewConfig, RowAction } from "@/frontend/shared/ui";
import type { DocumentRecord } from "../types";
import { formatRelativeTime } from "../utils";

export interface DocumentViewConfigOptions {
  onOpen?: (document: DocumentRecord) => void;
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
}

type Action = RowAction<DocumentRecord>;

const buildActions = (
  onOpen?: DocumentViewConfigOptions["onOpen"],
  onDelete?: DocumentViewConfigOptions["onDelete"]
): Action[] => {
  const actions: Action[] = [];

  if (onOpen) {
    actions.push({
      id: "open",
      label: "Open",
      icon: <Edit className="w-4 h-4" />,
      onClick: (doc: DocumentRecord) => {
        onOpen(doc);
      },
    });
  }

  if (onDelete) {
    actions.push({
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: async (doc: DocumentRecord) => {
        await onDelete(doc);
      },
    });
  }

  return actions;
};

export const createDocumentViewConfig = (
  options: DocumentViewConfigOptions = {}
): ViewConfig<DocumentRecord> => {
  const { onOpen, onDelete } = options;
  const actions = buildActions(onOpen, onDelete);

  return {
    getId: (doc) => String(doc._id),
    columns: [
      {
        id: "title",
        header: "Title",
        accessor: (doc) => doc.title,
      },
      {
        id: "author",
        header: "Author",
        accessor: (doc) => doc.author?.name || "Unknown",
      },
      {
        id: "visibility",
        header: "Visibility",
        accessor: (doc) => (doc.isPublic ? "Public" : "Private"),
        hideOnCard: true,
      },
      {
        id: "updated",
        header: "Updated",
        accessor: (doc) =>
          formatRelativeTime(doc.lastModified ?? doc._creationTime),
        hideOnCard: true,
      },
    ],
    actions: actions.length ? actions : undefined,
    card: {
      title: (doc) => doc.title,
      subtitle: (doc) =>
        doc.author?.name ? `by ${doc.author.name}` : undefined,
      avatar: () => (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
      ),
      extra: (doc) => (
        <span className="text-xs text-gray-500">
          {formatRelativeTime(doc.lastModified ?? doc._creationTime)}
        </span>
      ),
    },
    details: {
      fields: [
        { label: "Title", value: (doc) => doc.title },
        { label: "Author", value: (doc) => doc.author?.name || "Unknown" },
        {
          label: "Visibility",
          value: (doc) => (doc.isPublic ? "Public" : "Private"),
        },
        {
          label: "Updated",
          value: (doc) =>
            formatRelativeTime(doc.lastModified ?? doc._creationTime),
        },
      ],
    },
    searchFn: (doc, query) => {
      const lowered = query.toLowerCase();
      return (
        doc.title.toLowerCase().includes(lowered) ||
        (doc.author?.name || "").toLowerCase().includes(lowered)
      );
    },
  };
};
