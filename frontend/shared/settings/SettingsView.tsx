import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SettingsSidebar } from "./SettingsSidebar";
import {
  SecondarySidebarLayout,
  type SecondarySidebarHeaderProps,
} from "@/frontend/shared/ui/layout/sidebar/secondary";
import {
  GeneralSettings,
  AccountSettings,
  VideoVoiceSettings,
  NotificationSettings,
  PersonalizationSettings,
  StorageSettings,
  ShortcutsSettings,
  HelpSettings,
} from "@/frontend/shared/settings";

const SETTINGS_COMPONENTS = {
  general: GeneralSettings,
  account: AccountSettings,
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

  if (isMobile) {
    return (
      <div className="flex h-full flex-1 overflow-hidden bg-background">
        <SettingsSidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          className={cn(
            "transition-all duration-300",
            showSidebar ? "w-full" : "hidden",
          )}
        />

        <div
          className={cn(
            "flex-1 overflow-y-auto bg-background",
            showSidebar && "hidden",
          )}
        >
          {!showSidebar && (
            <div className="sticky top-0 z-10 border-b border-border bg-background p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSidebar}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settings
              </Button>
            </div>
          )}
          <ActiveComponent />
        </div>
      </div>
    );
  }

  const headerProps: SecondarySidebarHeaderProps = {
    title: "Settings",
    description: "Manage your account, preferences, and workspace defaults.",
    breadcrumbs: (
      <span className="capitalize text-foreground">
        {activeCategory.replace("-", " ")}
      </span>
    ),
  };

  return (
    <SecondarySidebarLayout
      className="h-full bg-background"
      headerProps={headerProps}
      sidebar={
        <SettingsSidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          variant="layout"
        />
      }
      contentClassName="h-full overflow-y-auto bg-background"
    >
      <div className="h-full">
        <ActiveComponent />
      </div>
    </SecondarySidebarLayout>
  );
}
