"use client";

import { useState, useMemo, useCallback } from "react";
import { useWhatsAppStore } from "../../shared/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatListView } from "./ChatListView";
import { ChatDetailView } from "./ChatDetailView";
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container";
import { ChatSkeleton } from "@/frontend/shared/ui/components/loading";
import { MemberInfoPanel, MemberInfoDrawer } from "@/frontend/shared/communications";
import type { MemberInfoContact } from "@/frontend/shared/communications";
import { useMemberInfo } from "../../shared/hooks";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";

export function ChatsView() {
  // Use individual selectors to prevent unnecessary re-renders
  const selectedChatId = useWhatsAppStore((s) => s.selectedChatId);
  const isLoading = useWhatsAppStore((s) => s.isLoading);
  const chats = useWhatsAppStore((s) => s.chats);
  const isMobile = useIsMobile();
  
  // Get selected chat and derive contact from Chat data
  const selectedChat = chats.find(c => c.id === selectedChatId);
  
  // Create contact from Chat data (Chat doesn't have a contact property)
  const contact = useMemo<MemberInfoContact | null>(() => {
    if (!selectedChat) return null;
    return {
      id: selectedChat.id,
      name: selectedChat.name,
      avatar: selectedChat.avatar,
      isOnline: false, // Chat doesn't track online status directly
      lastSeen: selectedChat.timestamp,
      about: selectedChat.description,
    };
  }, [selectedChat]);
  
  // Panel collapse states
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(!selectedChatId);
  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Member info hook
  const memberInfo = useMemberInfo(contact?.id);
  
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
              isOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              onBack={() => setMobileDrawerOpen(false)}
              side="right"
              isFavorite={memberInfo.isFavorite}
              isBlocked={memberInfo.isBlocked}
              onAddToFavorites={() => memberInfo.addToFavorites(contact.id, "" as any)}
              onRemoveFromFavorites={() => memberInfo.removeFromFavorites(contact.id, "" as any)}
              onBlock={() => memberInfo.blockMember(contact.id)}
              onUnblock={() => memberInfo.unblockMember(contact.id)}
              onReport={() => memberInfo.reportMember(contact.id, "spam")}
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
          onClose={() => setRightPanelCollapsed(true)}
          isFavorite={memberInfo.isFavorite}
          isBlocked={memberInfo.isBlocked}
          onAddToFavorites={() => contact && memberInfo.addToFavorites(contact.id, "" as any)}
          onRemoveFromFavorites={() => contact && memberInfo.removeFromFavorites(contact.id, "" as any)}
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
        // Responsive
        collapseLeftAt={768}
        collapseRightAt={1024}
        stackAt={640}
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
