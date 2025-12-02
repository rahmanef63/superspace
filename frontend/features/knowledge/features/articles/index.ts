/**
 * Knowledge > Articles Sub-Feature
 * 
 * Knowledge base articles are structured documents intended for AI
 * consumption and team reference. They use the same document system
 * but are categorized separately in the UI.
 */

// Re-export document functionality for articles
export * from "@/frontend/features/documents/shared";
export * from "@/frontend/features/documents/api";

// Article-specific types (can be extended in the future)
export interface ArticleMetadata {
  isAIAccessible: boolean;
  aiSummary?: string;
  aiTags?: string[];
  category?: string;
}
