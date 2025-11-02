import { FileText, Trash2, Edit, Pin, Star, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ViewConfig, RowAction } from "@/frontend/shared/ui";
import type { DocumentRecord } from "../types";
import { formatRelativeTime } from "../utils";

export interface DocumentViewConfigOptions {
  onOpen?: (document: DocumentRecord) => void;
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
  onPin?: (document: DocumentRecord) => Promise<void> | void;
  onStar?: (document: DocumentRecord) => Promise<void> | void;
  onShowDetails?: (document: DocumentRecord) => void;
}

type Action = RowAction<DocumentRecord>;

const buildActions = (options: DocumentViewConfigOptions): Action[] => {
  const { onOpen, onDelete, onPin, onStar, onShowDetails } = options;
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

  if (onPin) {
    actions.push({
      id: "pin",
      label: (doc) => (doc.isPinned ? "Unpin" : "Pin"),
      icon: <Pin className="w-4 h-4" />,
      onClick: async (doc: DocumentRecord) => {
        await onPin(doc);
      },
    });
  }

  if (onStar) {
    actions.push({
      id: "star",
      label: (doc) => (doc.isStarred ? "Unstar" : "Star"),
      icon: <Star className="w-4 h-4" />,
      onClick: async (doc: DocumentRecord) => {
        await onStar(doc);
      },
    });
  }

  if (onShowDetails) {
    actions.push({
      id: "details",
      label: "See Details",
      icon: <Info className="w-4 h-4" />,
      onClick: (doc: DocumentRecord) => {
        onShowDetails(doc);
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
  const actions = buildActions(options);

  return {
    getId: (doc) => String(doc._id),
    columns: [
      {
        id: "title",
        header: "Title",
        accessor: (doc) => doc.title,
        cell: (doc) => (
          <div className="flex items-center gap-2">
            <span className="font-medium">{doc.title}</span>
            {doc.isPinned && (
              <Badge variant="secondary" className="text-xs">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
            {doc.isStarred && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        ),
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
        cell: (doc) => (
          <Badge variant={doc.isPublic ? "default" : "secondary"}>
            {doc.isPublic ? "Public" : "Private"}
          </Badge>
        ),
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
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
      ),
      extra: (doc) => (
        <div className="flex items-center gap-2">
          {doc.isPinned && (
            <Pin className="w-3 h-3 text-muted-foreground" />
          )}
          {doc.isStarred && (
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          )}
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(doc.lastModified ?? doc._creationTime)}
          </span>
        </div>
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
