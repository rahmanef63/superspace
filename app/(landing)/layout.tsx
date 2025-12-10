import { AppSidebar } from "@/frontend/shared/ui/layout/sidebar/primary/AppSidebar"
import { SiteHeader } from "@/frontend/shared/ui/layout/sidebar/components/site-header"
import { BreadcrumbsProvider } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"
import { LoadingBar } from "@/frontend/shared/ui/layout/sidebar/components/loading-bar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { GuestWorkspaceProvider } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"

// Initialize all feature settings (registers settings with global registry)
import "@/frontend/features/initFeatureSettings"

/**
 * Mock Dashboard Layout
 * 
 * Uses the same dashboard UI as authenticated users,
 * but operates in guest mode with mock data.
 * The AppSidebar component automatically detects guest mode
 * and uses mock data instead of Convex queries.
 * 
 * Route: /mock-dashboard/*
 */
export default function MockDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="group/layout"
    >
      <BreadcrumbsProvider>
        <GuestWorkspaceProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <LoadingBar />
            <SiteHeader />
            <div className="@container/main flex flex-1 min-h-0">
              {children}
            </div>
          </SidebarInset>
        </GuestWorkspaceProvider>
      </BreadcrumbsProvider>
    </SidebarProvider>
  )
}
