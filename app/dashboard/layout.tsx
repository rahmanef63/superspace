import { AppSidebar } from "@/frontend/shared/ui/layout/sidebar/primary/AppSidebar"
import { SiteHeader } from "@/frontend/shared/ui/layout/sidebar/components/site-header"
import { BreadcrumbsProvider } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"
import { LoadingBar } from "@/frontend/shared/ui/layout/sidebar/components/loading-bar"
import { OnboardingGuard } from "@/frontend/shared/ui/layout/sidebar/components/onboarding-guard"
import { Suspense } from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { WorkspaceProvider } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

// Initialize all feature settings (registers settings with global registry)
import "@/frontend/features/initFeatureSettings"

export default function DashboardLayout({
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
        <WorkspaceProvider>
          <Suspense fallback={null}>
            <OnboardingGuard />
          </Suspense>
          <AppSidebar/>
          <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <LoadingBar />
            <SiteHeader />
            <div className="@container/main flex flex-1 min-h-0">
              {children}
            </div>
          </SidebarInset>
        </WorkspaceProvider>
      </BreadcrumbsProvider>
    </SidebarProvider>
  )
}
