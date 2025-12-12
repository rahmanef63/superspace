"use client";

import { useMemo, useState } from "react";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { MemberInfoPanel, MemberInfoDrawer, useMemberInfo } from "@/frontend/shared/communications";
import type { MemberInfoContact } from "@/frontend/shared/communications";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Id } from "@/convex/_generated/dataModel";

interface ContactsLayoutProps {
    children: React.ReactNode;
    selectedContact: MemberInfoContact | null;
    onCloseInspector: () => void;
    workspaceId: Id<"workspaces"> | null;
}

export function ContactsLayout({
    children,
    selectedContact,
    onCloseInspector,
    workspaceId,
}: ContactsLayoutProps) {
    const isMobile = useIsMobile();

    // Right panel state derived from selection
    // If selectedContact is present, panel should be open.
    // But ThreeColumnLayout manages state too.
    // We'll control it.
    const rightCollapsed = !selectedContact;

    // Member info hook to fetch full profile details
    const memberInfo = useMemberInfo(selectedContact?.id, undefined);

    // Mobile drawer state
    // If we have a selected contact on mobile, we show the drawer?
    // Or navigate? Standard pattern for mobile might be navigation.
    // But ChatsView uses Drawer for member info on mobile too (when in detail view).
    // Here we are in List view. Drawer is good overlay.
    const showMobileDrawer = isMobile && !!selectedContact;

    const handleClose = () => {
        onCloseInspector();
    };

    const rightPanelContent = (
        <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-hidden">
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
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <>
                {children}
                {selectedContact && (
                    <MemberInfoDrawer
                        contact={selectedContact}
                        profile={memberInfo.profile}
                        sharedMedia={memberInfo.sharedMedia}
                        sharedFiles={memberInfo.sharedFiles}
                        sharedLinks={memberInfo.sharedLinks}
                        commonGroups={memberInfo.commonGroups}
                        loading={memberInfo.loading}
                        isOpen={showMobileDrawer}
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
            </>
        );
    }

    // Desktop Layout
    // We use ThreeColumnLayoutAdvanced but effectively disable Left column.
    // We set left={null}, defaultLeftCollapsed={true}, collapsedWidth={0} if allowed,
    // or wrap nicely.

    // Note: ThreeColumnLayout renders border if not collapsed.
    // If we force leftCollapsed=true and collapsedWidth=0, it might work seamlessly.

    return (
        <div className="h-full flex flex-col">
            <ThreeColumnLayoutAdvanced
                preset="feature"
                leftHidden
                center={children}
                right={rightPanelContent}

                // Labels
                centerLabel="Contacts"
                rightLabel="Contact Info"
                rightCollapsed={rightCollapsed}
                onRightCollapsedChange={(collapsed) => {
                    if (collapsed) onCloseInspector();
                }}
            />
        </div>
    );
}
