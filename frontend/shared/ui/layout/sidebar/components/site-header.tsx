"use client"

import React, { useMemo } from "react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
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
import { GlobalUtilityButtons } from "../../chrome/GlobalUtilityButtons"

function getPageTitle(pathname: string): string {
  // Handle exact matches first
  switch (pathname) {
    case "/dashboard":
      return "Overview"
    case "/dashboard/payment-gated":
      return "Payment gated"
    default:
      return "Overview"
  }
}

/**
 * Extract active feature slug from pathname
 * e.g. /dashboard/chat -> "chat", /dashboard/documents -> "documents"
 */
function getActiveFeatureSlug(pathname: string): string | null {
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
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const { breadcrumbs } = useBreadcrumbs()

  // Get active feature slug for dynamic settings button
  const activeFeatureSlug = useMemo(() => getActiveFeatureSlug(pathname), [pathname])
  const activeFeatureName = useMemo(
    () => (activeFeatureSlug ? slugToDisplayName(activeFeatureSlug) : null),
    [activeFeatureSlug]
  )

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Left side: Sidebar trigger + Breadcrumbs */}
        <div className="flex items-center gap-1 lg:gap-2">
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
            <h1 className="text-base font-medium">{pageTitle}</h1>
          )}
        </div>

        {/* Right side: Notifications + Feature Settings */}
        <div className="flex items-center gap-1">
          {/* Global Utilities (Search, Notifications, Help, Create) */}
          <GlobalUtilityButtons />

          {/* Dynamic Feature Settings button */}
          {activeFeatureSlug && (
            <FeatureSettingsButton
              featureSlug={activeFeatureSlug}
              featureName={activeFeatureName || activeFeatureSlug}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            />
          )}
        </div>
      </div>
    </header>
  )
}

