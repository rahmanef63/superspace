/**
 * Document Right Panel
 * 
 * A dual-mode right panel that switches between:
 * - Inspector: Document details, metadata, tags
 * - AI Chat: Document-related AI assistance
 */

"use client";

import { lazy, Suspense, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { Bot, Info, X, Sparkles } from "lucide-react";
import { ContainerHeader } from "@/frontend/shared/ui/layout/header";
import { AIChatPanel } from "@/frontend/shared/ui/ai-assistant";
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
    mode?: "inspector" | "ai";
    /** Callback when mode changes */
    onModeChange?: (mode: "inspector" | "ai") => void;
}

type PanelMode = "inspector" | "ai";

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

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Panel Header with Mode Toggle */}
            <div className="flex-shrink-0 border-b bg-muted/30">
                <ContainerHeader
                    title={mode === "inspector" ? "Inspector" : "AI Assistant"}
                    subtitle={
                        mode === "inspector"
                            ? selectedDocument
                                ? "Document Details"
                                : "Select a document"
                            : "Ask about documents"
                    }
                    icon={mode === "inspector" ? Info : Sparkles}
                    actions={
                        <div className="flex items-center gap-1">
                            {/* Mode Toggle */}
                            <div className="flex border rounded-md">
                                <Toggle
                                    pressed={mode === "inspector"}
                                    onPressedChange={() => handleModeChange("inspector")}
                                    size="sm"
                                    className="rounded-r-none h-7 w-7 p-0"
                                    aria-label="Inspector mode"
                                >
                                    <Info className="h-3.5 w-3.5" />
                                </Toggle>
                                <Toggle
                                    pressed={mode === "ai"}
                                    onPressedChange={() => handleModeChange("ai")}
                                    size="sm"
                                    className="rounded-l-none h-7 w-7 p-0"
                                    aria-label="AI Assistant mode"
                                >
                                    <Bot className="h-3.5 w-3.5" />
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
                ) : (
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
