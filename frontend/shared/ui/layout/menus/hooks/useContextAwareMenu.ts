"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import type { Id } from "@/convex/_generated/dataModel"
import { useIsGuestMode } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import {
  filterMenuByContext,
  type MenuContext,
  type ContextAwareMenuItem,
  ROLE_LEVELS,
} from "../utils/context-aware-menu"

// ============================================================================
// Types
// ============================================================================

interface UseContextAwareMenuOptions {
  workspaceId: Id<"workspaces"> | null
  /** User's role in the workspace (optional - defaults to guest) */
  userRole?: "owner" | "admin" | "manager" | "member" | "viewer" | "guest"
  /** User's permissions in the workspace (optional) */
  userPermissions?: string[]
}

interface UseContextAwareMenuReturn {
  /** Filter menu items based on current context */
  filterItems: <T extends ContextAwareMenuItem>(items: T[]) => T[]
  /** Current menu context */
  context: MenuContext
  /** Whether context is still loading */
  isLoading: boolean
}

// ============================================================================
// Role Level Mapping
// ============================================================================

function getRoleLevel(role?: string): number {
  switch (role) {
    case "owner":
      return ROLE_LEVELS.OWNER
    case "admin":
      return ROLE_LEVELS.ADMIN
    case "manager":
      return ROLE_LEVELS.MANAGER
    case "member":
      return ROLE_LEVELS.MEMBER
    case "viewer":
      return ROLE_LEVELS.VIEWER
    default:
      return ROLE_LEVELS.GUEST
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for context-aware menu filtering
 * 
 * Provides role-based and route-based menu filtering based on:
 * - User's role level in the workspace
 * - User's permissions
 * - Current active route
 * - Guest mode status
 * 
 * @example
 * ```tsx
 * const { filterItems, context } = useContextAwareMenu({ 
 *   workspaceId,
 *   userRole: "admin",
 *   userPermissions: ["documents.create", "documents.edit"]
 * })
 * const visibleItems = filterItems(allMenuItems)
 * ```
 */
export function useContextAwareMenu(
  options: UseContextAwareMenuOptions
): UseContextAwareMenuReturn {
  const { workspaceId, userRole, userPermissions = [] } = options
  const pathname = usePathname()
  const isGuestMode = useIsGuestMode()

  // Build the current context
  const context: MenuContext = React.useMemo(() => {
    // Extract active route from pathname
    const parts = pathname?.split("/").filter(Boolean) || []
    const dashboardIndex = parts.indexOf("dashboard")
    const activeRoute = dashboardIndex >= 0 
      ? parts.slice(dashboardIndex + 1).join("/") 
      : parts.join("/")

    // Determine role level
    const roleLevel = getRoleLevel(userRole)

    return {
      activeRoute,
      roleLevel,
      permissions: userPermissions,
      workspaceId,
      isGuestMode,
    }
  }, [pathname, userRole, userPermissions, workspaceId, isGuestMode])

  // Filter function
  const filterItems = React.useCallback(
    <T extends ContextAwareMenuItem>(items: T[]): T[] => {
      return filterMenuByContext(items, context) as T[]
    },
    [context]
  )

  return {
    filterItems,
    context,
    isLoading: false,
  }
}

/**
 * Hook for checking a single permission
 */
export function useHasPermission(
  permissions: string[],
  permission: string
): boolean {
  return permissions.includes(permission)
}

/**
 * Hook for checking role level
 */
export function useHasRoleLevel(
  userRole: string | undefined,
  requiredLevel: number
): boolean {
  const roleLevel = getRoleLevel(userRole)
  return roleLevel <= requiredLevel
}
