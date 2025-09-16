import { MessageCircle, Phone, Camera, Bot, Lock, Star, Archive, Settings, User } from "lucide-react";
import type { TabType } from "../../types";

export interface NavigationItem {
  id: TabType;
  title: string;
  icon: typeof MessageCircle;
  badge?: number;
}

// Main navigation items (primary features)
export const MAIN_ITEMS: NavigationItem[] = [
  { id: "chats" as TabType, title: "Chats", icon: MessageCircle },
  { id: "calls" as TabType, title: "Calls", icon: Phone },
  { id: "status" as TabType, title: "Status", icon: Camera },
  { id: "ai" as TabType, title: "Meta AI", icon: Bot },
];

// Chat management items
export const CHAT_ITEMS: NavigationItem[] = [
  { id: "starred" as TabType, title: "Starred messages", icon: Star },
  { id: "archived" as TabType, title: "Archived chats", icon: Archive },
];

// Account items (bottom section)
export const ACCOUNT_ITEMS: NavigationItem[] = [
  { id: "settings" as TabType, title: "Settings", icon: Settings },
  { id: "profile" as TabType, title: "Profile", icon: User },
];

// Special items that don't follow the normal navigation pattern
export const SPECIAL_ITEMS = [
  { id: "locked", title: "Locked chats", icon: Lock },
] as const;
