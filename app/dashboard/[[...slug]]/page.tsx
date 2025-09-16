"use client"

import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { SetBreadcrumbs } from "./SetBreadcrumbs"
import type { BreadcrumbItem } from "@/app/dashboard/_components/breadcrumbs-context"
import { WORKSPACE_NAVIGATION_ITEMS } from "@/frontend/shared/pages/static/workspaces/constants/navigation"
import { useAuthed } from "@/frontend/shared/auth/hooks/useAuthed"
import { useWorkspaceContext } from "@/app/dashboard/WorkspaceProvider"
import { AppContent, getPageById } from "@/frontend/shared/pages/manifest"

function toTitleCase(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function CatchAllPage() {
  const router = useRouter()
  // Read dynamic route params in a Client Component via useParams
  const params = useParams<{ slug?: string[] }>()
  const parts = (params?.slug as unknown as string[] | undefined) ?? []
  const activeSlug = parts[0] || "overview"
  const isKnownSlug = WORKSPACE_NAVIGATION_ITEMS.some(i => i.key === activeSlug)

  const { isAuthed, isLoading, isAuthenticated, isSignedIn } = useAuthed()
  const { workspaceId, setWorkspaceId, workspaces: userWorkspaces } = useWorkspaceContext();
  const workspacesLoaded = userWorkspaces !== undefined
  const workspaces = Array.isArray(userWorkspaces) ? userWorkspaces : []

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[[...slug]]/page', {
      isLoading,
      isAuthenticated,
      isSignedIn,
      workspacesLoaded,
      workspacesCount: workspaces?.length ?? 'n/a',
      activeSlug,
      parts,
      componentId: `CatchAllPage-${activeSlug}`,
      currentPath: `/dashboard/${parts.join('/')}`,
    })
  }

  // WorkspaceProvider handles default selection

  // Redirect /dashboard to /dashboard/overview as default
  useEffect(() => {
    if (parts.length === 0 && isAuthenticated) {
      router.replace("/dashboard/overview")
    }
  }, [parts.length, isAuthenticated, router])

  // If authenticated and no workspace after data loads, redirect to onboarding page as fallback
  useEffect(() => {
    if (isLoading) return
    if (!workspacesLoaded) return
    if (isAuthenticated && workspaces.length === 0) {
      router.replace("/dashboard/workspace")
    }
  }, [isLoading, isAuthenticated, workspacesLoaded, workspaces, router])

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const base: BreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard" }]
    if (!activeSlug) return base
    const item = WORKSPACE_NAVIGATION_ITEMS.find(i => i.key === activeSlug)
    if (!item) return base
    return [...base, { label: item.label, href: `/dashboard/${activeSlug}` }]
  }, [activeSlug])

  // Access-controlled menu items (use "skip" until ready per Convex types)
  const menuItems = useQuery(
    api.menu.menuItems.getWorkspaceMenuItems,
    workspaceId && isAuthed ? { workspaceId } : "skip"
  )
  const accessibleSlugs = useMemo(
    () => new Set(((menuItems || []) as Array<{ slug: string }>).map((mi) => mi.slug)),
    [menuItems]
  )

  const renderContent = () => {
    // If unauthenticated in dev, avoid rendering components that assume a user
    if (!isAuthed) {
      return (
        <div className="px-4 lg:px-6 space-y-2">
          <h2 className="text-lg font-semibold">You are not signed in</h2>
          <p className="text-sm text-muted-foreground">Please go back to the home page to sign in.</p>
          <div>
            <Link href="/" className="text-sm text-primary underline">Go to landing page</Link>
          </div>
        </div>
      )
    }

    // Explicit empty state fallback to guide users to onboarding page
    if (workspacesLoaded && isAuthed && workspaces.length === 0) {
      return (
        <div className="px-4 lg:px-6 space-y-4">
          <h2 className="text-lg font-semibold">No workspace yet</h2>
          <p className="text-sm text-muted-foreground">
            Create your first workspace to get started.
          </p>
          <div>
            <Link href="/dashboard/workspace" className="text-sm text-primary underline">Create a workspace</Link>
          </div>
        </div>
      )
    }

    if (!workspaceId) {
      // Loading state
      return (
        <div className="px-4 lg:px-6">
          <div className="animate-pulse h-6 w-40 bg-muted rounded mb-4" />
          <div className="animate-pulse h-4 w-64 bg-muted rounded" />
        </div>
      )
    }

    // If menu is loaded and slug is not accessible, show fallback error
    // If menus exist but slug is not accessible AND not a built-in manifest page, show error.
    const manifestHas = Boolean(getPageById(activeSlug))
    if (Array.isArray(menuItems) && menuItems.length > 0 && !accessibleSlugs.has(activeSlug) && !manifestHas) {
      return (
        <div className="px-4 lg:px-6 space-y-2">
          <h2 className="text-lg font-semibold">Not Found or No Access</h2>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have access to this page or it does not exist.
          </p>
          <div>
            <Link href="/dashboard" className="text-sm text-primary underline">Go back to Dashboard</Link>
          </div>
        </div>
      )
    }

    // Use the dynamic content renderer from menu-manifest
    return <AppContent workspaceId={workspaceId} activeView={activeSlug} />
  }

  return (
    <>
      <SetBreadcrumbs items={breadcrumbs} />
      {/* Unknown slug fallback (rendered after hooks to keep them stable) */}
      {parts.length > 0 && !isKnownSlug ? (
        <div className="px-4 lg:px-6 space-y-2">
          <h2 className="text-lg font-semibold">Page Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The page you are looking for doesn&apos;t exist.
          </p>
          <div>
            <Link href="/dashboard" className="text-sm text-primary underline">Go back to Dashboard</Link>
          </div>
        </div>
      ) : (
        renderContent()
      )}
    </>
  )
}
