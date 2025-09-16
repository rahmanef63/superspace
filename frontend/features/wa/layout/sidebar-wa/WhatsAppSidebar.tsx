import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

import { SettingsPopup } from "../../components/settings/SettingsPopup";
import { useWhatsAppNavigation } from "./hooks/useWhatsAppNavigation";
import { WhatsAppSidebarHeader } from "./components/WhatsAppSidebarHeader";
import { WhatsAppSidebarContent } from "./components/WhatsAppSidebarContent";

export function WhatsAppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";
  
  const {
    activeTab,
    settingsOpen,
    profileOpen,
    showBackButton,
    handleNavigation,
    handleBackClick,
    setSettingsOpen,
    setProfileOpen,
  } = useWhatsAppNavigation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
    >
      {/* Sidebar Header with Logo/Title and Navigation */}
      <WhatsAppSidebarHeader
        collapsed={collapsed}
        isMobile={isMobile}
        showBackButton={showBackButton}
        onBackClick={handleBackClick}
        onToggleSidebar={toggleSidebar}
      />

      {/* Sidebar Content */}
      <WhatsAppSidebarContent
        collapsed={collapsed}
        activeTab={activeTab}
        onNavigate={handleNavigation}
      />
      
      {/* Settings Popup */}
      <SettingsPopup 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen}
        defaultCategory="general"
      />
      
      {/* Profile Popup */}
      <SettingsPopup 
        open={profileOpen} 
        onOpenChange={setProfileOpen}
        defaultCategory="account"
      />
    </Sidebar>
  );
}
