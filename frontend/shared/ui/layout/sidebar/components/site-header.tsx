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
import { FeatureActionMenu } from "@/frontend/shared/actions"
import { FeatureExportImport } from "@/frontend/shared/foundation/utils/data/shared/components/FeatureHeaderActions"
import { Header, FeatureHeaderActions, getActiveFeatureSlug, getPageTitle } from "../../header"

export function SiteHeader() {
  const pathname = usePathname() ?? ""
  const pageTitle = getPageTitle(pathname)
  const { breadcrumbs } = useBreadcrumbs()

  // Get active feature slug for dynamic buttons
  const activeFeatureSlug = useMemo(() => getActiveFeatureSlug(pathname), [pathname])

  return (
    <Header
      className="h-(--header-height) shrink-0 gap-2 overflow-hidden transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
      // Use size="md" (px-4 py-3) but override padding to match original (px-4 lg:px-6)
      // Original had padding on inner div. Header puts it on root.
      // We'll use custom padding classes to match exactly.
      size="md"
    >
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
      <Header.Actions className="gap-1">
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
          onClick={() => {
            console.log("Notification button clicked")
            window.dispatchEvent(new Event("open-notifications"))
          }}
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

            {/* Actions button (burger/•••) */}
            <FeatureActionMenu
              featureSlug={activeFeatureSlug}
              className="text-muted-foreground hover:text-foreground"
            />
          </>
        )}
      </Header.Actions>
    </Header>
  )
}

