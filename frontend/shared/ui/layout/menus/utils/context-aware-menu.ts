/**
 * Context-Aware Menu System
 * 
 * Provides role-based and context-aware menu filtering for navigation items.
 * Integrates with RBAC permissions to show/hide menu items based on user roles.
 */

import type { Id } from "@/convex/_generated/dataModel"

// ============================================================================
// Types
// ============================================================================

export type MenuContext = {
  /** Current feature/route being viewed */
  activeRoute: string
  /** User's role level (0 = Owner, 90 = Guest) */
  roleLevel: number
  /** User's permissions for the workspace */
  permissions: string[]
  /** Current workspace ID */
  workspaceId: Id<"workspaces"> | null
  /** Whether user is in guest mode */
  isGuestMode: boolean
}

export interface ContextAwareMenuItem {
  id: string
  title: string
  icon?: React.ComponentType<{ className?: string }>
  url?: string
  /** Required permission to view this item */
  requiredPermission?: string
  /** Required role level (0 = Owner → 90 = Guest) */
  requiredRoleLevel?: number
  /** Feature flags that must be enabled */
  requiredFeatures?: string[]
  /** Show only when on specific routes */
  showOnRoutes?: string[]
  /** Hide when on specific routes */
  hideOnRoutes?: string[]
  /** Custom visibility function */
  isVisible?: (context: MenuContext) => boolean
  /** Children menu items */
  children?: ContextAwareMenuItem[]
  /** Metadata */
  metadata?: Record<string, any>
}

// ============================================================================
// Role Level Constants
// ============================================================================

export const ROLE_LEVELS = {
  OWNER: 0,
  ADMIN: 10,
  MANAGER: 20,
  MEMBER: 50,
  VIEWER: 80,
  GUEST: 90,
} as const

// ============================================================================
// Context-Aware Filtering
// ============================================================================

/**
 * Filter menu items based on current context
 */
export function filterMenuByContext(
  items: ContextAwareMenuItem[],
  context: MenuContext
): ContextAwareMenuItem[] {
  return items
    .filter((item) => isItemVisible(item, context))
    .map((item) => ({
      ...item,
      children: item.children 
        ? filterMenuByContext(item.children, context) 
        : undefined,
    }))
    .filter((item) => {
      // Remove parent items with no visible children
      if (item.children && item.children.length === 0) {
        return false
      }
      return true
    })
}

/**
 * Check if a single menu item should be visible
 */
export function isItemVisible(
  item: ContextAwareMenuItem,
  context: MenuContext
): boolean {
  // Custom visibility function takes precedence
  if (item.isVisible) {
    return item.isVisible(context)
  }

  // Check role level requirement
  if (item.requiredRoleLevel !== undefined) {
    if (context.roleLevel > item.requiredRoleLevel) {
      return false
    }
  }

  // Check permission requirement
  if (item.requiredPermission) {
    if (!context.permissions.includes(item.requiredPermission)) {
      return false
    }
  }

  // Check route-based visibility
  if (item.showOnRoutes && item.showOnRoutes.length > 0) {
    const matchesRoute = item.showOnRoutes.some((route) =>
      context.activeRoute.includes(route)
    )
    if (!matchesRoute) {
      return false
    }
  }

  // Check route-based hiding
  if (item.hideOnRoutes && item.hideOnRoutes.length > 0) {
    const shouldHide = item.hideOnRoutes.some((route) =>
      context.activeRoute.includes(route)
    )
    if (shouldHide) {
      return false
    }
  }

  // Guest mode restrictions
  if (context.isGuestMode) {
    // Guests can only see items with roleLevel >= 90
    if (item.requiredRoleLevel !== undefined && item.requiredRoleLevel < 90) {
      return false
    }
  }

  return true
}

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(
  permissions: string[],
  requiredPermission: string
): boolean {
  // Check exact match
  if (permissions.includes(requiredPermission)) {
    return true
  }

  // Check wildcard permissions (e.g., "admin.*" matches "admin.users.view")
  const wildcardPermissions = permissions.filter((p) => p.endsWith(".*"))
  for (const wildcard of wildcardPermissions) {
    const prefix = wildcard.slice(0, -2) // Remove ".*"
    if (requiredPermission.startsWith(prefix)) {
      return true
    }
  }

  return false
}

/**
 * Check if role level is sufficient
 */
export function hasRoleLevel(
  userRoleLevel: number,
  requiredRoleLevel: number
): boolean {
  // Lower number = higher privilege
  return userRoleLevel <= requiredRoleLevel
}

// ============================================================================
// Predefined Context Filters
// ============================================================================

/**
 * Create a filter for admin-only items
 */
export function adminOnly(): Partial<ContextAwareMenuItem> {
  return {
    requiredRoleLevel: ROLE_LEVELS.ADMIN,
  }
}

/**
 * Create a filter for owner-only items
 */
export function ownerOnly(): Partial<ContextAwareMenuItem> {
  return {
    requiredRoleLevel: ROLE_LEVELS.OWNER,
  }
}

/**
 * Create a filter for member and above
 */
export function memberAndAbove(): Partial<ContextAwareMenuItem> {
  return {
    requiredRoleLevel: ROLE_LEVELS.MEMBER,
  }
}

/**
 * Create a context-aware filter based on active route
 */
export function showOnlyInFeature(featureSlug: string): Partial<ContextAwareMenuItem> {
  return {
    showOnRoutes: [featureSlug],
  }
}

/**
 * Hide in specific features
 */
export function hideInFeature(featureSlug: string): Partial<ContextAwareMenuItem> {
  return {
    hideOnRoutes: [featureSlug],
  }
}
