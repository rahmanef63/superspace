import type { ReactNode } from "react";
import type { TabType } from "../../types";
import type { NavigationItem } from "./constants";

export interface WhatsAppSidebarHeaderProps {
  collapsed: boolean;
  isMobile: boolean;
  showBackButton: boolean;
  onBackClick: () => void;
  onToggleSidebar: () => void;
}

export interface NavigationGroupProps {
  title?: string;
  items: NavigationItem[];
  collapsed: boolean;
  activeTab: TabType;
  onNavigate: (tabId: TabType) => void;
  specialItems?: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly icon: React.ComponentType<{ className?: string }>;
  }>;
}

export interface NavigationMenuItemProps {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
  onNavigate: (tabId: TabType) => void;
}

export interface WhatsAppNavigationHook {
  activeTab: TabType;
  settingsOpen: boolean;
  profileOpen: boolean;
  showBackButton: boolean;
  handleNavigation: (tabId: TabType) => void;
  handleBackClick: () => void;
  setSettingsOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  getItemClasses: (itemId: TabType) => string;
}
