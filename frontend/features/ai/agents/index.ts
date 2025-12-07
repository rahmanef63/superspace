/**
 * Sub-Agent System
 * 
 * Exports all sub-agent related functionality.
 */

// Types
export type {
    SubAgent,
    SubAgentTool,
    SubAgentContext,
    SubAgentResponse,
    ToolParameter,
    ToolResult,
    ToolCall,
    LLMToolDefinition,
    SubAgentRegistryEntry,
    RoutingOptions,
    RoutingResult,
} from "./types";

// Registry
export { subAgentRegistry, SubAgentRegistry } from "./registry";

// Router
export {
    executeTool,
    executeToolCall,
    processSubAgentQuery,
    buildAgentSystemPrompt,
    formatToolResult,
    getAgentSummary,
    listAvailableAgents,
} from "./router";
