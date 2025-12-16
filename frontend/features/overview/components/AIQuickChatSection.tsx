/**
 * AI Quick Chat Section
 * 
 * Provides a quick AI chat interface on the Overview dashboard
 * for quick questions and workspace assistance.
 */

"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Sparkles,
    Send,
    Loader2,
    MessageSquare,
    Lightbulb,
    Calendar,
    CheckSquare,
    FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface QuickPrompt {
    id: string
    label: string
    prompt: string
    icon?: React.ReactNode
}

export interface AIQuickChatSectionProps {
    /** Handler for sending messages */
    onSendMessage?: (message: string) => void
    /** Handler for clicking a quick prompt */
    onQuickPrompt?: (prompt: QuickPrompt) => void
    /** Current AI response (if any) */
    response?: string
    /** Loading state */
    isLoading?: boolean
    /** Section title */
    title?: string
    /** Section description */
    description?: string
    /** Custom quick prompts */
    quickPrompts?: QuickPrompt[]
    /** Additional className */
    className?: string
    /** Compact mode for sidebars */
    compact?: boolean
}

// ============================================================================
// Default Quick Prompts
// ============================================================================

const DEFAULT_QUICK_PROMPTS: QuickPrompt[] = [
    {
        id: "summarize",
        label: "Summarize my day",
        prompt: "What do I have scheduled today and what tasks need attention?",
        icon: <Lightbulb className="h-3 w-3" />,
    },
    {
        id: "tasks",
        label: "Pending tasks",
        prompt: "Show me my pending tasks that need attention",
        icon: <CheckSquare className="h-3 w-3" />,
    },
    {
        id: "upcoming",
        label: "This week",
        prompt: "What's coming up this week?",
        icon: <Calendar className="h-3 w-3" />,
    },
    {
        id: "recent",
        label: "Recent updates",
        prompt: "What happened in the workspace recently?",
        icon: <FileText className="h-3 w-3" />,
    },
]

// ============================================================================
// AI Quick Chat Section
// ============================================================================

export function AIQuickChatSection({
    onSendMessage,
    onQuickPrompt,
    response,
    isLoading = false,
    title = "AI Assistant",
    description = "Ask me anything about your workspace",
    quickPrompts = DEFAULT_QUICK_PROMPTS,
    className,
    compact = false,
}: AIQuickChatSectionProps) {
    const [inputValue, setInputValue] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() && onSendMessage) {
            onSendMessage(inputValue.trim())
            setInputValue("")
        }
    }

    const handleQuickPromptClick = (prompt: QuickPrompt) => {
        if (onQuickPrompt) {
            onQuickPrompt(prompt)
        } else if (onSendMessage) {
            onSendMessage(prompt.prompt)
        }
        setInputValue("")
    }

    const handleOpenFullChat = () => {
        // Dispatch event to open AI chat panel
        window.dispatchEvent(
            new CustomEvent("open-ai-chat", {
                detail: { feature: "overview" }
            })
        )
    }

    return (
        <Card className={cn("relative overflow-hidden", compact && "border-0 shadow-none bg-transparent", className)}>
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

            <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            {title}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenFullChat}
                        className="text-xs"
                    >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Full Chat
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                        <Button
                            key={prompt.id}
                            variant="outline"
                            size="sm"
                            className="h-auto py-1.5 px-3 text-xs"
                            onClick={() => handleQuickPromptClick(prompt)}
                            disabled={isLoading}
                        >
                            {prompt.icon && <span className="mr-1.5">{prompt.icon}</span>}
                            {prompt.label}
                        </Button>
                    ))}
                </div>

                {/* Response Area */}
                {(response || isLoading) && (
                    <div className="p-3 rounded-lg bg-muted/50 min-h-[60px]">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Thinking...
                            </div>
                        ) : (
                            <p className="text-sm">{response}</p>
                        )}
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputValue.trim() || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>

                {/* Capabilities hint */}
                <div className="text-xs text-muted-foreground text-center">
                    <Badge variant="secondary" className="text-[10px] font-normal">
                        Powered by AI
                    </Badge>
                    <span className="ml-2">
                        Can help with tasks, events, documents, and more
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
