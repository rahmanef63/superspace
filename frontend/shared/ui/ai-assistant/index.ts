/**
 * AI Assistant Components
 * 
 * Shared AI assistant UI components for features.
 * 
 * Key components:
 * - TwoColumnWithAILayout: Standard 2-column layout with AI panel (use this for all features)
 * - FeatureAIAssistant: Button that toggles AI panel (auto-detects panel mode)
 * - AIChatPanel: The chat interface component
 * - AIAssistantPanelProvider: Context provider for panel state
 */

// Layout with AI panel
export { TwoColumnWithAILayout, TwoColumnWithAILayoutInner } from "./TwoColumnWithAILayout";
export type { TwoColumnWithAILayoutProps } from "./TwoColumnWithAILayout";

// Context for panel state
export { 
  AIAssistantPanelProvider, 
  useAIAssistantPanel, 
  useAIAssistantPanelSafe 
} from "./AIAssistantPanelContext";
export type { 
  AIAssistantPanelContextValue, 
  AIAssistantPanelProviderProps 
} from "./AIAssistantPanelContext";

// Feature AI Assistant button
export { FeatureAIAssistant } from "./FeatureAIAssistant";
export type { FeatureAIAssistantProps } from "./FeatureAIAssistant";

// AI Chat Panel
export { AIChatPanel } from "./AIChatPanel";
export type { AIChatPanelProps } from "./AIChatPanel";
