/**
 * Feature AI Assistant Button
 * 
 * A button that opens an AI assistant panel for the current feature.
 * Can be added to any feature header to provide AI-powered assistance.
 */

"use client";

import * as React from "react";
import { Bot, Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { subAgentRegistry } from "@/frontend/features/ai/agents";
import { AIChatPanel } from "./AIChatPanel";

// ============================================================================
// Types
// ============================================================================

export interface FeatureAIAssistantProps {
    /** Feature ID to filter agents (e.g., 'documents', 'tasks') */
    featureId: string;
    /** Custom title for the assistant */
    title?: string;
    /** Custom description */
    description?: string;
    /** Placeholder text for input */
    placeholder?: string;
    /** Button variant */
    buttonVariant?: "default" | "outline" | "ghost" | "secondary";
    /** Button size */
    buttonSize?: "default" | "sm" | "lg" | "icon";
    /** Show button label */
    showLabel?: boolean;
    /** Custom className for button */
    className?: string;
    /** Side of the sheet */
    side?: "left" | "right" | "top" | "bottom";
    /** Output context (e.g. selected document) */
    context?: any;
}

// ============================================================================
// Component
// ============================================================================

export function FeatureAIAssistant({
    featureId,
    title,
    description,
    placeholder,
    buttonVariant = "ghost",
    buttonSize = "icon",
    showLabel = false,
    className,
    side = "right",
    context
}: FeatureAIAssistantProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const isMobile = useIsMobile();

    // Get the agent for this feature
    const agent = React.useMemo(() => {
        const agents = subAgentRegistry.getAllAgents();
        return agents.find((a) => a.featureId === featureId);
    }, [featureId]);

    const agentTitle = title || agent?.name || "AI Assistant";
    const agentDescription = description || agent?.description || `Get AI help for ${featureId}`;

    // Shared button component
    const TriggerButton = (
        <Button
            variant={buttonVariant}
            size={buttonSize}
            className={cn("gap-2", className)}
        >
            <Bot className="h-4 w-4" />
            {showLabel && <span>AI</span>}
        </Button>
    );

    // Shared content for both Dialog and Drawer
    const AIContent = (
        <>
            <div className="px-4 py-3 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-base font-semibold">{agentTitle}</div>
                        <div className="text-xs text-muted-foreground">
                            {agentDescription}
                        </div>
                    </div>
                    {agent && (
                        <Badge variant="secondary" className="text-xs">
                            {agent.tools.length} tools
                        </Badge>
                    )}
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <AIChatPanel
                    featureId={featureId}
                    placeholder={placeholder}
                    context={context}
                    className="h-full border-0"
                />
            </div>
        </>
    );

    // Mobile: Use Drawer
    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DrawerTrigger asChild>
                                {TriggerButton}
                            </DrawerTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Open AI Assistant</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <DrawerContent className="h-[85vh] flex flex-col p-0 gap-0">
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>{agentTitle}</DrawerTitle>
                        <DrawerDescription>{agentDescription}</DrawerDescription>
                    </DrawerHeader>
                    {AIContent}
                </DrawerContent>
            </Drawer>
        );
    }

    // Desktop: Use Dialog
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            {TriggerButton}
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Open AI Assistant</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{agentTitle}</DialogTitle>
                    <DialogDescription>{agentDescription}</DialogDescription>
                </DialogHeader>
                {AIContent}
            </DialogContent>
        </Dialog>
    );
}

export default FeatureAIAssistant;
