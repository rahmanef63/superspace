import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWhatsAppStore } from "../../../shared/stores";
import type { TabType } from "../../../types";
import type { WhatsAppNavigationHook } from "../types";
import { getNavigationItemClasses } from "../utils";

export function useWhatsAppNavigation(): WhatsAppNavigationHook {
  const { activeTab, setActiveTab } = useWhatsAppStore();
  const isMobile = useIsMobile();
  const [showBackButton, setShowBackButton] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNavigation = (tabId: TabType) => {
    if (tabId === "settings") {
      setSettingsOpen(true);
      return;
    }
    if (tabId === "profile") {
      setProfileOpen(true);
      return;
    }
    
    setActiveTab(tabId);
    // Show back button when navigating to chat detail on mobile
    if (isMobile && tabId === "chats") {
      setShowBackButton(true);
    }
  };

  const handleBackClick = () => {
    setShowBackButton(false);
    // Additional back navigation logic can be added here
  };

  const getItemClasses = (itemId: TabType) => {
    return getNavigationItemClasses(itemId, activeTab);
  };

  return {
    activeTab,
    settingsOpen,
    profileOpen,
    showBackButton,
    handleNavigation,
    handleBackClick,
    setSettingsOpen,
    setProfileOpen,
    getItemClasses,
  };
}
