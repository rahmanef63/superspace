"use client";

import { useState, useMemo, useCallback } from "react";
import { useWhatsAppStore } from "../../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListView } from "../../sections/left/ChatListView";
import { ChatDetailView } from "../../sections/center/ChatDetailView";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { ChatSkeleton } from "@/frontend/shared/ui/components/loading";
import { MemberInfoPanel, MemberInfoDrawer } from "@/frontend/shared/communications";
import type { MemberInfoContact } from "@/frontend/shared/communications";
import { useMemberInfo } from "../../shared/hooks";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ChatsView() {
  // Use individual selectors to prevent unnecessary re-renders
  const selectedChatId = useWhatsAppStore((s) => s.selectedChatId);
  const isLoading = useWhatsAppStore((s) => s.isLoading);
  const chats = useWhatsAppStore((s) => s.chats);
  const workspaceId = useWhatsAppStore((s) => s.workspaceId);
  const isMobile = useIsMobile();
  const currentUser = useQuery(api.auth.auth.loggedInUser);
  
  // Get selected chat and derive contact from Chat data
  const selectedChat = chats.find(c => c.id === selectedChatId);
  const meId = useMemo(() => String((currentUser as any)?._id || ""), [currentUser]);
  
  // Identify the counterpart member for direct conversations
  const contactMemberId = useMemo(() => {
    if (!selectedChat?.participants || selectedChat.participants.length === 0) return undefined;
    const others = selectedChat.participants.filter((p) => p && p !== meId);
    return others[0];
  }, [selectedChat, meId]);

  // Create contact from Chat data (Chat doesn't have a contact property)
  const contact = useMemo<MemberInfoContact | null>(() => {
    if (!selectedChat || !contactMemberId) return null;
    return {
      id: contactMemberId,
      name: selectedChat.name,
      avatar: selectedChat.avatar,
      isOnline: false, // Chat doesn't track online status directly
      lastSeen: selectedChat.timestamp,
      about: selectedChat.description,
      presenceLabel: selectedChat.timestamp ? `Last active at ${selectedChat.timestamp}` : undefined,
    };
  }, [selectedChat, contactMemberId]);
  
  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(!selectedChatId);
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Member info hook
  const memberInfo = useMemberInfo(contact?.id, selectedChatId ?? undefined);
  
  // Toggle handlers
  const handleToggleLeftPanel = useCallback(() => {
    setLeftPanelCollapsed(prev => !prev);
  }, []);
  
  const handleToggleRightPanel = useCallback(() => {
    setRightPanelCollapsed(prev => !prev);
  }, []);

  // Only show skeleton on initial load (no chats yet)
  // This prevents blocking the UI when refreshing chats
  const showSkeleton = isLoading && chats.length === 0;

  if (showSkeleton) {
    return <ChatSkeleton />;
  }

  // Handler to select chat and auto-expand right panel
  const handleChatSelect = (chatId: string) => {
    useWhatsAppStore.getState().setSelectedChat(chatId);
    setRightPanelCollapsed(false);
  };

  if (isMobile) {
    // On mobile, show either chat list or chat detail, not both
    if (selectedChatId) {
      return (
        <>
          <ChatDetailView />
          
          {/* Mobile: Use Drawer for member info */}
          {contact && (
            <MemberInfoDrawer
              contact={contact}
              profile={memberInfo.profile}
              sharedMedia={memberInfo.sharedMedia}
              sharedFiles={memberInfo.sharedFiles}
              sharedLinks={memberInfo.sharedLinks}
              commonGroups={memberInfo.commonGroups}
              loading={memberInfo.loading}
              isOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              onBack={() => setMobileDrawerOpen(false)}
              side="right"
              isFavorite={memberInfo.isFavorite}
              isBlocked={memberInfo.isBlocked}
              onAddToFavorites={() => contact && workspaceId && memberInfo.addToFavorites(contact.id, workspaceId as any)}
              onRemoveFromFavorites={() => contact && workspaceId && memberInfo.removeFromFavorites(contact.id, workspaceId as any)}
              onBlock={() => contact && memberInfo.blockMember(contact.id)}
              onUnblock={() => contact && memberInfo.unblockMember(contact.id)}
              onReport={() => contact && memberInfo.reportMember(contact.id, "spam")}
            />
          )}
        </>
      );
    }
    return <ChatListView />;
  }

  // Desktop: Right panel content with toggle buttons
  const rightPanelContent = (
    <div className="flex flex-col h-full">
      
      {/* Member info panel content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MemberInfoPanel
          contact={contact ?? null}
          profile={memberInfo.profile}
          sharedMedia={memberInfo.sharedMedia}
          sharedFiles={memberInfo.sharedFiles}
          sharedLinks={memberInfo.sharedLinks}
          commonGroups={memberInfo.commonGroups}
          loading={memberInfo.loading}
          onClose={() => setRightPanelCollapsed(true)}
          isFavorite={memberInfo.isFavorite}
          isBlocked={memberInfo.isBlocked}
          onAddToFavorites={() => contact && workspaceId && memberInfo.addToFavorites(contact.id, workspaceId as any)}
          onRemoveFromFavorites={() => contact && workspaceId && memberInfo.removeFromFavorites(contact.id, workspaceId as any)}
          onBlock={() => contact && memberInfo.blockMember(contact.id)}
          onUnblock={() => contact && memberInfo.unblockMember(contact.id)}
          onReport={() => contact && memberInfo.reportMember(contact.id, "spam")}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <ThreeColumnLayoutAdvanced
        left={<ChatListView variant="layout" />}
        center={
          <ChatDetailView 
            onToggleContactPanel={handleToggleRightPanel}
            useExternalPanel={true}
          />
        }
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
        // Responsive - right panel collapses first, left panel stays visible longer
        collapseRightAt={1024}
        collapseLeftAt={640}
        stackAt={480}
        // Controlled left panel state
        leftCollapsed={leftPanelCollapsed}
        onLeftCollapsedChange={setLeftPanelCollapsed}
        // Controlled right panel state
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />
    </div>
  );
}
