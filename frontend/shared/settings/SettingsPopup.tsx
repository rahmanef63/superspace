import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsSidebar } from "./SettingsSidebar";
import { ChatSettings } from "@/frontend/features/chat/settings";

import { GeneralSettings } from "./general";
import { AccountSettings } from "./account";
import { VideoVoiceSettings } from "./video-voice";
import { NotificationSettings } from "./notifications";
import { PersonalizationSettings } from "./personalization";
import { StorageSettings } from "./storage";
import { ShortcutsSettings } from "./shortcuts";
import { HelpSettings } from "./help";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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

interface SettingsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
}

export function SettingsPopup({ open, onOpenChange, defaultCategory = 'general' }: SettingsPopupProps) {
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full overflow-hidden">
          {/* Settings Sidebar */}
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
                  ← Back to Settings
                </Button>
              </div>
            )}
            <ActiveComponent />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
