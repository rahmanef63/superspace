import { formatDistanceToNow } from "date-fns";
import type { DocumentRecord, DocumentSortOptions } from "../types";

export const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

export const getWordCount = (value: string) => {
  const text = stripHtml(value).trim();
  return text ? text.split(/\s+/).length : 0;
};

export const getCharacterCount = (value: string) => stripHtml(value).length;

export const formatRelativeTime = (timestamp?: number | null) => {
  if (!timestamp) return "Unknown";
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const ensureTitle = (title: string, fallback = "Untitled") => {
  const trimmed = title.trim();
  return trimmed.length ? trimmed : fallback;
};

/**
 * Sorts documents based on the provided sort options.
 * Pinned documents are always sorted first, regardless of sort order.
 */
export const sortDocuments = (
  documents: DocumentRecord[],
  sortOptions: DocumentSortOptions
): DocumentRecord[] => {
  const { field, order } = sortOptions;
  const multiplier = order === "asc" ? 1 : -1;

  return [...documents].sort((a, b) => {
    // Pinned documents always come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Sort by the selected field
    switch (field) {
      case "created":
        return (a._creationTime - b._creationTime) * multiplier;
      case "modified":
        const aModified = a.lastModified ?? a._creationTime;
        const bModified = b.lastModified ?? b._creationTime;
        return (aModified - bModified) * multiplier;
      case "name":
        return a.title.localeCompare(b.title) * multiplier;
      default:
        return 0;
    }
  });
};
