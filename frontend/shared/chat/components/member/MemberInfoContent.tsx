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
};

export function MemberInfoContent({
  activeSection,
  contact,
  isMobile,
}: MemberInfoContentProps) {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection contact={contact} isMobile={isMobile} />;
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
        return <OverviewSection contact={contact} isMobile={isMobile} />;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-wa-border bg-wa-surface p-3 md:p-4">
        <h3 className="text-lg font-semibold capitalize text-wa-text md:text-xl">
          {activeSection}
        </h3>
      </div>

      <ScrollArea className="flex-1 wa-scrollbar">
        <div className={`bg-background ${isMobile ? "p-4" : "p-6"}`}>
          {renderSection()}
        </div>
      </ScrollArea>
    </div>
  );
}
