// This is the single source of truth for default menu items.
// It is safe to import in Convex server functions.
//
// ⚠️  AUTO-GENERATED - DO NOT EDIT MANUALLY
// This file is generated from features.config.ts
// Run 'pnpm run sync:features' to update

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
      category: "analytics" as const
    }
  },
  {
    name: "Chats" as const,
    slug: "chat" as const,
    type: "folder" as const,
    icon: "MessageCircle" as const,
    path: "/dashboard/wa",
    component: "Page" as const,
    order: 3,
    metadata: {
      description: "Chats clone with chat, calls, status, and AI features",
      version: "2.0.0",
      category: "communication" as const,
      tags: [
        "messaging",
        "communication",
        "real-time"
      ]
    },
    children: [
      {
        name: "Chats" as const,
        slug: "chats",
        type: "route" as const,
        icon: "MessageCircle" as const,
        path: "/dashboard/chats",
        component: "ChatsPage" as const,
        order: 1,
        metadata: {
          description: "Chat conversations",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Calls" as const,
        slug: "calls",
        type: "route" as const,
        icon: "Phone" as const,
        path: "/dashboard/wa-calls",
        component: "CallsPage" as const,
        order: 2,
        metadata: {
          description: "Voice and video calls",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Status" as const,
        slug: "status",
        type: "route" as const,
        icon: "Camera" as const,
        path: "/dashboard/wa-status",
        component: "StatusPage" as const,
        order: 3,
        metadata: {
          description: "Status updates",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Meta AI",
        slug: "ai",
        type: "route" as const,
        icon: "Bot" as const,
        path: "/dashboard/wa-ai",
        component: "AIPage" as const,
        order: 4,
        metadata: {
          description: "AI assistant",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Starred" as const,
        slug: "starred",
        type: "route" as const,
        icon: "Star" as const,
        path: "/dashboard/wa-starred",
        component: "StarredPage" as const,
        order: 5,
        metadata: {
          description: "Starred messages",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Archived" as const,
        slug: "archived",
        type: "route" as const,
        icon: "Archive" as const,
        path: "/dashboard/wa-archived",
        component: "ArchivedPage" as const,
        order: 6,
        metadata: {
          description: "Archived chats",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Settings" as const,
        slug: "settings",
        type: "route" as const,
        icon: "Settings" as const,
        path: "/dashboard/wa-settings",
        component: "SettingsPage" as const,
        order: 7,
        metadata: {
          description: "Chats settings",
          version: "2.0.0",
          category: "communication" as const
        }
      },
      {
        name: "Profile" as const,
        slug: "profile",
        type: "route" as const,
        icon: "User" as const,
        path: "/dashboard/wa-profile",
        component: "ProfilePage" as const,
        order: 8,
        metadata: {
          description: "User profile",
          version: "2.0.0",
          category: "communication" as const
        }
      }
    ]
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
      category: "administration" as const
    },
    requiresPermission: "MANAGE_MEMBERS"
  },
  {
    name: "Friends" as const,
    slug: "friends" as const,
    type: "route" as const,
    icon: "Heart" as const,
    path: "/dashboard/friends",
    component: "FriendsPage" as const,
    order: 5,
    metadata: {
      description: "Manage your friends and connections",
      version: "1.0.0",
      category: "social" as const
    }
  },
  {
    name: "Pages" as const,
    slug: "pages" as const,
    type: "route" as const,
    icon: "FileText" as const,
    path: "/dashboard/pages",
    component: "PagesPage" as const,
    order: 6,
    metadata: {
      description: "Notion-like pages for documentation",
      version: "1.0.0",
      category: "productivity" as const
    }
  },
  {
    name: "Databases" as const,
    slug: "databases" as const,
    type: "route" as const,
    icon: "Database" as const,
    path: "/dashboard/databases",
    component: "DatabasesPage" as const,
    order: 7,
    metadata: {
      description: "Notion-style database views and management",
      version: "1.0.0",
      category: "productivity" as const
    }
  },
  {
    name: "Canvas" as const,
    slug: "canvas" as const,
    type: "route" as const,
    icon: "Palette" as const,
    path: "/dashboard/canvas",
    component: "CanvasPage" as const,
    order: 8,
    metadata: {
      description: "Visual collaboration and whiteboarding",
      version: "1.0.0",
      category: "creativity" as const
    }
  },
  {
    name: "Menu Store",
    slug: "menus" as const,
    type: "route" as const,
    icon: "Menu" as const,
    path: "/dashboard/menus",
    component: "MenusPage" as const,
    order: 10,
    metadata: {
      description: "Install and manage navigation menus",
      version: "1.0.0",
      category: "administration" as const
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
      category: "administration" as const
    }
  },
  {
    name: "Profile" as const,
    slug: "user-settings",
    type: "route" as const,
    icon: "User" as const,
    path: "/dashboard/user-settings",
    component: "ProfilePage" as const,
    order: 20,
    metadata: {
      description: "Manage your user profile and preferences",
      version: "1.0.0",
      category: "administration" as const
    }
  },
  {
    name: "Settings" as const,
    slug: "settings" as const,
    type: "route" as const,
    icon: "Settings" as const,
    path: "/dashboard/settings",
    component: "WorkspacesPage" as const,
    order: 99,
    metadata: {
      description: "Workspace configuration and settings",
      version: "1.0.0",
      category: "administration" as const
    },
    requiresPermission: "MANAGE_WORKSPACE"
  }
]
