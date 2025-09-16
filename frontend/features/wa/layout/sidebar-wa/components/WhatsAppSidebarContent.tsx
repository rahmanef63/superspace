import { SidebarContent } from "@/components/ui/sidebar";
import { NavigationGroup } from "./NavigationGroup";
import { MAIN_ITEMS, CHAT_ITEMS, ACCOUNT_ITEMS, SPECIAL_ITEMS } from "../constants";
import type { TabType } from "../../../types";

interface WhatsAppSidebarContentProps {
  collapsed: boolean;
  activeTab: TabType;
  onNavigate: (tabId: TabType) => void;
}

export function WhatsAppSidebarContent({
  collapsed,
  activeTab,
  onNavigate,
}: WhatsAppSidebarContentProps) {
  return (
    <SidebarContent className="flex flex-col">
      {/* Main Navigation */}
      <NavigationGroup
        title="Main"
        items={MAIN_ITEMS}
        collapsed={collapsed}
        activeTab={activeTab}
        onNavigate={onNavigate}
      />

      {/* Chat Management */}
      <NavigationGroup
        title="Chat Management"
        items={CHAT_ITEMS}
        collapsed={collapsed}
        activeTab={activeTab}
        onNavigate={onNavigate}
        specialItems={SPECIAL_ITEMS}
      />

      {/* Account & Settings */}
      <NavigationGroup
        title="Account"
        items={ACCOUNT_ITEMS}
        collapsed={collapsed}
        activeTab={activeTab}
        onNavigate={onNavigate}
      />
    </SidebarContent>
  );
}
