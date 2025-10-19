import { useState } from "react";
import { TopBarHeader } from "./TopBarHeader";
import { TopBarActions } from "./TopBarActions";
import { ContactInfoModal } from "../../contact";

interface ContactSummary {
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
  contact?: ContactSummary;
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
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const hasContact = Boolean(contact);

  const handleContactInfoClick = () => {
    if (!hasContact) return;
    setIsContactInfoOpen(true);
  };

  return (
    <>
      <div className="flex min-h-[60px] items-center justify-between border-b border-wa-border bg-wa-surface px-4 py-3 md:min-h-[64px]">
        <TopBarHeader
          title={title}
          subtitle={subtitle}
          avatar={avatar ?? contact?.avatar}
          onMenuClick={onMenuClick}
          onContactClick={hasContact ? handleContactInfoClick : undefined}
        />

        {showActions && (
          <TopBarActions
            showSearch={showSearch}
            onContactInfoClick={hasContact ? handleContactInfoClick : undefined}
            settingsSlug={settingsSlug}
          />
        )}
      </div>

      {contact && (
        <ContactInfoModal
          contact={contact}
          isOpen={isContactInfoOpen}
          onClose={() => setIsContactInfoOpen(false)}
        />
      )}
    </>
  );
}
