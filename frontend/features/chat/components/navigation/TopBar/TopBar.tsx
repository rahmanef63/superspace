import { useState } from "react";
import { TopBarHeader } from "./TopBarHeader";
import { TopBarActions } from "./TopBarActions";
import { MemberInfoDrawer } from "@/frontend/shared/communications";
import { useMemberInfo } from "@/frontend/features/chat/shared/hooks";

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
}

export function TopBar({
  title,
  subtitle,
  avatar,
  showSearch = true,
  showActions = true,
  onMenuClick,
  contact,
}: TopBarProps) {
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const hasMember = Boolean(contact);
  
  // Use member info hook for actions and state
  const memberInfo = useMemberInfo(contact?.id ?? "");
  const { 
    isFavorite, 
    isBlocked, 
    addToFavorites, 
    removeFromFavorites, 
    blockMember, 
    unblockMember,
    reportMember 
  } = memberInfo;

  const handleMemberInfoClick = () => {
    if (!hasMember) return;
    setIsMemberInfoOpen(true);
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

      {contact && (
        <MemberInfoDrawer
          contact={contact}
          isOpen={isMemberInfoOpen}
          onClose={() => setIsMemberInfoOpen(false)}
          onBack={() => setIsMemberInfoOpen(false)}
          side="right"
          isFavorite={isFavorite}
          isBlocked={isBlocked}
          onAddToFavorites={addToFavorites}
          onRemoveFromFavorites={removeFromFavorites}
          onBlock={blockMember}
          onUnblock={unblockMember}
          onReport={reportMember}
        />
      )}
    </>
  );
}
