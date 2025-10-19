import { MessageCircle, Phone, Camera, Bot, Star, Archive, Settings, User, Lock } from "lucide-react"

export const WA_NAVIGATION_ITEMS = [
  {
    id: "chats",
    title: "Chats",
    icon: MessageCircle,
    path: "/chats",
    component: "ChatsPage",
  },
  {
    id: "calls",
    title: "Calls",
    icon: Phone,
    path: "/calls",
    component: "CallsPage",
  },
  {
    id: "status",
    title: "Status",
    icon: Camera,
    path: "/status",
    component: "StatusPage",
  },
  {
    id: "ai",
    title: "Meta AI",
    icon: Bot,
    path: "/ai",
    component: "AIPage",
  },
  {
    id: "starred",
    title: "Starred",
    icon: Star,
    path: "/starred",
    component: "StarredPage",
  },
  {
    id: "archived",
    title: "Archived",
    icon: Archive,
    path: "/archived",
    component: "ArchivedPage",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    path: "/settings",
    component: "SettingsPage",
  },
  {
    id: "profile",
    title: "Profile",
    icon: User,
    path: "/profile",
    component: "ProfilePage",
  },
  {
    id: "locked",
    title: "Locked Chats",
    icon: Lock,
    path: "/locked",
    component: "LockedPage",
  },
] as const
