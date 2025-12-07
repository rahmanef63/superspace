/**
 * AI Chat Panel
 * 
 * A chat interface component for the right panel of three-column layouts.
/**
 * AI Chat Panel
 * 
 * A chat interface component for the right panel of three-column layouts.
 * Provides feature-specific AI assistance within the panel context.
 */

"use client";

import * as React from "react";
import {
    GrokUserMessage,
    GrokAIMessage,
    GrokTypingIndicator,
    GrokChatContainer,
    GrokInput,
} from "@/frontend/shared/communications/components/grok-chat";
import { Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubAgentRouter } from "@/frontend/features/ai/hooks/useSubAgentRouter";
import { subAgentRegistry } from "@/frontend/features/ai/agents";

// ============================================================================
// Types
// ============================================================================

export interface AIChatPanelProps {
    /** Feature ID to filter agents (e.g., 'documents', 'tasks') */
    featureId: string;
    /** Custom placeholder text */
    placeholder?: string;
    /** Additional className */
    className?: string;
    /** Context for the AI to understand current state */
    context?: {
        selectedDocumentId?: string;
        selectedDocumentTitle?: string;
        [key: string]: any;
    };
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    toolUsed?: string;
    isLoading?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function AIChatPanel({
    featureId,
    placeholder,
    className,
    context,
}: AIChatPanelProps) {
    const [input, setInput] = React.useState("");
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = React.useState(false);

    // We don't support attachments in sub-agent yet, but GrokInput expects these props
    const [attachments, setAttachments] = React.useState<File[]>([]);

    const {
        executeTool,
        formatResult,
        generateText,
        generateChat,
        processQuery,
        getAgentSystemPrompt
    } = useSubAgentRouter();

    // Get the agent for this feature
    const agent = React.useMemo(() => {
        const agents = subAgentRegistry.getAllAgents();
        return agents.find((a) => a.featureId === featureId);
    }, [featureId]);

    // Helper to add message
    const addMessage = (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
    };

    // Handle sending a message
    const handleSend = React.useCallback(async () => {
        if (!input.trim() || isProcessing) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        addMessage(userMessage);
        setInput("");
        setIsProcessing(true);

        // Add loading message
        const loadingId = `loading-${Date.now()}`;
        addMessage({
            id: loadingId,
            role: "assistant",
            content: "Thinking...",
            timestamp: new Date(),
            isLoading: true,
        });

        try {
            // Use the sub-agent router to process the logical query
            const response = await processQuery(userMessage.content);

            if (response) {
                // Formatting the response
                let content = response.response;

                // If the response is empty but we have a tool result, show that
                // NOTE: The current processQuery doesn't return tool execution details separately in the simple interface,
                // but the agent execution inside `processSubAgentRouter` (which we need to verify) 
                // typically returns a text response or tool result.

                // WAIT: The `processQuery` implementation in `useSubAgentRouter` returns `SubAgentResponse`.
                // We need to check if we need to manually Execute the tool OR if `processQuery` already did it.
                // Looking at `router.ts`, `processSubAgentQuery` returns an object with `agentId`, `response` (empty), etc.
                // It does NOT execute the LLM or tool. It just routes?

                // Re-reading `router.ts`:
                // `processSubAgentQuery` routes the query and returns context. It does NOT generate the answer.

                // So we need to:
                // 1. Get the agent (via routing or default).
                // 2. Build the system prompt.
                // 3. Call `generateChat` with the system prompt + history.
                // 4. Handle tool calls if the LLM produces them (legacy `generateChat` might not handle tools yet?)

                // Actually, `AIChatPanel` was trying to replicate the agent loop.
                // Let's implement a proper Agent Loop here using `generateChat` which seems to be the main LLM interface.

                // Construct history
                const history = messages
                    .filter(m => !m.isLoading && m.id !== loadingId && !m.id.startsWith("error-"))
                    .map(m => ({
                        role: m.role as "user" | "assistant",
                        content: m.content
                    }));
                history.push({ role: "user", content: userMessage.content });

                // Get Agent & System Prompt
                let systemPrompt = "You are a helpful AI assistant.";
                let currentAgent = agent;

                // If no specific feature agent, try to route?
                // For now, `featureId` is passed, so we stick to that agent.
                if (currentAgent) {
                    const agentContext = await getAgentSystemPrompt(currentAgent.id);
                    if (agentContext) systemPrompt = agentContext;
                }

                // Call LLM
                // We need to handle TOOL CALLING. 
                // The `generateChat` currently just returns text (string | null).
                // It does NOT support automated tool calling in the `useSubAgentRouter` hook implementation yet 
                // (it calls `/api/ai/chat` which might returns text).

                // However, the previous code had `executeTool`.
                // To support tools properly, we need the LLM to return JSON/Tool calls.
                // But the current `generateChat` just returns content string.

                // HYBRID APPROACH (Correct Fix):
                // We will use the `generateChat` to get a response. 
                // We will INSTRUCT the LLM to output TOOL CALLS as a specific JSON block if it wants to act.
                // OR we can rely on `processSubAgentQuery` if it was fully implemented. 

                // Let's look at `router.ts` again. `processSubAgentQuery` does NOT execute tools.
                // But `AIChatPanel` had logic for specific keywords. 
                // The user wants "smart" document creation.

                // I will use `generateChat` but with a System Prompt that includes tool definitions (which `getAgentSystemPrompt` does).
                // And I will try to parse the output for tool calls? 
                // OR, I can rely on the `/api/ai/chat` handling tool calls if configured? 
                // The `generateChat` implementation in `useSubAgentRouter` sends `messages` to `/api/ai/chat`.

                // IF `/api/ai/chat` doesn't support tools, we are limited.
                // BUT, looking at `document-agent.ts`, it has `tools`. 
                // And `router.ts` has `executeTool`.

                // The previous code MANUALLY parsed keywords. The USER HATED THAT (text mangling).
                // The user wants the LLM to do it.

                // I will implement a "ReAct" style loop or similar:
                // 1. Call LLM with tools description.
                // 2. If LLM replies with a Tool Call Syntax (we need to define one, e.g. XML or JSON), we execute it.

                // Let's assume the LLM is smart enough to reply with:
                // "Tool: createDocument({ ... })" if we tell it to.

                // Better yet, I will look at `executeToolCalls` in `useSubAgentRouter`.

                // Let's implement a clean loop:
                const responseText = await generateChat(history, systemPrompt);

                if (!responseText) throw new Error("No response from AI");

                // Check for Tool invocation pattern (e.g. JSON block or specific marker)
                // Since we don't have native tool calling support in the `generateChat` hook (it returns string),
                // We will try to detect if the response contains a JSON-like tool call if we instruct it to.

                // However, without changing the backend `/api/ai/chat` to force tool mode, this is flaky.
                // BUT, `agent.systemPrompt` in `document-agent.ts` doesn't explicitly mention HOW to call tools.
                // I need to update `router.ts` `buildAgentSystemPrompt` to instruct the LLM on HOW to call tools.

                // Wait! I can't update `router.ts` AND `AIChatPanel.tsx` in one tool call.
                // I will update `AIChatPanel.tsx` to generic flow first.

                let finalResponse = responseText;
                let activeTool = "";

                // Very naive Tool Detection (JSON-like)
                // We will assume for now the user wants CHAT, but if we want actions we need the LLM to output a structured command.

                // For now, I will trust the LLM's text response. 
                // BUT the user specifically wants `createDocument` to work.

                // Let's use the `processQuery` (which uses `routeQuery`) to at least IDENTIFY the intent if possible?
                // No, `processQuery` just finds the agent.

                // The previous code was: `lowerInput.includes(...)`.
                // I will replace it with a direct LLM call that includes the context.
                // AND I will add a post-processing step:
                // If the LLM says "I have created the document...", it can't actually do it unless we give it the tool.

                // ALTERNATIVE: Use a "Router/Action" prompt first.
                // "Analyze this user message. Does it require a tool action? If yes, output JSON. If no, output text."

                // Given the constraints and the user's frustration with the "manual matching", 
                // I will rely on the LLM. I will modify `AIChatPanel` to:
                // 1. Send the message to LLM.
                // 2. Pass the available tools definitions in the system prompt.
                // 3. (Crucial) Parse the output for a specific "SEARCH_TOOL: x" or "CALL_TOOL: { ... }" pattern?

                // Actually, the `FeatureAIAssistant` is just a UI wrapper. 
                // The REAL power should be in how `generateChat` behaves.
                // If `generateChat` is just "chat", it won't call tools.

                // I'll stick to a simpler refactor for this step:
                // Use `generateChat` with the full context and system prompt.
                // AND checking if the output contains a TOOL call pattern that I will inject into the system prompt in a future step (or now).

                // For this specific error (mangled title), just removing the manual logic and using `generateChat` 
                // will at least fix the garbled text, because the LLM will generate a normal response. 
                // But it won't execute the tool yet unless I parse it.

                // I'll parse for "Tool: toolName(args)" pattern which is common in ReAct prompts.

                // NOTE: To fix the immediate "garbled title" issue, I MUST remove the manual `replace(...)` calls.

                setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: "Thinking..." } : m));

                // Add tool instructions to system prompt if not present
                const toolsInstruction = `
To call a tool, respond with a JSON block:
\`\`\`json
{
  "tool": "toolName",
  "params": { ... }
}
\`\`\`
`;
                const fullSystemPrompt = systemPrompt + toolsInstruction;

                const text = await generateChat(history, fullSystemPrompt);

                if (!text) throw new Error("Empty response");

                // Parse for tool call
                const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
                if (jsonMatch) {
                    try {
                        const command = JSON.parse(jsonMatch[1]);
                        if (command.tool && command.params) {
                            activeTool = command.tool;
                            setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `Executing ${command.tool}...` } : m));

                            const result = await executeTool(featureId === "documents" ? "document-agent" : "unknown", command.tool, command.params);

                            if (result.success) {
                                finalResponse = result.message || "Done.";
                                if (result.data && typeof result.data === 'object' && result.data.documentId) {
                                    // Special handling for createDocument to show link/content
                                    if (command.tool === 'createDocument') {
                                        finalResponse = `✅ Created **${command.params.title}**.\n\n${result.message}`;
                                    }
                                }
                            } else {
                                finalResponse = `❌ Error: ${result.error}`;
                            }
                        }
                    } catch (e) {
                        console.error("Failed to parse tool JSON", e);
                        // Fallback to text
                        finalResponse = text;
                    }
                } else {
                    finalResponse = text;
                }

                // Update UI
                setMessages((prev) => [
                    ...prev.filter((m) => m.id !== loadingId),
                    {
                        id: `assistant-${Date.now()}`,
                        role: "assistant",
                        content: finalResponse,
                        timestamp: new Date(),
                        toolUsed: activeTool,
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== loadingId),
                {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content: `❌ Sorry, something went wrong. Please try again.`,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsProcessing(false);
        }
    }, [input, isProcessing, agent, featureId, executeTool, formatResult, generateText, generateChat, context]);

    const inputPlaceholder = placeholder || `Ask about ${featureId}...`;

    // Dummy suggestion handler
    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            <GrokChatContainer>
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6 min-h-[300px]">
                        <div className="p-3 rounded-full bg-primary/10 mb-3">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            Ask me anything about your {featureId}!
                        </p>
                        {agent && (
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p className="font-medium">I can help with:</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {agent.tools.slice(0, 4).map((tool) => (
                                        <div
                                            key={tool.name}
                                            className="px-2 py-1 rounded bg-muted text-xs border"
                                        >
                                            {tool.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            if (message.role === "user") {
                                return (
                                    <GrokUserMessage key={message.id}>
                                        {message.content}
                                    </GrokUserMessage>
                                );
                            } else {
                                if (message.isLoading) {
                                    return <GrokTypingIndicator key={message.id} />;
                                }
                                return (
                                    <GrokAIMessage
                                        key={message.id}
                                        onRegenerate={() => { }}
                                        onShare={() => {
                                            navigator.clipboard.writeText(message.content);
                                        }}
                                        feedback={undefined}
                                    >
                                        {message.content}
                                        {message.toolUsed && (
                                            <div className="mt-2 text-xs text-muted-foreground border-t pt-2 max-w-[200px]">
                                                Tool: <span className="font-mono">{message.toolUsed}</span>
                                            </div>
                                        )}
                                    </GrokAIMessage>
                                );
                            }
                        })}
                    </>
                )}
            </GrokChatContainer>

            <GrokInput
                value={input}
                onChange={setInput}
                onSubmit={handleSend}
                placeholder={inputPlaceholder}
                disabled={isProcessing}
                attachments={attachments}
                onAttach={(files) => setAttachments(prev => [...prev, ...Array.from(files)])}
                onRemoveAttachment={(index) => setAttachments(prev => prev.filter((_, i) => i !== index))}
                model={agent?.name || "AI"}
            />
        </div>
    );
}

export default AIChatPanel;
