/**
 * AI Components Index
 * Exports all AI-specific chat components
 * @module shared/communications/chat/components/ai
 */

// Core components
export { AIMessage } from "./AIMessage";
export type { AIMessageProps } from "./AIMessage";

export { AIInput } from "./AIInput";
export type { AIInputProps } from "./AIInput";

export { AIHeader } from "./AIHeader";
export type { AIHeaderProps } from "./AIHeader";

export { AIThread } from "./AIThread";
export type { AIThreadProps } from "./AIThread";

export { AIContainer } from "./AIContainer";
export type { AIContainerProps } from "./AIContainer";

// List/Card components
export { AISessionCard } from "./AISessionCard";
export type { AISessionCardProps } from "./AISessionCard";

// State components
export { AIEmptyState } from "./AIEmptyState";
export type { AIEmptyStateProps } from "./AIEmptyState";

// Knowledge components
export { AIKnowledgeSelector } from "./AIKnowledgeSelector";
export type { AIKnowledgeSelectorProps, KnowledgeSource } from "./AIKnowledgeSelector";
