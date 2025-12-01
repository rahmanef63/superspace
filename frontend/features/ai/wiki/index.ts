/**
 * AI Knowledge Base (Wiki) Feature
 *
 * Main entry point for the AI wiki/knowledge base feature.
 * Used for AI context management and RAG (Retrieval Augmented Generation).
 */

export { default as AIWikiPage } from "./views/WikiPage"
export { default as WikiPage } from "./views/WikiPage" // Legacy alias
export * from "./hooks/useWiki"
export * from "./types"
