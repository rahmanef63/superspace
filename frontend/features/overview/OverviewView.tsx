"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { PageHeader } from "@/frontend/shared/ui/layout/header"
import {
  Activity,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
} from "lucide-react"

interface OverviewViewProps {
  workspaceId?: Id<"workspaces"> | null
}

export function OverviewView({ workspaceId }: OverviewViewProps) {
  // Query workspace data
  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    workspaceId ? { workspaceId } : "skip"
  )

  const members = useQuery(
    api.workspace.workspaces.getWorkspaceMembers,
    workspaceId ? { workspaceId } : "skip"
  )

  // Loading state
  if (workspace === undefined || members === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (!workspaceId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No workspace selected. Please select a workspace to continue.
        </AlertDescription>
      </Alert>
    )
  }

  // Use real data where available
  const activeUsers = members?.length || 0;

  return (
    <div className="space-y-6 font-bold text-primary-foreground">
      <PageHeader
        title={`Welcome back${workspace?.name ? ` to ${workspace.name}` : ""}!`}
        description="Here's what's happening with your workspace today."
      />

      {/* Stats Grid - Use real data where available, show -- for features not yet implemented */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground/50">--</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Workspace members</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground/50">--</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground/50">--</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity - Empty State */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-medium text-foreground mb-1">No recent activity</h4>
                <p className="text-sm text-muted-foreground">
                  Activity from your workspace will appear here.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events - Empty State */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Your schedule for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-medium text-foreground mb-1">No upcoming events</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Calendar events will appear here once you create them.
                </p>
                <Button variant="outline" size="sm">
                  Open Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Quick Actions */}
      <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Start a Chat</div>
                    <div className="text-xs text-muted-foreground">
                      Message your team
                    </div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Create Document</div>
                    <div className="text-xs text-muted-foreground">
                      Write and collaborate
                    </div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Invite Members</div>
                    <div className="text-xs text-muted-foreground">
                      Grow your team
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
      </Card>
    </div>
  )
}
