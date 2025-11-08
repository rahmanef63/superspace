"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SetBreadcrumbs } from "./SetBreadcrumbs"
import type { SidebarBreadcrumbItem } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"
import { WORKSPACE_NAVIGATION_ITEMS } from "@/frontend/shared/foundation/workspaces/constants/navigation"
import { useAuthed } from "@/frontend/shared/foundation"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { getPageById } from "@/frontend/shared/foundation/manifest"
import { AppContentWrapper } from "@/frontend/shared/context/AppContentWrapper"
import { FeatureNotReady } from "@/frontend/shared/ui"
import { useToast } from "@/hooks/use-toast"

function toTitleCase(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function CatchAllPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const navigationSlugSet = useMemo<Set<string>>(
    () => new Set(WORKSPACE_NAVIGATION_ITEMS.map((item) => item.key)),
    [],
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Read dynamic route params in a Client Component via useParams
  const params = useParams<{ slug?: string[] }>()
  const parts = (params?.slug as unknown as string[] | undefined) ?? []
  const activeSlug = parts[0] || "overview"
  const navigationHasSlug = navigationSlugSet.has(activeSlug)

  const { isAuthed, isLoading, isAuthenticated, isSignedIn } = useAuthed()
  const { workspaceId, setWorkspaceId, workspaces: userWorkspaces } = useWorkspaceContext();
  const { toast } = useToast()
  const lastUnknownSlugRef = useRef<string | null>(null)
  const workspacesLoaded = userWorkspaces !== undefined
  const workspaces = useMemo(
    () => (Array.isArray(userWorkspaces) ? userWorkspaces : []),
    [userWorkspaces]
  )

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

  const breadcrumbs: SidebarBreadcrumbItem[] = useMemo(() => {
    const base: SidebarBreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard" }]
    if (!activeSlug) return base
    const item = WORKSPACE_NAVIGATION_ITEMS.find(i => i.key === activeSlug)
    if (!item) return base
    return [...base, { label: item.label, href: `/dashboard/${activeSlug}` }]
  }, [activeSlug])

  // Access-controlled menu items (use "skip" until ready per Convex types)
  const menuItems = useQuery(
    (api as any)["features/menus/menuItems"].getWorkspaceMenuItems,
    workspaceId && isAuthed ? { workspaceId } : "skip"
  )
  const accessibleSlugs = useMemo(
    () => new Set(((menuItems || []) as Array<{ slug: string }>).map((mi) => mi.slug)),
    [menuItems]
  )
  const manifestEntry = getPageById(activeSlug)
  const manifestHas = Boolean(manifestEntry)
  const menuHasSlug = accessibleSlugs.has(activeSlug)
  const isKnownSlug = navigationHasSlug || menuHasSlug || manifestHas
  const activeSlugTitle = useMemo(() => toTitleCase(activeSlug), [activeSlug])
  const activeMenuItem = useMemo(() => {
    if (!Array.isArray(menuItems)) return undefined
    return menuItems.find((mi: any) => mi?.slug === activeSlug)
  }, [menuItems, activeSlug])
  const debugBasePayload = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      isSignedIn,
      workspacesLoaded,
      workspacesCount: workspaces?.length ?? "n/a",
      activeSlug,
      activeSlugTitle,
      parts,
      componentId: `CatchAllPage-${activeSlug}`,
      currentPath: `/dashboard/${parts.join("/")}`,
      navigationHasSlug,
      menuHasSlug,
      manifestHas,
      isKnownSlug,
    }),
    [
      activeSlug,
      activeSlugTitle,
      isAuthenticated,
      isKnownSlug,
      isLoading,
      isSignedIn,
      manifestHas,
      menuHasSlug,
      navigationHasSlug,
      parts,
      workspaces,
      workspacesLoaded,
    ],
  )

  const logFrog = useCallback(
    (label: string, extra: Record<string, unknown> = {}) => {
      if (process.env.NODE_ENV === "production") return
      console.info("[frog]", label, { ...debugBasePayload, ...extra })
    },
    [debugBasePayload],
  )

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

  const logDecision = useCallback(
    (type: string, extra: Record<string, unknown> = {}) => {
      // Disabled for cleaner console
    },
    [],
  )

  useEffect(() => {
    if (!isMounted) return
    if (parts.length === 0) return

    if (isKnownSlug) {
      if (lastUnknownSlugRef.current !== null) {
        lastUnknownSlugRef.current = null
      }
      return
    }

    if (lastUnknownSlugRef.current === activeSlug) return

    logFrog("unknown-slug", {
      slug: activeSlug,
      navigationHasSlug,
      menuHasSlug,
      manifestHas,
    })
    logDecision("unknown-slug", {
      reason: "Slug missing from navigation, menu, and manifest fallback",
      slug: activeSlug,
    })
    toast({
      title: `${activeSlugTitle} is not configured`,
      description: "Enable this feature in your workspace navigation or update the manifest.",
      variant: "destructive",
    })
    lastUnknownSlugRef.current = activeSlug
  }, [
    activeSlug,
    activeSlugTitle,
    isKnownSlug,
    isMounted,
    logDecision,
    logFrog,
    manifestHas,
    menuHasSlug,
    navigationHasSlug,
    parts.length,
    toast,
  ])

  const renderContent = () => {
    if (!isMounted) {
      logDecision("pre-hydration", { reason: "Waiting for client hydration" })
      return <div className="min-h-dvh" />
    }

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
    if (Array.isArray(menuItems) && menuItems.length > 0 && !menuHasSlug && !manifestHas) {
      logDecision("no-access", {
        reason: "Slug not accessible in workspace menu and not backed by manifest",
        menuCount: menuItems.length,
        slug: activeSlug,
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
        <div className="min-h-dvh flex flex-col justify-center items-center text-center px-4 space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Feature Not Available</h2>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find any content registered for{" "}
              <span className="font-medium">{activeSlugTitle}</span>. Enable this feature in your workspace navigation or
              ask an administrator for access.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/dashboard/overview" className="text-sm text-primary underline">Go to Overview</Link>
            <Link href="/dashboard/settings" className="text-sm text-primary underline">Manage Workspace Settings</Link>
          </div>
        </div>
      ) : (
        renderContent()
      )}
    </>
  )
}
