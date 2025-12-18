"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { DISCOVERED_FEATURES, getFeatureById } from "@/frontend/shared/lib/features/registry"
import type { FeatureConfig } from "@/frontend/shared/lib/features/defineFeature"

export type SidebarBreadcrumbItem = {
  label: string
  href: string
}

type BreadcrumbsContextValue = {
  breadcrumbs: SidebarBreadcrumbItem[]
  setBreadcrumbs: (items: SidebarBreadcrumbItem[]) => void
}

const BreadcrumbsContext = React.createContext<BreadcrumbsContextValue | null>(
  null
)

export function useBreadcrumbs() {
  const ctx = React.useContext(BreadcrumbsContext)
  if (!ctx) {
    throw new Error(
      "useBreadcrumbs must be used within a BreadcrumbsProvider"
    )
  }
  return ctx
}

/**
 * Find a feature by matching its path or navigation patterns
 */
function findFeatureByPath(pathname: string): FeatureConfig | undefined {
  // Extract the main dashboard path segment
  const match = pathname.match(/^\/dashboard\/([^/?]+)/)
  if (!match) return undefined

  const slug = match[1]

  // First try exact match by ID
  const feature = getFeatureById(slug)
  if (feature) return feature

  // Try matching by path
  for (const f of DISCOVERED_FEATURES) {
    // Check main feature path
    if (f.ui.path === pathname || f.ui.path === `/dashboard/${slug}`) {
      return f
    }

    // Check navigation aliases
    if (f.navigation?.aliases?.includes(slug)) {
      return f
    }

    // Check children
    if (f.children) {
      for (const child of f.children) {
        if (child.ui.path === pathname || child.id === slug) {
          return child
        }
      }
    }
  }

  return undefined
}

/**
 * Find parent feature if current feature is a child
 */
function findParentFeature(childId: string): FeatureConfig | undefined {
  for (const f of DISCOVERED_FEATURES) {
    if (f.children?.some(c => c.id === childId)) {
      return f
    }
  }
  return undefined
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbsFromPath(pathname: string): SidebarBreadcrumbItem[] {
  const breadcrumbs: SidebarBreadcrumbItem[] = []

  // Don't show breadcrumbs on dashboard root
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return []
  }

  // Find the current feature
  const currentFeature = findFeatureByPath(pathname)

  if (currentFeature) {
    // Check if this is a child feature
    const parentFeature = findParentFeature(currentFeature.id)

    if (parentFeature) {
      // Add parent feature
      breadcrumbs.push({
        label: parentFeature.name,
        href: parentFeature.ui.path,
      })
    }

    // Add current feature
    breadcrumbs.push({
      label: currentFeature.name,
      href: currentFeature.ui.path,
    })

    // Check for sub-paths beyond the feature (e.g., /dashboard/documents/123)
    const pathSegments = pathname.split('/').filter(Boolean)
    const featurePathSegments = currentFeature.ui.path.split('/').filter(Boolean)

    if (pathSegments.length > featurePathSegments.length) {
      // There are additional path segments - could be an ID or sub-route
      const remainingSegments = pathSegments.slice(featurePathSegments.length)

      // Add sub-paths as breadcrumbs (these can be overridden by setBreadcrumbs)
      for (let i = 0; i < remainingSegments.length; i++) {
        const segment = remainingSegments[i]

        // Skip if it looks like an ID
        if (segment.match(/^[a-z0-9]{24,}$/i)) continue

        // Convert slug to readable name
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        breadcrumbs.push({
          label,
          href: '/' + pathSegments.slice(0, featurePathSegments.length + i + 1).join('/'),
        })
      }
    }
  } else {
    // Fallback: Generate breadcrumbs from path segments
    const segments = pathname.split('/').filter(Boolean)

    // Skip 'dashboard' prefix
    const relevantSegments = segments.slice(1)

    for (let i = 0; i < relevantSegments.length; i++) {
      const segment = relevantSegments[i]

      // Skip if it looks like an ID
      if (segment.match(/^[a-z0-9]{24,}$/i)) continue

      // Convert slug to readable name
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        label,
        href: '/dashboard/' + relevantSegments.slice(0, i + 1).join('/'),
      })
    }
  }

  return breadcrumbs
}

export function BreadcrumbsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [manualBreadcrumbs, setManualBreadcrumbs] = React.useState<SidebarBreadcrumbItem[] | null>(null)
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname
  const autoBreadcrumbs = React.useMemo(() => {
    return generateBreadcrumbsFromPath(pathname ?? "")
  }, [pathname])

  // Clear manual breadcrumbs on route change
  React.useEffect(() => {
    setManualBreadcrumbs(null)
  }, [pathname])

  // Use manual breadcrumbs if set, otherwise use auto-generated
  const breadcrumbs = manualBreadcrumbs ?? autoBreadcrumbs

  const setBreadcrumbs = React.useCallback((items: SidebarBreadcrumbItem[]) => {
    setManualBreadcrumbs(items)
  }, [])

  const value = React.useMemo(
    () => ({ breadcrumbs, setBreadcrumbs }),
    [breadcrumbs, setBreadcrumbs]
  )

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}
