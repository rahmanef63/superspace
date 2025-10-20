import { useState } from "react";
import { TopBarHeader } from "./TopBarHeader";
import { TopBarActions } from "./TopBarActions";
import { MemberInfoModal } from "@/frontend/shared/chat/components/member";

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
  settingsSlug?: string;
}

export function TopBar({
  title,
  subtitle,
  avatar,
  showSearch = true,
  showActions = true,
  onMenuClick,
  contact,
  settingsSlug,
}: TopBarProps) {
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const hasMember = Boolean(contact);

  const handleMemberInfoClick = () => {
    if (!hasMember) return;
    setIsMemberInfoOpen(true);
  };

  return (
    <>
      <div className="flex min-h-[60px] items-center justify-between border-b border-wa-border bg-wa-surface px-4 py-3 md:min-h-[64px]">
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
            settingsSlug={settingsSlug}
          />
        )}
      </div>

      {contact && (
        <MemberInfoModal
          contact={contact}
          isOpen={isMemberInfoOpen}
          onClose={() => setIsMemberInfoOpen(false)}
        />
      )}
    </>
  );
}
