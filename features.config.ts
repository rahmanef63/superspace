/**
 * Feature Registry - Single Source of Truth
 *
 * This file contains all feature metadata for the SuperSpace application.
 * All features (default and optional) are defined here.
 *
 * Changes to this file will automatically sync to:
 * - DEFAULT_MENU_ITEMS (convex/menu/store/menu_manifest_data.ts)
 * - Menu catalog for Menu Store
 * - Feature scaffolding templates
 */

import { z } from "zod"

// ============================================================================
// FEATURE SCHEMA
// ============================================================================

// Base schema without children (to avoid circular reference issues)
const BaseFeatureMetadataSchema = z.object({
  // Basic info
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string(),

  // Feature type
  featureType: z.enum(["default", "optional", "experimental"]),
  category: z.enum([
    "communication",
    "productivity",
    "collaboration",
    "administration",
    "social",
    "creativity",
    "analytics"
  ]),

  // Menu configuration
  icon: z.string(),
  path: z.string(),
  component: z.string(),
  order: z.number(),
  type: z.enum(["route", "folder", "divider", "action", "chat", "document"]),

  // Access control
  requiresPermission: z.string().optional(),

  // Versioning
  version: z.string(),

  // File structure
  hasUI: z.boolean().default(true),
  hasConvex: z.boolean().default(true),
  hasTests: z.boolean().default(true),

  // Additional metadata
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  author: z.string().optional(),

  // Development status
  status: z.enum(["stable", "beta", "development", "experimental", "deprecated"]).optional(),
  isReady: z.boolean().default(true), // Whether the feature is fully implemented
  expectedRelease: z.string().optional(), // Expected release date if not ready
})

// Extended schema with children (recursive)
export const FeatureMetadataSchema: z.ZodType<FeatureMetadata> = BaseFeatureMetadataSchema.extend({
  children: z.lazy(() => z.array(FeatureMetadataSchema)).optional(),
})

export type FeatureMetadata = z.infer<typeof BaseFeatureMetadataSchema> & {
  children?: FeatureMetadata[]
}

// ============================================================================
// FEATURE REGISTRY - SINGLE SOURCE OF TRUTH
// ============================================================================

export const FEATURES_REGISTRY: FeatureMetadata[] = [
  // ========== DEFAULT FEATURES ==========
  {
    slug: "overview",
    name: "Overview",
    description: "Dashboard overview with analytics and insights",
    featureType: "default",
    category: "analytics",
    icon: "Home",
    path: "/dashboard/overview",
    component: "OverviewPage",
    order: 1,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "wa",
    name: "WhatsApp",
    description: "WhatsApp clone with chat, calls, status, and AI features",
    featureType: "default",
    category: "communication",
    icon: "MessageCircle",
    path: "/dashboard/wa",
    component: "WAPage",
    order: 3,
    type: "folder",
    version: "2.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    tags: ["messaging", "communication", "real-time"],
    children: [
      {
        slug: "wa-chats",
        name: "Chats",
        description: "Chat conversations",
        featureType: "default",
        category: "communication",
        icon: "MessageCircle",
        path: "/dashboard/wa-chats",
        component: "WAChatsPage",
        order: 1,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
      {
        slug: "wa-calls",
        name: "Calls",
        description: "Voice and video calls",
        featureType: "default",
        category: "communication",
        icon: "Phone",
        path: "/dashboard/wa-calls",
        component: "WACallsPage",
        order: 2,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
      {
        slug: "wa-status",
        name: "Status",
        description: "Status updates",
        featureType: "default",
        category: "communication",
        icon: "Camera",
        path: "/dashboard/wa-status",
        component: "WAStatusPage",
        order: 3,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
      {
        slug: "wa-ai",
        name: "Meta AI",
        description: "AI assistant",
        featureType: "default",
        category: "communication",
        icon: "Bot",
        path: "/dashboard/wa-ai",
        component: "WAAIPage",
        order: 4,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
      {
        slug: "wa-starred",
        name: "Starred",
        description: "Starred messages",
        featureType: "default",
        category: "communication",
        icon: "Star",
        path: "/dashboard/wa-starred",
        component: "WAStarredPage",
        order: 5,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
      {
        slug: "wa-archived",
        name: "Archived",
        description: "Archived chats",
        featureType: "default",
        category: "communication",
        icon: "Archive",
        path: "/dashboard/wa-archived",
        component: "WAArchivedPage",
        order: 6,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
      {
        slug: "wa-settings",
        name: "Settings",
        description: "WhatsApp settings",
        featureType: "default",
        category: "communication",
        icon: "Settings",
        path: "/dashboard/wa-settings",
        component: "WASettingsPage",
        order: 7,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: false,
        hasTests: true,
      },
      {
        slug: "wa-profile",
        name: "Profile",
        description: "User profile",
        featureType: "default",
        category: "communication",
        icon: "User",
        path: "/dashboard/wa-profile",
        component: "WAProfilePage",
        order: 8,
        type: "route",
        version: "2.0.0",
        hasUI: true,
        hasConvex: true,
        hasTests: true,
      },
    ],
  },

  {
    slug: "members",
    name: "Members",
    description: "Manage workspace members and permissions",
    featureType: "default",
    category: "administration",
    icon: "Users",
    path: "/dashboard/members",
    component: "MembersPage",
    order: 4,
    type: "route",
    version: "1.1.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    requiresPermission: "MANAGE_MEMBERS",
  },

  {
    slug: "friends",
    name: "Friends",
    description: "Manage your friends and connections",
    featureType: "default",
    category: "social",
    icon: "Heart",
    path: "/dashboard/friends",
    component: "FriendsPage",
    order: 5,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "pages",
    name: "Pages",
    description: "Notion-like pages for documentation",
    featureType: "default",
    category: "productivity",
    icon: "FileText",
    path: "/dashboard/pages",
    component: "PagesPage",
    order: 6,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "databases",
    name: "Databases",
    description: "Notion-style database views and management",
    featureType: "default",
    category: "productivity",
    icon: "Database",
    path: "/dashboard/databases",
    component: "DatabasesPage",
    order: 7,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "canvas",
    name: "Canvas",
    description: "Visual collaboration and whiteboarding",
    featureType: "default",
    category: "creativity",
    icon: "Palette",
    path: "/dashboard/canvas",
    component: "CanvasPage",
    order: 8,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "menus",
    name: "Menu Store",
    description: "Install and manage navigation menus",
    featureType: "default",
    category: "administration",
    icon: "Menu",
    path: "/dashboard/menus",
    component: "MenusPage",
    order: 10,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    requiresPermission: "MANAGE_MENUS",
  },

  {
    slug: "invitations",
    name: "Invitations",
    description: "Manage workspace invitations",
    featureType: "default",
    category: "administration",
    icon: "Mail",
    path: "/dashboard/invitations",
    component: "InvitationsPage",
    order: 11,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "user-settings",
    name: "Profile",
    description: "Manage your user profile and preferences",
    featureType: "default",
    category: "administration",
    icon: "User",
    path: "/dashboard/user-settings",
    component: "ProfilePage",
    order: 20,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
  },

  {
    slug: "settings",
    name: "Settings",
    description: "Workspace configuration and settings",
    featureType: "default",
    category: "administration",
    icon: "Settings",
    path: "/dashboard/settings",
    component: "WorkspacesPage",
    order: 99,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    requiresPermission: "MANAGE_WORKSPACE",
  },

  // ========== OPTIONAL FEATURES ==========

  {
    slug: "chat",
    name: "Chat",
    description: "Alternative chat interface with AI assistant",
    featureType: "optional",
    category: "communication",
    icon: "MessageSquare",
    path: "/dashboard/chat",
    component: "ChatPage",
    order: 2,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    tags: ["messaging", "ai"],
  },

  {
    slug: "documents",
    name: "Documents",
    description: "Collaborative document editor with real-time sync",
    featureType: "optional",
    category: "productivity",
    icon: "FileText",
    path: "/dashboard/documents",
    component: "DocumentsPage",
    order: 3,
    type: "route",
    version: "1.2.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    tags: ["collaboration", "real-time"],
  },

  {
    slug: "calendar",
    name: "Calendar",
    description: "Team calendar with event management",
    featureType: "optional",
    category: "productivity",
    icon: "Calendar",
    path: "/dashboard/calendar",
    component: "CalendarPage",
    order: 9,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    tags: ["scheduling", "events"],
    status: "development",
    isReady: false,
    expectedRelease: "Q1 2025",
  },

  {
    slug: "reports",
    name: "Reports",
    description: "Analytics and reporting dashboard",
    featureType: "optional",
    category: "analytics",
    icon: "BarChart",
    path: "/dashboard/reports",
    component: "ReportsPage",
    order: 12,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    requiresPermission: "VIEW_REPORTS",
    status: "development", // ✨ Added: Feature in development
    isReady: false, // ✨ Added: Not fully implemented yet
    expectedRelease: "Q1 2025", // ✨ Added: Expected completion
  },

  {
    slug: "tasks",
    name: "Tasks",
    description: "Task management and tracking",
    featureType: "optional",
    category: "productivity",
    icon: "CheckSquare",
    path: "/dashboard/tasks",
    component: "TasksPage",
    order: 13,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    tags: ["productivity", "project-management"],
    status: "development",
    isReady: false,
    expectedRelease: "Q2 2025",
  },

  {
    slug: "wiki",
    name: "Wiki",
    description: "Knowledge base and documentation",
    featureType: "optional",
    category: "productivity",
    icon: "Book",
    path: "/dashboard/wiki",
    component: "WikiPage",
    order: 14,
    type: "route",
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    tags: ["documentation", "knowledge-base"],
    status: "development",
    isReady: false,
    expectedRelease: "Q2 2025",
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all features by type
 */
export function getFeaturesByType(type: "default" | "optional" | "experimental"): FeatureMetadata[] {
  return FEATURES_REGISTRY.filter(f => f.featureType === type)
}

/**
 * Get all default features (included by default in workspace)
 */
export function getDefaultFeatures(): FeatureMetadata[] {
  return getFeaturesByType("default")
}

/**
 * Get all optional features (available in Menu Store catalog)
 */
export function getOptionalFeatures(): FeatureMetadata[] {
  return getFeaturesByType("optional")
}

/**
 * Get feature by slug
 */
export function getFeatureBySlug(slug: string): FeatureMetadata | undefined {
  // Flatten tree to search all features including children
  const flatten = (features: FeatureMetadata[]): FeatureMetadata[] => {
    return features.flatMap(f => [f, ...(f.children ? flatten(f.children) : [])])
  }
  return flatten(FEATURES_REGISTRY).find(f => f.slug === slug)
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: string): FeatureMetadata[] {
  return FEATURES_REGISTRY.filter(f => f.category === category)
}

/**
 * Validate feature metadata
 */
export function validateFeature(feature: unknown): FeatureMetadata {
  return FeatureMetadataSchema.parse(feature)
}

/**
 * Convert feature to menu item format
 */
export function featureToMenuItem(feature: FeatureMetadata) {
  return {
    name: feature.name,
    slug: feature.slug,
    type: feature.type,
    icon: feature.icon,
    path: feature.path,
    component: feature.component,
    order: feature.order,
    metadata: {
      description: feature.description,
      version: feature.version,
      category: feature.category,
      tags: feature.tags,
    },
    requiresPermission: feature.requiresPermission,
    children: feature.children?.map(featureToMenuItem),
  }
}

/**
 * Get all features as menu items (for DEFAULT_MENU_ITEMS sync)
 */
export function getAllDefaultMenuItems() {
  return getDefaultFeatures().map(featureToMenuItem)
}

/**
 * Get optional features catalog (for Menu Store)
 */
export function getOptionalFeaturesCatalog() {
  return getOptionalFeatures().map(f => ({
    slug: f.slug,
    name: f.name,
    description: f.description,
    icon: f.icon,
    version: f.version,
    category: f.category,
    tags: f.tags,
    requiresPermission: f.requiresPermission,
    status: f.status,
    isReady: f.isReady,
    expectedRelease: f.expectedRelease,
  }))
}
