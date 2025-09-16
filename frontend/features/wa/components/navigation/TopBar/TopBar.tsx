import { useState } from "react";
import { TopBarHeader } from "./TopBarHeader";
import { TopBarActions } from "./TopBarActions";
import { ContactInfoModal } from "../../contact";

interface TopBarProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  showSearch?: boolean;
  showActions?: boolean;
  onMenuClick?: () => void;
}

export function TopBar({
  title,
  subtitle,
  avatar,
  showSearch = true,
  showActions = true,
  onMenuClick,
}: TopBarProps) {
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  
  // Mock contact data - in real app this would come from props or context
  const contactData = {
    id: "1",
    name: title,
    username: "ZahrahKhalil",
    avatar: avatar,
    phoneNumber: "+62 858-2551-6154",
    about: "Zahrah"
  };

  const handleContactInfoClick = () => {
    setIsContactInfoOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-wa-border bg-wa-surface">
        <TopBarHeader 
          title={title}
          subtitle={subtitle}
          avatar={avatar}
          onMenuClick={onMenuClick}
          onContactClick={handleContactInfoClick}
        />
        
        {showActions && (
          <TopBarActions 
            showSearch={showSearch}
            onContactInfoClick={handleContactInfoClick}
          />
        )}
      </div>

      <ContactInfoModal 
        contact={contactData}
        isOpen={isContactInfoOpen}
        onClose={() => setIsContactInfoOpen(false)}
      />
    </>
  );
}
