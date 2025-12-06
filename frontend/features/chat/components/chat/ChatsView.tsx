"use client";

import { useState } from "react";
import { useWhatsAppStore } from "../../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListView } from "./ChatListView";
import { ChatDetailView } from "./ChatDetailView";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { ChatSkeleton } from "@/frontend/shared/ui/components/loading";
import { MemberInfoDrawer } from "@/frontend/shared/communications";
import { useMemberInfo } from "../../shared/hooks";

export function ChatsView() {
  // Use individual selectors to prevent unnecessary re-renders
  const selectedChatId = useWhatsAppStore((s) => s.selectedChatId);
  const isLoading = useWhatsAppStore((s) => s.isLoading);
  const chats = useWhatsAppStore((s) => s.chats);
  const isMobile = useIsMobile();
  
  // Get selected chat for member info
  const selectedChat = chats.find(c => c.id === selectedChatId);
  const contact = selectedChat?.contact;
  
  // Right panel state
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  
  // Member info hook
  const memberInfo = useMemberInfo(contact?.userId || contact?.id);

  // Only show skeleton on initial load (no chats yet)
  // This prevents blocking the UI when refreshing chats
  const showSkeleton = isLoading && chats.length === 0;

  if (showSkeleton) {
    return <ChatSkeleton />;
  }

  if (isMobile) {
    // On mobile, show either chat list or chat detail, not both
    return selectedChatId ? <ChatDetailView /> : <ChatListView />;
  }

  // Right panel content - member info when a chat is selected
  const rightPanelContent = contact ? (
    <MemberInfoDrawer
      contact={contact}
      isOpen={true}
      onClose={() => setRightPanelOpen(false)}
      onBack={() => setRightPanelOpen(false)}
      side="right"
      isFavorite={memberInfo.isFavorite}
      isBlocked={memberInfo.isBlocked}
      onAddToFavorites={() => memberInfo.addToFavorites(contact.userId || contact.id, "" as any)}
      onRemoveFromFavorites={() => memberInfo.removeFromFavorites(contact.userId || contact.id, "" as any)}
      onBlock={() => memberInfo.blockMember(contact.userId || contact.id)}
      onUnblock={() => memberInfo.unblockMember(contact.userId || contact.id)}
      onReport={() => memberInfo.reportMember(contact.userId || contact.id, "spam")}
    />
  ) : null;

  return (
    <div className="h-full flex flex-col">
      <ThreeColumnLayoutAdvanced
        left={<ChatListView variant="layout" />}
        center={<ChatDetailView />}
        right={rightPanelContent}
        // Labels
        leftLabel="Chats"
        centerLabel="Messages"
        rightLabel="Contact Info"
        // Widths
        leftWidth={320}
        rightWidth={380}
        centerMinWidth={400}
        minSideWidth={240}
        maxSideWidth={500}
        collapsedWidth={44}
        // Space distribution
        spaceDistribution="center-priority"
        // Features - enable resize and collapse
        resizable={true}
        showCollapseButtons={true}
        persistState={true}
        storageKey="chat-layout"
        // Responsive
        collapseLeftAt={768}
        collapseRightAt={1024}
        stackAt={640}
        // Default states
        defaultLeftCollapsed={false}
        defaultRightCollapsed={!selectedChatId}
      />
    </div>
  );
}
