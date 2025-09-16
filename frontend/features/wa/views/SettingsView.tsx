import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SettingsSidebar } from "../components/settings/SettingsSidebar";
import {
  GeneralSettings,
  AccountSettings,
  ChatSettings,
  VideoVoiceSettings,
  NotificationSettings,
  PersonalizationSettings,
  StorageSettings,
  ShortcutsSettings,
  HelpSettings,
} from "../components/settings";

const SETTINGS_COMPONENTS = {
  general: GeneralSettings,
  account: AccountSettings,
  chats: ChatSettings,
  'video-voice': VideoVoiceSettings,
  notifications: NotificationSettings,
  personalization: PersonalizationSettings,
  storage: StorageSettings,
  shortcuts: ShortcutsSettings,
  help: HelpSettings,
} as const;

export function SettingsView() {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();

  const ActiveComponent = SETTINGS_COMPONENTS[activeCategory as keyof typeof SETTINGS_COMPONENTS];

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
  };

  return (
    <div className="flex-1 flex bg-background h-full overflow-hidden">
      {/* Mobile: Show sidebar or content, Desktop: Show both */}
      <SettingsSidebar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        className={cn(
          "transition-all duration-300",
          isMobile ? (
            showSidebar ? "w-full" : "hidden"
          ) : "w-64"
        )}
      />
      
      {/* Settings Content */}
      <div className={cn(
        "flex-1 bg-background overflow-y-auto",
        isMobile && showSidebar && "hidden"
      )}>
        {isMobile && !showSidebar && (
          <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSidebar}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </div>
        )}
        <ActiveComponent />
      </div>
    </div>
  );
}
