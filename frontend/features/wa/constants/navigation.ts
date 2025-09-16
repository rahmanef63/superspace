import { MessageCircle, Phone, Camera, Bot, Star, Archive, Settings, User, Lock } from "lucide-react"

export const WA_NAVIGATION_ITEMS = [
  {
    id: "chats",
    title: "Chats",
    icon: MessageCircle,
    path: "/wa/chats",
    component: "WAChatsPage",
  },
  {
    id: "calls",
    title: "Calls",
    icon: Phone,
    path: "/wa/calls",
    component: "WACallsPage",
  },
  {
    id: "status",
    title: "Status",
    icon: Camera,
    path: "/wa/status",
    component: "WAStatusPage",
  },
  {
    id: "ai",
    title: "Meta AI",
    icon: Bot,
    path: "/wa/ai",
    component: "WAAIPage",
  },
  {
    id: "starred",
    title: "Starred",
    icon: Star,
    path: "/wa/starred",
    component: "WAStarredPage",
  },
  {
    id: "archived",
    title: "Archived",
    icon: Archive,
    path: "/wa/archived",
    component: "WAArchivedPage",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    path: "/wa/settings",
    component: "WASettingsPage",
  },
  {
    id: "profile",
    title: "Profile",
    icon: User,
    path: "/wa/profile",
    component: "WAProfilePage",
  },
  {
    id: "locked",
    title: "Locked Chats",
    icon: Lock,
    path: "/wa/locked",
    component: "WALockedPage",
  },
] as const
