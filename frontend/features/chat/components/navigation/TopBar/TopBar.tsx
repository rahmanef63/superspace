import { useState, useCallback } from "react";
import { TopBarHeader } from "./TopBarHeader";
import { TopBarActions } from "./TopBarActions";
import { MemberInfoDrawer } from "@/frontend/shared/communications";
import { useMemberInfo } from "@/frontend/features/chat/shared/hooks";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import type { Id } from "@/convex/_generated/dataModel";

interface MemberSummary {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  phoneNumber?: string;
  about?: string;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  showSearch?: boolean;
  showActions?: boolean;
  onMenuClick?: () => void;
  contact?: MemberSummary;
  /** For desktop: callback to toggle right panel instead of opening drawer */
  onToggleContactPanel?: () => void;
  /** Whether to use drawer (mobile) or external toggle (desktop with three-column layout) */
  useExternalPanel?: boolean;
}

export function TopBar({
  title,
  subtitle,
  avatar,
  showSearch = true,
  showActions = true,
  onMenuClick,
  contact,
  onToggleContactPanel,
  useExternalPanel = false,
}: TopBarProps) {
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const hasMember = Boolean(contact);
  const { workspaceId } = useWorkspaceContext();
  
  // Use member info hook for actions and state
  const memberInfo = useMemberInfo(contact?.id);
  const { 
    isFavorite, 
    isBlocked, 
    addToFavorites, 
    removeFromFavorites, 
    blockMember, 
    unblockMember,
    reportMember 
  } = memberInfo;

  // Wrap action callbacks to provide required arguments
  const handleAddToFavorites = useCallback(() => {
    if (contact?.id && workspaceId) {
      addToFavorites(contact.id, workspaceId as Id<"workspaces">);
    }
  }, [contact?.id, workspaceId, addToFavorites]);

  const handleRemoveFromFavorites = useCallback(() => {
    if (contact?.id && workspaceId) {
      removeFromFavorites(contact.id, workspaceId as Id<"workspaces">);
    }
  }, [contact?.id, workspaceId, removeFromFavorites]);

  const handleBlock = useCallback(() => {
    if (contact?.id) {
      blockMember(contact.id);
    }
  }, [contact?.id, blockMember]);

  const handleUnblock = useCallback(() => {
    if (contact?.id) {
      unblockMember(contact.id);
    }
  }, [contact?.id, unblockMember]);

  const handleReport = useCallback(() => {
    if (contact?.id) {
      reportMember(contact.id, "Reported from chat header");
    }
  }, [contact?.id, reportMember]);

  const handleMemberInfoClick = () => {
    if (!hasMember) return;
    // If using external panel (desktop three-column), call the toggle callback
    if (useExternalPanel && onToggleContactPanel) {
      onToggleContactPanel();
    } else {
      // Otherwise use internal drawer (mobile)
      setIsMemberInfoOpen(true);
    }
  };

  return (
    <>
      <div className="flex min-h-[60px] items-center justify-between border-b border-border bg-background px-4 py-3 md:min-h-[64px]">
        <TopBarHeader
          title={title}
          subtitle={subtitle}
          avatar={avatar ?? contact?.avatar}
          onMenuClick={onMenuClick}
          onMemberClick={hasMember ? handleMemberInfoClick : undefined}
        />

        {showActions && (
          <TopBarActions
            showSearch={showSearch}
            onMemberInfoClick={hasMember ? handleMemberInfoClick : undefined}
          />
        )}
      </div>

      {/* Only render internal drawer when NOT using external panel */}
      {contact && !useExternalPanel && (
        <MemberInfoDrawer
          contact={contact}
          isOpen={isMemberInfoOpen}
          onClose={() => setIsMemberInfoOpen(false)}
          onBack={() => setIsMemberInfoOpen(false)}
          side="right"
          isFavorite={isFavorite}
          isBlocked={isBlocked}
          onAddToFavorites={handleAddToFavorites}
          onRemoveFromFavorites={handleRemoveFromFavorites}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onReport={handleReport}
        />
      )}
    </>
  );
}
