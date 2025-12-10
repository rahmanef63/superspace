// This is the single source of truth for default menu items.
// It is safe to import in Convex server functions.
//
// AUTO-GENERATED - DO NOT EDIT MANUALLY.
// Source: frontend/features/*/config.ts (auto-discovered)
// Update via: pnpm run sync:features

export const DEFAULT_MENU_ITEMS = [
  {
    name: "Overview" as const,
    slug: "overview" as const,
    type: "route" as const,
    icon: "Home" as const,
    path: "/dashboard/overview",
    component: "OverviewPage" as const,
    order: 1,
    metadata: {
      description: "Dashboard overview with analytics and insights",
      version: "1.0.0",
      category: "analytics" as const,
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Communications" as const,
    slug: "communications" as const,
    type: "route" as const,
    icon: "MessageSquare" as const,
    path: "/dashboard/communications",
    component: "CommunicationsPage" as const,
    order: 1,
    metadata: {
      description: "Unified communication platform with channels, direct messages, voice/video calls, and AI integrations",
      version: "1.0.0",
      category: "communication" as const,
      tags: [
        "communication",
        "chat",
        "channels",
        "calls",
        "voice",
        "video",
        "messaging",
        "dm",
        "ai"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
    // No requiresPermission - visible to all workspace members
  },
  {
    name: "Chat" as const,
    slug: "chat" as const,
    type: "route" as const,
    icon: "MessageCircle" as const,
    path: "/dashboard/chat",
    component: "ChatsPage" as const,
    order: 1,
    metadata: {
      description: "Chat conversations",
      version: "2.0.0",
      category: "communication" as const,
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Members" as const,
    slug: "members" as const,
    type: "route" as const,
    icon: "Users" as const,
    path: "/dashboard/members",
    component: "MembersPage" as const,
    order: 4,
    metadata: {
      description: "Manage workspace members and permissions",
      version: "1.1.0",
      category: "administration" as const,
      tags: [
        "members",
        "team",
        "permissions"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "MANAGE_MEMBERS",
      originalRequiresPermission: "MANAGE_MEMBERS"
    },
    requiresPermission: "MANAGE_MEMBERS"
  },
  {
    name: "AI" as const,
    slug: "ai" as const,
    type: "route" as const,
    icon: "Bot" as const,
    path: "/dashboard/ai",
    component: "AIPage" as const,
    order: 4,
    metadata: {
      description: "AI assistant",
      version: "2.0.0",
      category: "communication" as const,
      tags: [
        "ai",
        "assistant",
        "automation"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Workspace Store",
    slug: "workspace-store",
    type: "route" as const,
    icon: "Building2",
    path: "/dashboard/workspace-store",
    component: "WorkspaceStorePage" as const,
    order: 5,
    metadata: {
      description: "Manage workspace hierarchy with nested workspaces, drag & drop, and tree visualization",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "workspace",
        "hierarchy",
        "tree",
        "system",
        "administration"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "MANAGE_WORKSPACES",
      originalRequiresPermission: "MANAGE_WORKSPACES"
    },
    requiresPermission: "MANAGE_WORKSPACES"
  },
  {
    name: "Knowledge" as const,
    slug: "knowledge" as const,
    type: "route" as const,
    icon: "BookOpen" as const,
    path: "/dashboard/knowledge",
    component: "KnowledgePage" as const,
    order: 5,
    metadata: {
      description: "Centralized knowledge base with documents, articles, and AI-consumable data",
      version: "1.0.0",
      category: "productivity" as const,
      tags: [
        "knowledge",
        "documents",
        "ai",
        "wiki",
        "articles",
        "profile"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "knowledge.view",
      originalRequiresPermission: "knowledge.view"
    },
    requiresPermission: "knowledge.view"
  },
  {
    name: "Contacts" as const,
    slug: "contacts" as const,
    type: "route" as const,
    icon: "Contact" as const,
    path: "/dashboard/contacts",
    component: "ContactsPage" as const,
    order: 5,
    metadata: {
      description: "Manage your contacts and connections",
      version: "1.0.0",
      category: "social" as const,
      tags: [
        "social",
        "connections",
        "networking",
        "contacts"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Database" as const,
    slug: "database" as const,
    type: "route" as const,
    icon: "Database" as const,
    path: "/dashboard/database",
    component: "DatabasesPage" as const,
    order: 7,
    metadata: {
      description: "Notion-style database views and management",
      version: "1.0.0",
      category: "productivity" as const,
      tags: [
        "database",
        "tables",
        "data-management"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "database.read",
      originalRequiresPermission: "database.read"
    },
    requiresPermission: "database.read"
  },
  {
    name: "Documents" as const,
    slug: "documents" as const,
    type: "route" as const,
    icon: "FileText" as const,
    path: "/dashboard/documents",
    component: "DocumentsPage" as const,
    order: 9,
    metadata: {
      description: "Collaborative document editor with real-time sync (Deprecated - use Knowledge > Docs)",
      version: "1.2.0",
      category: "productivity" as const,
      tags: [
        "collaboration",
        "real-time",
        "documents",
        "editor",
        "deprecated"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Menu Store",
    slug: "menus" as const,
    type: "route" as const,
    icon: "Menu" as const,
    path: "/dashboard/menus",
    component: "MenuStorePage" as const,
    order: 10,
    metadata: {
      description: "Install and manage navigation menus",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "menus",
        "navigation",
        "system"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "MANAGE_MENUS",
      originalRequiresPermission: "MANAGE_MENUS"
    },
    requiresPermission: "MANAGE_MENUS"
  },
  {
    name: "Invitations" as const,
    slug: "invitations" as const,
    type: "route" as const,
    icon: "Mail" as const,
    path: "/dashboard/invitations",
    component: "InvitationsPage" as const,
    order: 11,
    metadata: {
      description: "Manage workspace invitations",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "invitations",
        "team",
        "onboarding"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "MANAGE_INVITATIONS",
      originalRequiresPermission: "MANAGE_INVITATIONS"
    },
    requiresPermission: "MANAGE_INVITATIONS"
  },
  {
    name: "User Management",
    slug: "user-management",
    type: "route" as const,
    icon: "UserCog" as const,
    path: "/dashboard/user-management",
    component: "UserManagementPage" as const,
    order: 12,
    metadata: {
      description: "Unified user management: members, teams, invitations, and role hierarchy",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "users",
        "members",
        "teams",
        "roles",
        "invitations",
        "access-control"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "MANAGE_MEMBERS",
      originalRequiresPermission: "MANAGE_MEMBERS"
    },
    requiresPermission: "MANAGE_MEMBERS"
  },
  {
    name: "Content Library",
    slug: "content" as const,
    type: "route" as const,
    icon: "Library" as const,
    path: "/dashboard/content",
    component: "ContentPage" as const,
    order: 100,
    metadata: {
      description: "Centralized content management for images, videos, audio, and documents with AI generation capabilities.",
      version: "1.0.0",
      category: "creativity" as const,
      tags: [
        "content",
        "creativity"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Cms Lite",
    slug: "cms-lite",
    type: "route" as const,
    icon: "Box" as const,
    path: "/dashboard/cms-lite",
    component: "CmsLitePage" as const,
    order: 100,
    metadata: {
      description: "Cms Lite feature",
      version: "1.0.0",
      category: "productivity" as const,
      tags: [
        "cms-lite",
        "productivity"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const
    }
  },
  {
    name: "Platform Admin",
    slug: "platform-admin",
    type: "route" as const,
    icon: "Shield" as const,
    path: "/dashboard/platform-admin",
    component: "PlatformAdminPage" as const,
    order: 999,
    metadata: {
      description: "Super Admin panel for managing features, workspaces, and system configuration",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "admin",
        "system",
        "platform",
        "management",
        "superadmin"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "PLATFORM_ADMIN",
      originalRequiresPermission: "PLATFORM_ADMIN"
    },
    requiresPermission: "PLATFORM_ADMIN"
  }
]
