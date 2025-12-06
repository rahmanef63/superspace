import { ScrollArea } from "@/components/ui/scroll-area";
import type { MemberInfoContact, MemberInfoSection } from "./types";
import {
  OverviewSection,
  MediaSection,
  FilesSection,
  LinksSection,
  EventsSection,
  EncryptionSection,
  GroupsSection,
} from "./sections";

export type MemberInfoContentProps = {
  activeSection: MemberInfoSection;
  contact: MemberInfoContact;
  isMobile: boolean;
  /** Member action callbacks */
  isFavorite?: boolean;
  isBlocked?: boolean;
  onAddToFavorites?: () => void;
  onRemoveFromFavorites?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  onReport?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
};

export function MemberInfoContent({
  activeSection,
  contact,
  isMobile,
  isFavorite,
  isBlocked,
  onAddToFavorites,
  onRemoveFromFavorites,
  onBlock,
  onUnblock,
  onReport,
  onVideoCall,
  onVoiceCall,
}: MemberInfoContentProps) {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection 
            contact={contact} 
            isMobile={isMobile}
            isFavorite={isFavorite}
            isBlocked={isBlocked}
            onAddToFavorites={onAddToFavorites}
            onRemoveFromFavorites={onRemoveFromFavorites}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onReport={onReport}
            onVideoCall={onVideoCall}
            onVoiceCall={onVoiceCall}
          />
        );
      case "media":
        return <MediaSection isMobile={isMobile} />;
      case "files":
        return <FilesSection isMobile={isMobile} />;
      case "links":
        return <LinksSection isMobile={isMobile} />;
      case "events":
        return <EventsSection isMobile={isMobile} />;
      case "encryption":
        return <EncryptionSection isMobile={isMobile} />;
      case "groups":
        return <GroupsSection isMobile={isMobile} />;
      default:
        return (
          <OverviewSection 
            contact={contact} 
            isMobile={isMobile}
            isFavorite={isFavorite}
            isBlocked={isBlocked}
            onAddToFavorites={onAddToFavorites}
            onRemoveFromFavorites={onRemoveFromFavorites}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onReport={onReport}
            onVideoCall={onVideoCall}
            onVoiceCall={onVoiceCall}
          />
        );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-muted/30 p-3 md:p-4">
        <h3 className="text-lg font-semibold capitalize text-foreground md:text-xl">
          {activeSection}
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className={`bg-background ${isMobile ? "p-4" : "p-6"}`}>
          {renderSection()}
        </div>
      </ScrollArea>
    </div>
  );
}
