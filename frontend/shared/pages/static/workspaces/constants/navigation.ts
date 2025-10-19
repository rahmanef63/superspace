import {
  Home,
  MessageSquare,
  Menu,
  FileText,
  Settings,
  Users,
  Mail,
  Heart,
  User,
  MessageCircle
} from "lucide-react";
import { WorkspaceNavigationItem } from "../types";

export const WORKSPACE_NAVIGATION_ITEMS: WorkspaceNavigationItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: Home,
    description: "Overview and analytics",
    path: "/overview"
  },
  {
    key: "chat",
    label: "Chat",
    icon: MessageSquare,
    description: "Messages and AI assistant",
    path: "/chat"
  },
  {
    key: "chats",
    label: " Chats",
    icon: MessageCircle,
    description: "Chats chat conversations",
    path: "/chats"
  },
  {
    key: "members",
    label: "Members",
    icon: Users,
    description: "Manage workspace members",
    path: "/members"
  },
  {
    key: "friends",
    label: "Friends",
    icon: Heart,
    description: "Manage your friends",
    path: "/friends"
  },
  {
    key: "documents",
    label: "Documents",
    icon: FileText,
    description: "Collaborative documents",
    path: "/documents"
  },
  {
    key: "menus",
    label: "Menu Store",
    icon: Menu,
    description: "Manage navigation menus",
    path: "/menus"
  },
  {
    key: "invitations",
    label: "Invitations",
    icon: Mail,
    description: "Manage invitations",
    path: "/invitations"
  },
  {
    key: "user-settings",
    label: "Profile",
    icon: User,
    description: "Manage your profile",
    path: "/user-settings"
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    description: "Workspace configuration",
    path: "/settings"
  }
];

export const WORKSPACE_TYPES = [
  { value: "personal", label: "Personal", desc: "For individual use" },
  { value: "family", label: "Family", desc: "For family members" },
  { value: "group", label: "Group", desc: "For small groups" },
  { value: "organization", label: "Organization", desc: "For companies" },
  { value: "institution", label: "Institution", desc: "For schools, hospitals, etc." }
] as const;

