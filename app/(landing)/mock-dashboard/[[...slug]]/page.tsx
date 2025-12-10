"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { SetBreadcrumbs } from "./SetBreadcrumbs"
import type { SidebarBreadcrumbItem } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"
import { useGuestWorkspaceContext, MOCK_MENU_ITEMS } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { GuestContentWrapper } from "./GuestContentWrapper"

function toTitleCase(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Mock Dashboard Catch-All Page
 * 
 * This page handles all feature routes for guest users without requiring authentication.
 * It mirrors the dashboard catch-all route but uses mock data and guest-specific content.
 * 
 * Route: /mock-dashboard/[...slug]
 */
export default function MockDashboardCatchAllPage() {
  const router = useRouter()
  const params = useParams<{ slug?: string[] }>()
  const parts = (params?.slug as unknown as string[] | undefined) ?? []
  const activeSlug = parts[0] || "overview"

  const { workspaceId, currentWorkspace } = useGuestWorkspaceContext()

  // Check if slug exists in mock menu items
  const menuItem = useMemo(() => {
    return MOCK_MENU_ITEMS.find(item => item.slug === activeSlug)
  }, [activeSlug])

  const isKnownSlug = Boolean(menuItem)
  const activeSlugTitle = useMemo(() => toTitleCase(activeSlug), [activeSlug])

  // Build breadcrumbs
  const breadcrumbs: SidebarBreadcrumbItem[] = useMemo(() => {
    const base: SidebarBreadcrumbItem[] = [{ label: "Demo", href: "/mock-dashboard" }]
    if (!activeSlug || activeSlug === "overview") return base
    return [...base, { label: menuItem?.name || activeSlugTitle, href: `/mock-dashboard/${activeSlug}` }]
  }, [activeSlug, activeSlugTitle, menuItem])

  // Render content based on active slug
  const renderContent = () => {
    // Unknown feature
    if (!isKnownSlug) {
      return (
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Feature Not Found</h2>
            <p className="text-sm text-muted-foreground">
              The feature <span className="font-medium">{activeSlugTitle}</span> is not available in demo mode.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/mock-dashboard" className="text-sm text-primary underline">Go to Demo Home</Link>
            <Link href="/mock-dashboard/overview" className="text-sm text-primary underline">View Overview</Link>
          </div>
        </div>
      )
    }

    // Render guest content wrapper
    return (
      <GuestContentWrapper
        workspaceId={workspaceId ?? undefined}
        activeView={activeSlug}
        workspaceName={currentWorkspace?.name}
      />
    )
  }

  return (
    <div className="flex flex-col w-full h-full">
      <SetBreadcrumbs items={breadcrumbs} />
      {renderContent()}
    </div>
  )
}
