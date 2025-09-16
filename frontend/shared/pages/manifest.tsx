"use client"

import type { Id } from "@convex/_generated/dataModel"
import type { ElementType, ReactElement } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import OverviewPage from "./dynamic/overview/page"
import FriendsPage from "./static/friends/page"
import InvitationsPage from "./static/invitations/page"
import ProfilePage from "./static/profile/page"
import MembersPage from "./static/member/page"
import WorkspacesPage from "./static/workspaces/page"
import MenusPage from "./static/menus/page"

// Feature wrappers (unified entry points)
import MessagePage from "../../features/wa/page"
import DocumentsPage from "../../features/documents/page"
import CanvasPage from "../../features/canvas/page"
import {
  WAChatsPage,
  WACallsPage,
  WAStatusPage,
  WAAIPage,
  WAStarredPage,
  WAArchivedPage,
  WASettingsPage,
  WAProfilePage,
} from "../../features/wa/shared/pages"

import {
  Home,
  MessageSquare,
  Users,
  Heart,
  FileText,
  Palette,
  Menu,
  Mail,
  User,
  Settings,
  MessageCircle,
  Phone,
  Camera,
  Bot,
  Star,
  Archive,
} from "lucide-react"

export type AppPageComponent = (props: { workspaceId?: Id<"workspaces"> | null }) => ReactElement | null

export interface PageManifestItem {
  // Default route slug this component is commonly mounted at (optional fallback)
  id: string // e.g. "dashboard"
  // Stable component identifier used by menus to target this component
  componentId: string // e.g. "OverviewPage", "ChatPage"
  title: string // default display title
  description?: string
  icon?: ElementType
  color?: string
  component: AppPageComponent
}

// Default in-code registry (can be overridden by database menu items)
export const DEFAULT_PAGE_MANIFEST: PageManifestItem[] = [
  {
    id: "dashboard",
    componentId: "OverviewPage",
    title: "Dashboard",
    description: "Overview and analytics",
    icon: Home,
    component: ({ workspaceId }) => <OverviewPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "chat",
    componentId: "ChatPage",
    title: "Chat",
    description: "Messages and AI assistant",
    icon: MessageSquare,
    component: ({ workspaceId }) => <MessagePage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa",
    componentId: "WAPage",
    title: "WhatsApp",
    description: "WhatsApp workspace overview",
    icon: MessageCircle,
    component: ({ workspaceId }) => <MessagePage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-chats",
    componentId: "WAChatsPage",
    title: "WA Chats",
    description: "WhatsApp chat conversations",
    icon: MessageCircle,
    component: ({ workspaceId }) => <WAChatsPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-calls",
    componentId: "WACallsPage",
    title: "WA Calls",
    description: "WhatsApp voice and video calls",
    icon: Phone,
    component: ({ workspaceId }) => <WACallsPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-status",
    componentId: "WAStatusPage",
    title: "WA Status",
    description: "WhatsApp status updates",
    icon: Camera,
    component: ({ workspaceId }) => <WAStatusPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-ai",
    componentId: "WAAIPage",
    title: "WA Meta AI",
    description: "WhatsApp AI assistant",
    icon: Bot,
    component: ({ workspaceId }) => <WAAIPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-starred",
    componentId: "WAStarredPage",
    title: "WA Starred",
    description: "WhatsApp starred messages",
    icon: Star,
    component: ({ workspaceId }) => <WAStarredPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-archived",
    componentId: "WAArchivedPage",
    title: "WA Archived",
    description: "WhatsApp archived chats",
    icon: Archive,
    component: ({ workspaceId }) => <WAArchivedPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-settings",
    componentId: "WASettingsPage",
    title: "WA Settings",
    description: "WhatsApp settings",
    icon: Settings,
    component: ({ workspaceId }) => <WASettingsPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "wa-profile",
    componentId: "WAProfilePage",
    title: "WA Profile",
    description: "WhatsApp user profile",
    icon: User,
    component: ({ workspaceId }) => <WAProfilePage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "members",
    componentId: "MembersPage",
    title: "Members",
    description: "Manage workspace members",
    icon: Users,
    component: ({ workspaceId }) => <MembersPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "friends",
    componentId: "FriendsPage",
    title: "Friends",
    description: "Manage your friends",
    icon: Heart,
    component: ({ workspaceId }) => <FriendsPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "documents",
    componentId: "DocumentsPage",
    title: "Documents",
    description: "Collaborative documents",
    icon: FileText,
    component: ({ workspaceId }) => <DocumentsPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "canvas",
    componentId: "CanvasPage",
    title: "Canvas",
    description: "Visual collaboration",
    icon: Palette,
    component: ({ workspaceId }) => <CanvasPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "menus",
    componentId: "MenusPage",
    title: "Menu Store",
    description: "Manage navigation menus",
    icon: Menu,
    component: ({ workspaceId }) => <MenusPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "invitations",
    componentId: "InvitationsPage",
    title: "Invitations",
    description: "Manage invitations",
    icon: Mail,
    component: ({ workspaceId }) => <InvitationsPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
  {
    id: "user-settings",
    componentId: "ProfilePage",
    title: "Profile",
    description: "Manage your profile",
    icon: User,
    component: () => <ProfilePage />,
  },
  {
    id: "settings",
    componentId: "WorkspacesPage",
    title: "Settings",
    description: "Workspace configuration",
    icon: Settings,
    component: ({ workspaceId }) => <WorkspacesPage workspaceId={workspaceId as Id<"workspaces">} />,
  },
]

export const PAGE_MANIFEST_MAP: Record<string, PageManifestItem> = Object.fromEntries(
  DEFAULT_PAGE_MANIFEST.map((p) => [p.id, p]),
)

// Component registry keyed by componentId (many menus can point to the same component)
export const COMPONENT_REGISTRY_MAP: Record<string, PageManifestItem> = Object.fromEntries(
  DEFAULT_PAGE_MANIFEST.map((p) => [p.componentId, p]),
)

export function getDefaultPages(): PageManifestItem[] {
  return DEFAULT_PAGE_MANIFEST
}

export function getPageById(id: string): PageManifestItem | undefined {
  return DEFAULT_PAGE_MANIFEST.find((p) => p.id === id)
}

export function getComponentById(componentId: string): PageManifestItem | undefined {
  return COMPONENT_REGISTRY_MAP[componentId]
}

interface AppContentProps {
  workspaceId?: Id<"workspaces"> | null
  activeView: string
}

// Backward-compatible content renderer that uses the manifest
export function AppContent({ workspaceId, activeView }: AppContentProps) {
  // 1) Try to resolve directly by slug (legacy/default)
  const fallbackPage =
    DEFAULT_PAGE_MANIFEST.find((p) => p.id === activeView) ?? DEFAULT_PAGE_MANIFEST.find((p) => p.id === "dashboard")

  // 2) If we have a workspace, resolve via menu → componentId mapping (many-to-many)
  const menuItem = useQuery(
    api.menu.menuItems.getMenuItemBySlug,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces">, slug: activeView } : "skip",
  ) as unknown as { component?: string } | null | undefined

  const targeted = menuItem?.component ? COMPONENT_REGISTRY_MAP[String(menuItem.component)] : undefined
  const Comp = targeted?.component ?? fallbackPage?.component

  return <div className="flex-1 overflow-hidden">{Comp ? <Comp workspaceId={workspaceId ?? null} /> : null}</div>
}
