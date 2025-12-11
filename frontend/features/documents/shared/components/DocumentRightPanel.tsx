/**
 * Document Right Panel
 * 
 * A multi-mode right panel that switches between:
 * - Inspector: Document details, metadata, tags
 * - AI Chat: Document-related AI assistance
 * - Debug: Session info with AI agent tracing
 */

"use client";

import { lazy, Suspense, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { Bot, Info, X, Sparkles, Bug } from "lucide-react";
import { ContainerHeader } from "@/frontend/shared/ui/layout/header";
import { AIChatPanel } from "@/frontend/shared/ui/ai-assistant";
import { ChatHistoryDropdown } from "@/frontend/features/ai/components/ChatHistoryDropdown";
import { SessionInfoTabs } from "@/frontend/shared/ui/components/session-info";
import { cn } from "@/lib/utils";

// Lazy load inspector
const DocumentInspector = lazy(() =>
    import("./DocumentInspector").then((mod) => ({ default: mod.DocumentInspector }))
);

// ============================================================================
// Types
// ============================================================================

export interface DocumentRightPanelProps {
    /** Selected document data */
    selectedDocument?: {
        _id: Id<"documents">;
        title: string;
        isPublic: boolean;
        _creationTime: number;
        lastModified?: number;
        tags?: string[];
        author?: {
            name?: string;
            email?: string;
        };
    } | null;
    /** Whether the panel is mounted */
    isMounted: boolean;
    /** Callback when close is clicked */
    onClose?: () => void;
    /** Callback when tag is added */
    onTagAdd?: (tag: string) => void;
    /** Callback when tag is removed */
    onTagRemove?: (tag: string) => void;
    /** Current mode of the panel */
    mode?: "inspector" | "ai" | "debug";
    /** Callback when mode changes */
    onModeChange?: (mode: "inspector" | "ai" | "debug") => void;
    /** AI Session for debug panel */
    aiSession?: {
        _id: string;
        title: string;
        status: string;
        messages: Array<{
            id?: string;
            role: "user" | "assistant" | "system";
            content: string;
            timestamp: number;
            metadata?: Record<string, any>;
        }>;
        createdAt: number;
        updatedAt: number;
        metadata?: Record<string, any>;
    } | null;
}

type PanelMode = "inspector" | "ai" | "debug";

// ============================================================================
// Component
// ============================================================================

export function DocumentRightPanel({
    selectedDocument,
    isMounted,
    onClose,
    onTagAdd,
    onTagRemove,
    mode: controlledMode,
    onModeChange,
    aiSession,
}: DocumentRightPanelProps) {
    const [internalMode, setInternalMode] = useState<PanelMode>("inspector");

    // Use controlled mode if provided, otherwise internal
    const mode = controlledMode ?? internalMode;

    const handleModeChange = (newMode: PanelMode) => {
        if (onModeChange) {
            onModeChange(newMode);
        } else {
            setInternalMode(newMode);
        }
    };

    // Get panel title and subtitle based on mode
    const getPanelInfo = () => {
        switch (mode) {
            case "inspector":
                return {
                    title: "Inspector",
                    subtitle: selectedDocument ? "Document Details" : "Select a document",
                    icon: Info,
                };
            case "ai":
                return {
                    title: "AI Assistant",
                    subtitle: "Ask about documents",
                    icon: Sparkles,
                };
            case "debug":
                return {
                    title: "Debug",
                    subtitle: "AI Agent Tracing",
                    icon: Bug,
                };
        }
    };

    const panelInfo = getPanelInfo();

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Panel Header with Mode Toggle */}
            <div className="flex-shrink-0 border-b bg-muted/30">
                <ContainerHeader
                    title={panelInfo.title}
                    subtitle={panelInfo.subtitle}
                    icon={panelInfo.icon}
                    actions={
                        <div className="flex items-center gap-1">
                            {/* Chat History - only in AI mode */}
                            {mode === "ai" && (
                                <ChatHistoryDropdown />
                            )}
                            {/* Mode Toggle - 3 buttons */}
                            <div className="flex border rounded-md">
                                <Toggle
                                    pressed={mode === "inspector"}
                                    onPressedChange={() => handleModeChange("inspector")}
                                    size="sm"
                                    className="rounded-r-none h-7 w-7 p-0"
                                    aria-label="Inspector mode"
                                    title="Inspector"
                                >
                                    <Info className="h-3.5 w-3.5" />
                                </Toggle>
                                <Toggle
                                    pressed={mode === "ai"}
                                    onPressedChange={() => handleModeChange("ai")}
                                    size="sm"
                                    className="rounded-none border-x h-7 w-7 p-0"
                                    aria-label="AI Assistant mode"
                                    title="AI Assistant"
                                >
                                    <Bot className="h-3.5 w-3.5" />
                                </Toggle>
                                <Toggle
                                    pressed={mode === "debug"}
                                    onPressedChange={() => handleModeChange("debug")}
                                    size="sm"
                                    className="rounded-l-none h-7 w-7 p-0"
                                    aria-label="Debug mode"
                                    title="Debug / Session Info"
                                >
                                    <Bug className="h-3.5 w-3.5" />
                                </Toggle>
                            </div>
                            {/* Close Button */}
                            {onClose && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={onClose}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    }
                />
            </div>

            {/* Panel Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {mode === "inspector" ? (
                    // Inspector Mode
                    selectedDocument ? (
                        <Suspense fallback={<InspectorSkeleton />}>
                            {isMounted && (
                                <DocumentInspector
                                    document={{
                                        _id: selectedDocument._id,
                                        title: selectedDocument.title,
                                        isPublic: selectedDocument.isPublic,
                                        createdAt: selectedDocument._creationTime,
                                        updatedAt:
                                            selectedDocument.lastModified || selectedDocument._creationTime,
                                        tags: selectedDocument.tags,
                                        owner: selectedDocument.author
                                            ? {
                                                name: selectedDocument.author.name || undefined,
                                                email: undefined,
                                            }
                                            : undefined,
                                    }}
                                    onTagAdd={onTagAdd}
                                    onTagRemove={onTagRemove}
                                    onClose={onClose}
                                    isMobile={false}
                                />
                            )}
                        </Suspense>
                    ) : (
                        <div className="flex h-full items-center justify-center p-6">
                            <div className="text-center">
                                <Info className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Select a document to view details
                                </p>
                            </div>
                        </div>
                    )
                ) : mode === "ai" ? (
                    // AI Chat Mode
                    <AIChatPanel
                        featureId="documents"
                        placeholder="Ask about your documents..."
                        className="h-full"
                        context={{
                            selectedDocumentId: selectedDocument?._id,
                            selectedDocumentTitle: selectedDocument?.title
                        }}
                    />
                ) : (
                    // Debug Mode - Session Info with Tracing
                    <SessionInfoTabs
                        session={aiSession ? {
                            _id: aiSession._id,
                            title: aiSession.title,
                            status: aiSession.status,
                            messages: aiSession.messages,
                            createdAt: aiSession.createdAt,
                            updatedAt: aiSession.updatedAt,
                            metadata: aiSession.metadata,
                        } : null}
                        tabs={["overview", "debug"]}
                        defaultTab="debug"
                        showCloseButton={false}
                        compact={true}
                    />
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Skeleton
// ============================================================================

function InspectorSkeleton() {
    return (
        <div className="h-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="w-8 h-8 rounded" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-5 w-16" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export default DocumentRightPanel;
