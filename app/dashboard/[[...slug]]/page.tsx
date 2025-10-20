"use client"

import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SetBreadcrumbs } from "./SetBreadcrumbs"
import type { BreadcrumbItem } from "@/app/dashboard/_components/breadcrumbs-context"
import { WORKSPACE_NAVIGATION_ITEMS } from "@/frontend/views/static/workspaces/constants/navigation"
import { useAuthed } from "@/frontend/shared/auth/hooks/useAuthed"
import { useWorkspaceContext } from "@/app/dashboard/WorkspaceProvider"
import { getPageById } from "@/frontend/views/manifest"
import { AppContentWrapper } from "@/frontend/views/AppContentWrapper"
import FeatureNotReady from "@/frontend/shared/components/FeatureNotReady"

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
  const workspaces = useMemo(
    () => (Array.isArray(userWorkspaces) ? userWorkspaces : []),
    [userWorkspaces]
  )

  const debugBasePayload = {
    isLoading,
    isAuthenticated,
    isSignedIn,
    workspacesLoaded,
    workspacesCount: workspaces?.length ?? "n/a",
    activeSlug,
    parts,
    componentId: `CatchAllPage-${activeSlug}`,
    currentPath: `/dashboard/${parts.join("/")}`,
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[[...slug]]/page:init", debugBasePayload)
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
    (api as any)["menu/store/menuItems"].getWorkspaceMenuItems,
    workspaceId && isAuthed ? { workspaceId } : "skip"
  )
  const accessibleSlugs = useMemo(
    () => new Set(((menuItems || []) as Array<{ slug: string }>).map((mi) => mi.slug)),
    [menuItems]
  )
  const manifestEntry = getPageById(activeSlug)
  const manifestHas = Boolean(manifestEntry)
  const activeMenuItem = useMemo(() => {
    if (!Array.isArray(menuItems)) return undefined
    return menuItems.find((mi: any) => mi?.slug === activeSlug)
  }, [menuItems, activeSlug])

  const deriveFallbackStatus = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "development":
        return "development"
      case "beta":
        return "beta"
      case "experimental":
        return "beta"
      case "deprecated":
        return "error"
      default:
        return "coming-soon"
    }
  }

  const logDecision = (type: string, extra: Record<string, unknown> = {}) => {
    if (process.env.NODE_ENV === "production") return
    console.debug("[[...slug]]/page:content-decision", {
      ...debugBasePayload,
      decision: type,
      manifestHas,
      manifestComponentId: manifestEntry?.componentId ?? null,
      menuItemResolved: Boolean(activeMenuItem),
      menuItemMetadata: activeMenuItem?.metadata ?? null,
      ...extra,
    })
  }

  const renderContent = () => {
    // If unauthenticated in dev, avoid rendering components that assume a user
    if (!isAuthed) {
      logDecision("unauthenticated", { reason: "No auth context" })
      return (
        <div className="justify-center items-center mx-auto lg:px-6 space-y-2">
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
      logDecision("no-workspaces", { reason: "Authenticated user has no workspace" })
      return (
        <div className="justify-center items-center mx-auto  lg:px-6 space-y-4">
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
      logDecision("workspace-loading", { reason: "Workspace context not ready" })
      return (
        <div className="px-4 lg:px-6">
          <div className="animate-pulse h-6 w-40 bg-muted rounded mb-4" />
          <div className="animate-pulse h-4 w-64 bg-muted rounded" />
        </div>
      )
    }

    // If menu is loaded and slug is not accessible, show fallback error
    // If menus exist but slug is not accessible AND not a built-in manifest page, show error.
    if (Array.isArray(menuItems) && menuItems.length > 0 && !accessibleSlugs.has(activeSlug) && !manifestHas) {
      logDecision("no-access", {
        reason: "Slug not accessible in workspace menu and not backed by manifest",
        menuCount: menuItems.length,
      })
      return (
        <div className="justify-center items-center mx-auto  lg:px-6 space-y-2">
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

    // Handle features that are known but explicitly marked as not ready yet.
    if (activeMenuItem && activeMenuItem.metadata && activeMenuItem.metadata.isReady === false) {
      const status = deriveFallbackStatus(activeMenuItem.metadata.status)
      const featureName = activeMenuItem.name || toTitleCase(activeSlug)
      const expectedRelease = activeMenuItem.metadata.expectedRelease as string | undefined
      const message =
        activeMenuItem.metadata.notReadyMessage ||
        "This feature is installed but not ready for use. Please check back soon."

      logDecision("feature-not-ready", {
        reason: "Feature marked as not ready in metadata",
        status,
        expectedRelease,
      })

      return (
        <FeatureNotReady
          featureName={featureName}
          featureSlug={activeSlug}
          status={status}
          message={message}
          expectedRelease={expectedRelease}
          docsUrl={activeMenuItem.metadata.docsUrl}
          onGoBack={() => router.push("/dashboard/overview")}
        />
      )
    }

    // If manifest entry is missing at runtime, surface a clear error for debugging.
    if (!manifestEntry) {
      logDecision("missing-manifest-entry", {
        reason: "Manifest lookup failed for slug",
      })
      return (
        <FeatureNotReady
          featureName={toTitleCase(activeSlug)}
          featureSlug={activeSlug}
          status="error"
          message="No page component is registered for this slug in the manifest. Ensure the manifest is up to date."
          onGoBack={() => router.push("/dashboard/overview")}
          docsUrl="/docs/features"
        />
      )
    }

    logDecision("render-content", { reason: "Manifest entry resolved and ready" })
    // Use the dynamic content renderer from menu-manifest with error handling
    return <AppContentWrapper workspaceId={workspaceId} activeView={activeSlug} />
  }

  return (
    <>
      <SetBreadcrumbs items={breadcrumbs} />
      {/* Unknown slug fallback (rendered after hooks to keep them stable) */}
      {parts.length > 0 && !isKnownSlug ? (
        <div className="min-h-dvh flex flex-col justify-center items-center text-center px-4 space-y-2">
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
