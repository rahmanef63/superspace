"use client";

import { useMemo, useState, useCallback } from "react";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { MemberInfoPanel, MemberInfoDrawer, useMemberInfo } from "@/frontend/shared/communications";
import type { MemberInfoContact } from "@/frontend/shared/communications";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Id } from "@/convex/_generated/dataModel";
import { 
    AIAssistantPanelProvider, 
    useAIAssistantPanelSafe,
    AIChatPanel 
} from "@/frontend/shared/ui/ai-assistant";
import { Sparkles, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { subAgentRegistry } from "@/frontend/features/ai/agents";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";

// ============================================================================
// Types
// ============================================================================

type RightPanelMode = "inspector" | "ai";

interface ContactsLayoutProps {
    children: React.ReactNode;
    selectedContact: MemberInfoContact | null;
    onCloseInspector: () => void;
    workspaceId: Id<"workspaces"> | null;
}

// ============================================================================
// Inner Layout Component (uses AI context)
// ============================================================================

function ContactsLayoutInner({
    children,
    selectedContact,
    onCloseInspector,
    workspaceId,
}: ContactsLayoutProps) {
    const isMobile = useIsMobile();
    const panelContext = useAIAssistantPanelSafe();
    
    // Right panel mode: inspector or AI
    const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>("inspector");
    
    // Determine if right panel should be open
    const hasInspectorContent = !!selectedContact;
    const isAIPanelOpen = panelContext?.isPanelOpen ?? false;
    
    // Right panel is open if either inspector has content OR AI panel is requested
    const rightCollapsed = rightPanelMode === "inspector" 
        ? !hasInspectorContent 
        : !isAIPanelOpen;

    // Member info hook to fetch full profile details
    const memberInfo = useMemberInfo(selectedContact?.id, undefined);

    // Mobile drawer state
    const showMobileDrawer = isMobile && !!selectedContact;
    const showMobileAIDrawer = isMobile && isAIPanelOpen;

    const handleClose = () => {
        if (rightPanelMode === "ai") {
            panelContext?.closePanel();
        } else {
            onCloseInspector();
        }
    };
    
    const handleRightCollapsedChange = useCallback((collapsed: boolean) => {
        if (collapsed) {
            if (rightPanelMode === "ai") {
                panelContext?.closePanel();
            } else {
                onCloseInspector();
            }
        }
    }, [rightPanelMode, panelContext, onCloseInspector]);

    // Get AI agent info
    const agent = useMemo(() => {
        const agents = subAgentRegistry.getAllAgents();
        return agents.find((a) => a.featureId === "contact");
    }, []);

    // Sync AI panel state with right panel mode
    useMemo(() => {
        if (isAIPanelOpen && rightPanelMode !== "ai") {
            setRightPanelMode("ai");
        }
    }, [isAIPanelOpen, rightPanelMode]);

    // ========================================================================
    // Right Panel Header with Mode Toggle
    // ========================================================================
    const rightPanelHeader = (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-1">
                <Button
                    variant={rightPanelMode === "inspector" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setRightPanelMode("inspector")}
                    disabled={!hasInspectorContent}
                >
                    <User className="h-3.5 w-3.5 mr-1" />
                    Info
                </Button>
                <Button
                    variant={rightPanelMode === "ai" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                        setRightPanelMode("ai");
                        panelContext?.openPanel();
                    }}
                >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    AI
                </Button>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClose}
            >
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );

    // ========================================================================
    // Inspector Panel Content
    // ========================================================================
    const inspectorContent = (
        <MemberInfoPanel
            contact={selectedContact ?? null}
            profile={memberInfo.profile}
            sharedMedia={memberInfo.sharedMedia}
            sharedFiles={memberInfo.sharedFiles}
            sharedLinks={memberInfo.sharedLinks}
            commonGroups={memberInfo.commonGroups}
            loading={memberInfo.loading}
            onClose={handleClose}
            isFavorite={memberInfo.isFavorite}
            isBlocked={memberInfo.isBlocked}
            onAddToFavorites={() => selectedContact && workspaceId && memberInfo.addToFavorites(selectedContact.id, workspaceId)}
            onRemoveFromFavorites={() => selectedContact && workspaceId && memberInfo.removeFromFavorites(selectedContact.id, workspaceId)}
            onBlock={() => selectedContact && memberInfo.blockMember(selectedContact.id)}
            onUnblock={() => selectedContact && memberInfo.unblockMember(selectedContact.id)}
            onReport={() => selectedContact && memberInfo.reportMember(selectedContact.id, "spam")}
        />
    );

    // ========================================================================
    // AI Panel Content
    // ========================================================================
    const aiPanelContent = (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
                <div className="p-1.5 rounded-md bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                        {agent?.name || "Contacts AI"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {agent?.description || "AI assistant for contacts"}
                    </span>
                </div>
                {agent && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                        {agent.tools.length} tools
                    </Badge>
                )}
            </div>
            <div className="flex-1 min-h-0">
                <AIChatPanel
                    featureId="contact"
                    placeholder="Ask about contacts..."
                    context={{
                        selectedContactId: selectedContact?.id,
                        selectedContactName: selectedContact?.name,
                    }}
                    className="h-full border-0"
                    showDebugPanel={false}
                />
            </div>
        </div>
    );

    // ========================================================================
    // Combined Right Panel
    // ========================================================================
    const rightPanelContent = (
        <div className="flex flex-col h-full">
            {(hasInspectorContent || isAIPanelOpen) && rightPanelHeader}
            <div className="flex-1 min-h-0 overflow-hidden">
                {rightPanelMode === "ai" ? aiPanelContent : inspectorContent}
            </div>
        </div>
    );

    // ========================================================================
    // Mobile Layout
    // ========================================================================
    if (isMobile) {
        return (
            <>
                {children}
                {/* Contact Inspector Drawer */}
                {selectedContact && (
                    <MemberInfoDrawer
                        contact={selectedContact}
                        profile={memberInfo.profile}
                        sharedMedia={memberInfo.sharedMedia}
                        sharedFiles={memberInfo.sharedFiles}
                        sharedLinks={memberInfo.sharedLinks}
                        commonGroups={memberInfo.commonGroups}
                        loading={memberInfo.loading}
                        isOpen={showMobileDrawer && rightPanelMode === "inspector"}
                        onClose={handleClose}
                        onBack={handleClose}
                        side="right"
                        isFavorite={memberInfo.isFavorite}
                        isBlocked={memberInfo.isBlocked}
                        onAddToFavorites={() => selectedContact && workspaceId && memberInfo.addToFavorites(selectedContact.id, workspaceId)}
                        onRemoveFromFavorites={() => selectedContact && workspaceId && memberInfo.removeFromFavorites(selectedContact.id, workspaceId)}
                        onBlock={() => selectedContact && memberInfo.blockMember(selectedContact.id)}
                        onUnblock={() => selectedContact && memberInfo.unblockMember(selectedContact.id)}
                        onReport={() => selectedContact && memberInfo.reportMember(selectedContact.id, "spam")}
                    />
                )}
                {/* AI Drawer */}
                <Drawer open={showMobileAIDrawer} onOpenChange={(open) => !open && panelContext?.closePanel()}>
                    <DrawerContent className="h-[85vh] flex flex-col p-0 gap-0">
                        <DrawerHeader className="sr-only">
                            <DrawerTitle>Contacts AI Assistant</DrawerTitle>
                            <DrawerDescription>Get AI help for contacts</DrawerDescription>
                        </DrawerHeader>
                        {aiPanelContent}
                    </DrawerContent>
                </Drawer>
            </>
        );
    }

    // ========================================================================
    // Desktop Layout
    // ========================================================================
    return (
        <div className="h-full flex flex-col">
            <ThreeColumnLayoutAdvanced
                preset="feature"
                leftHidden
                center={children}
                right={rightPanelContent}
                centerLabel="Contacts"
                rightLabel={rightPanelMode === "ai" ? "AI Assistant" : "Contact Info"}
                rightCollapsed={rightCollapsed}
                onRightCollapsedChange={handleRightCollapsedChange}
                rightWidth={380}
            />
        </div>
    );
}

// ============================================================================
// Main Export with AI Provider
// ============================================================================

export function ContactsLayout(props: ContactsLayoutProps) {
    return (
        <AIAssistantPanelProvider featureId="contact" defaultOpen={false}>
            <ContactsLayoutInner {...props} />
        </AIAssistantPanelProvider>
    );
}
