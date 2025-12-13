"use client"

import React, { useMemo } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "./breadcrumbs-context"
import { FeatureSettingsButton } from "@/frontend/shared/settings/components/FeatureSettingsButton"
import { FeatureActionMenu } from "@/frontend/shared/actions"
import { FeatureExportImport } from "@/frontend/shared/foundation/utils/data/shared/components/FeatureHeaderActions"
import { FeatureAIAssistant } from "@/frontend/shared/ui/ai-assistant/FeatureAIAssistant"

function getPageTitle(pathname: string | null): string {
  const safePathname = pathname ?? ""
  // Handle exact matches first
  switch (safePathname) {
    case "/dashboard":
      return "Overview"
    case "/dashboard/payment-gated":
      return "Payment gated"
    default:
      return "Overview"
  }
}

function getActiveFeatureSlug(pathname: string | null): string | null {
  if (!pathname) return null
  const match = pathname.match(/^\/dashboard\/([^/]+)/)
  if (match && match[1]) {
    // Exclude non-feature pages
    const slug = match[1]
    const excludedSlugs = ["workspace", "payment-gated"]
    if (excludedSlugs.includes(slug)) {
      return null
    }
    return slug
  }
  return null
}

/**
 * Convert slug to display name
 */
function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function SiteHeader() {
  const pathname = usePathname() ?? ""
  const pageTitle = getPageTitle(pathname)
  const { breadcrumbs } = useBreadcrumbs()

  // Get active feature slug for dynamic settings button
  const activeFeatureSlug = useMemo(() => getActiveFeatureSlug(pathname), [pathname])
  const activeFeatureName = useMemo(
    () => (activeFeatureSlug ? slugToDisplayName(activeFeatureSlug) : null),
    [activeFeatureSlug]
  )

  return (
    <header className="flex h-(--header-height) w-full shrink-0 items-center gap-2 overflow-hidden border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Left side: Sidebar trigger + Breadcrumbs */}
        <div className="flex flex-1 items-center gap-1 min-w-0 overflow-hidden lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {breadcrumbs.length > 0 ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                      {index < breadcrumbs.length - 1 ? (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <h1 className="text-base font-medium truncate">{pageTitle}</h1>
          )}
        </div>

        {/* Right side: Notifications + Feature Settings */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Search (inline desktop; icon→modal on mobile) */}
          <Button
            variant="outline"
            className="hidden h-8 max-w-[180px] justify-start gap-2 px-2 text-muted-foreground lg:inline-flex"
            onClick={() => window.dispatchEvent(new Event("open-command-menu"))}
          >
            <Search className="h-4 w-4" />
            <span className="inline-flex text-xs">Search...</span>
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => window.dispatchEvent(new Event("open-command-menu"))}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications button (global) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => window.dispatchEvent(new Event("open-notifications"))}
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Dynamic Feature Buttons */}
          {activeFeatureSlug && (
            <>
              {/* Data button (Import/Export) */}
              <FeatureExportImport 
                featureId={activeFeatureSlug}
                variant="dropdown"
                buttonVariant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              />

              {/* {featureName} Settings */}
              <FeatureSettingsButton
                featureSlug={activeFeatureSlug}
                featureName={activeFeatureName || activeFeatureSlug}
                className="h-8 w-auto px-2 text-muted-foreground hover:text-foreground [&>span]:hidden [&>span]:lg:inline"
                showLabel={true}
                label="Settings"
              />

              {/* {featureName} Agents */}
              <FeatureAIAssistant 
                featureId={activeFeatureSlug}
                buttonVariant="ghost"
                className="h-8 w-auto px-2 text-muted-foreground hover:text-foreground [&>span]:hidden [&>span]:lg:inline"
                showLabel={true}
              />

              {/* Actions button (burger/•••) */}
              <FeatureActionMenu 
                featureSlug={activeFeatureSlug}
                className="text-muted-foreground hover:text-foreground"
              />
            </>
          )}
        </div>
      </div>
    </header>
  )
}

