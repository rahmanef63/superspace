import { formatDistanceToNow } from "date-fns";

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
