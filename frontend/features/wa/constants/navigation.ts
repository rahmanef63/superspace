import { MessageCircle, Phone, Camera, Bot, Star, Archive, Settings, User, Lock } from "lucide-react"

export const WA_NAVIGATION_ITEMS = [
  {
    id: "chats",
    title: "Chats",
    icon: MessageCircle,
    path: "/wa/chats",
    component: "ChatsPage",
  },
  {
    id: "calls",
    title: "Calls",
    icon: Phone,
    path: "/wa/calls",
    component: "CallsPage",
  },
  {
    id: "status",
    title: "Status",
    icon: Camera,
    path: "/wa/status",
    component: "StatusPage",
  },
  {
    id: "ai",
    title: "Meta AI",
    icon: Bot,
    path: "/wa/ai",
    component: "AIPage",
  },
  {
    id: "starred",
    title: "Starred",
    icon: Star,
    path: "/wa/starred",
    component: "StarredPage",
  },
  {
    id: "archived",
    title: "Archived",
    icon: Archive,
    path: "/wa/archived",
    component: "ArchivedPage",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    path: "/wa/settings",
    component: "SettingsPage",
  },
  {
    id: "profile",
    title: "Profile",
    icon: User,
    path: "/wa/profile",
    component: "ProfilePage",
  },
  {
    id: "locked",
    title: "Locked Chats",
    icon: Lock,
    path: "/wa/locked",
    component: "LockedPage",
  },
] as const
