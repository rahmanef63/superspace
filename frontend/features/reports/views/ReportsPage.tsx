"use client"

import type { Id } from "@convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileBarChart } from "lucide-react"
import { FeatureNotReady, FeatureBadge } from "@/frontend/shared/ui"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"

interface ReportsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function ReportsPage({ workspaceId }: ReportsPageProps) {
  // Check if this feature is fully implemented
  const menuItem = useQuery(
    workspaceId ? (api as any)["features/menus/menuItems"].getMenuItemBySlug : "skip",
    workspaceId ? { workspaceId, slug: "reports" } : undefined
  )

  const isReady = menuItem?.metadata?.isReady !== false
  const status = (menuItem?.metadata?.status || "stable") as "stable" | "beta" | "development" | "experimental" | "deprecated"
  const expectedRelease = menuItem?.metadata?.expectedRelease

  // If no workspace selected
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Reports
          </p>
        </div>
      </PageContainer>
    )
  }

  // If feature is not ready, show FeatureNotReady component
  if (!isReady) {
    return (
      <FeatureNotReady
        featureName="Reports"
        featureSlug="reports"
        status={status === "development" ? "development" : "beta"}
        expectedRelease={expectedRelease}
        message="The Reports feature is currently under development. Core functionality is being built."
        docsUrl="/docs/features/reports"
        onGoBack={() => window.history.back()}
      />
    )
  }

  const reports = useQuery(api.features.reports.queries.list, { workspaceId })

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={FileBarChart}
        title="Reports"
        subtitle="Analitik dan laporan workspace"
        badge={status && status !== "stable" ? { status } : undefined}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports === undefined ? (
            <div className="col-span-full flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center gap-4 p-8">
              <FileBarChart className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Belum ada laporan</p>
                <p className="text-sm text-muted-foreground">Buat laporan pertama Anda</p>
              </div>
            </div>
          ) : (
            reports.map((report) => (
              <Card key={report._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart className="h-5 w-5" />
                    {report.name}
                  </CardTitle>
                  <CardDescription>
                    {new Date(report.createdAt).toLocaleDateString("id-ID")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Report details akan ditampilkan di sini</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
