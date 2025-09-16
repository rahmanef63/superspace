import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./NavigationItem";
import { NAVIGATION_ITEMS } from "./constants";
import { SectionType } from "./types";

interface ContactInfoSidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  isMobile: boolean;
}

export function ContactInfoSidebar({ 
  activeSection, 
  onSectionChange, 
  isMobile 
}: ContactInfoSidebarProps) {
  if (isMobile) {
    return (
      <div className="bg-wa-surface border-b border-wa-border p-2">
        <div className="flex gap-1 overflow-x-auto">
          {NAVIGATION_ITEMS.map((item) => (
            <NavigationItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              isMobile={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-wa-surface border-r border-wa-border flex-shrink-0">
      <ScrollArea className="h-full wa-scrollbar">
        <div className="p-2">
          {NAVIGATION_ITEMS.map((item) => (
            <NavigationItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              isMobile={false}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
