"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { getDefaultPages, PAGE_MANIFEST_MAP, COMPONENT_REGISTRY_MAP } from "@/frontend/shared/foundation/manifest"
import { iconFromName } from "@/frontend/shared/ui/components/icons"
import { Building, type LucideIcon } from "lucide-react"
import type { SystemNavItem } from "./useSystemNavItems"

// Type for system feature visibility data
interface SystemFeatureVisibility {
  featureId: string
  isEnabled: boolean
  isPublic: boolean
  isReady: boolean
  status: string
}

interface NavItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  type?: string
  parentId?: string
  children: NavItem[]
  metadata?: Record<string, unknown>
  isGroup?: boolean  // true if type is "group" - indicates non-navigable container
}

/**
 * Hook for building navigation items from menu items
 * Handles menu item parsing, system features, and visibility
 */
export function useNavItems(workspaceId: Id<"workspaces"> | null) {
  // Query menu items
  const menuItems = useQuery(
    (api as any)["features/menus/menuItems"].getWorkspaceMenuItems,
    workspaceId ? { workspaceId } : "skip",
  ) as any[] | undefined
  
  // Get system features for visibility info
  const systemFeatures = useQuery(
    api.features.system.admin.getSystemFeatures
  ) as SystemFeatureVisibility[] | undefined
  
  // Build feature visibility map
  const featureVisibilityMap = useMemo(() => {
    const map = new Map<string, SystemFeatureVisibility>()
    if (systemFeatures) {
      for (const feature of systemFeatures) {
        map.set(feature.featureId, feature)
      }
    }
    return map
  }, [systemFeatures])

  // Build navigation items
  const { navItems, systemItems } = useMemo(() => {
    if (Array.isArray(menuItems) && menuItems.length > 0) {
      const itemsMap = new Map()
      const rootItems: NavItem[] = []
      const systemMenuItems: SystemNavItem[] = []

      menuItems
        .filter((mi) => mi && typeof mi.slug === "string" && mi.isVisible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((mi) => {
          const fallbackByComponent = mi.component ? COMPONENT_REGISTRY_MAP[mi.component as string] : undefined
          const fallbackBySlug = PAGE_MANIFEST_MAP[mi.slug as string]
          const fallback = fallbackByComponent ?? fallbackBySlug

          // Get visibility info from systemFeatures if available
          const featureVisibility = featureVisibilityMap.get(mi.slug as string)
          
          // Merge metadata with system feature visibility info
          const mergedMetadata = {
            ...mi.metadata,
            ...(featureVisibility ? {
              isEnabled: featureVisibility.isEnabled,
              isPublic: featureVisibility.isPublic,
              isReady: featureVisibility.isReady,
              status: featureVisibility.status,
            } : {}),
          }

          const navItem: NavItem = {
            id: mi.slug as string,
            title: (mi.name as string) || fallback?.title || mi.slug,
            description: (mi.metadata?.description as string) || fallback?.description,
            icon: iconFromName(mi.icon as string) || fallback?.icon || Building,
            type: mi.type,
            parentId: mi.parentId,
            children: [],
            metadata: mergedMetadata,
            isGroup: mi.type === "group", // Mark as group for special rendering
          }

          itemsMap.set(mi._id, navItem)

          // Separate system items (featureType === "system")
          const isSystemItem = mi.metadata?.featureType === "system"

          if (!mi.parentId) {
            if (isSystemItem) {
              // Cast through unknown to LucideIcon since iconFromName returns React component icons
              const iconComponent = (navItem.icon as unknown) as LucideIcon
              systemMenuItems.push({
                id: navItem.id,
                name: navItem.title,
                url: mi.path || `/dashboard/${navItem.id}`,
                icon: iconComponent,
                description: navItem.description,
                metadata: mergedMetadata,
              })
            } else {
              rootItems.push(navItem)
            }
          }
        })

      // Build parent-child relationships
      menuItems.forEach((mi) => {
        if (mi.parentId && itemsMap.has(mi.parentId)) {
          const parent = itemsMap.get(mi.parentId)
          const child = itemsMap.get(mi._id)
          if (parent && child) {
            parent.children.push({
              id: child.id,
              title: child.title,
              url: `/dashboard/${child.id}`,
              metadata: child.metadata,
            })
          }
        }
      })

      return { navItems: rootItems, systemItems: systemMenuItems }
    }

    return {
      navItems: getDefaultPages().map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
        children: [],
      })) as NavItem[],
      systemItems: [] as SystemNavItem[],
    }
  }, [menuItems, featureVisibilityMap])

  return { navItems, systemItems, menuItems }
}
