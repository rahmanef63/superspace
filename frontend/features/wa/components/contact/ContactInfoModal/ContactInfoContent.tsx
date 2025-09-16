import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionType } from "./types";
import { OverviewSection } from "./sections/OverviewSection";
import { MediaSection } from "./sections/MediaSection";
import { FilesSection } from "./sections/FilesSection";
import { LinksSection } from "./sections/LinksSection";
import { EventsSection } from "./sections/EventsSection";
import { EncryptionSection } from "./sections/EncryptionSection";
import { GroupsSection } from "./sections/GroupsSection";

interface ContactInfoContentProps {
  activeSection: SectionType;
  contact: any;
  isMobile: boolean;
}

export function ContactInfoContent({ 
  activeSection, 
  contact, 
  isMobile 
}: ContactInfoContentProps) {
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection contact={contact} isMobile={isMobile} />;
      case 'media':
        return <MediaSection isMobile={isMobile} />;
      case 'files':
        return <FilesSection isMobile={isMobile} />;
      case 'links':
        return <LinksSection isMobile={isMobile} />;
      case 'events':
        return <EventsSection isMobile={isMobile} />;
      case 'encryption':
        return <EncryptionSection isMobile={isMobile} />;
      case 'groups':
        return <GroupsSection isMobile={isMobile} />;
      default:
        return <OverviewSection contact={contact} isMobile={isMobile} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-3 md:p-4 border-b border-wa-border bg-wa-surface">
        <h3 className="text-lg md:text-xl font-semibold text-wa-text capitalize">
          {activeSection}
        </h3>
      </div>
      
      <ScrollArea className="flex-1 wa-scrollbar">
        <div className={`bg-background ${isMobile ? 'p-4' : 'p-6'}`}>
          {renderSectionContent()}
        </div>
      </ScrollArea>
    </div>
  );
}
