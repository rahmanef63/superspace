"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import {
  Activity,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Settings,
  Download,
  FolderKanban,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CheckSquare,
  UserPlus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { OverviewData } from "./types"

interface OverviewViewProps {
  workspaceId?: Id<"workspaces"> | null
  mockData?: OverviewData
}

type TimeRange = "today" | "7d" | "30d" | "90d"

export function OverviewView({ workspaceId, mockData }: OverviewViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const shouldUseRealData = !mockData && !!workspaceId

  // Query workspace data
  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    shouldUseRealData && workspaceId ? { workspaceId } : "skip"
  )

  const members = useQuery(
    api.workspace.workspaces.getWorkspaceMembers,
    shouldUseRealData && workspaceId ? { workspaceId } : "skip"
  )

  // Get analytics overview with real data
  const analytics = useQuery(
    api.features.analytics.queries.getOverview,
    shouldUseRealData && workspaceId ? { workspaceId, timeRange } : "skip"
  )

  // No workspace state only if not using mock data
  if (!mockData && !workspaceId) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a workspace to view dashboard</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (shouldUseRealData && (workspace === undefined || members === undefined)) {
    return <OverviewSkeleton />
  }

  // Use real data where available, fallback to mock data
  const workspaceName = mockData?.workspaceName ?? workspace?.name ?? "Dashboard"
  const activeUsers = mockData?.members?.total ?? analytics?.members?.total ?? members?.length ?? 0
  const tasksTotal = mockData?.tasks?.total ?? analytics?.tasks?.total ?? 0
  const tasksCompleted = mockData?.tasks?.completed ?? analytics?.tasks?.completed ?? 0
  const projectsTotal = mockData?.projects?.total ?? analytics?.projects?.total ?? 0
  const projectsActive = mockData?.projects?.active ?? analytics?.projects?.active ?? 0
  const documentsCount = mockData?.documents ?? analytics?.documents ?? 0

  const recentActivity = mockData?.recentActivity ?? analytics?.recentActivity
  const roles = mockData?.members?.roles ?? analytics?.members?.roles
  const lastUpdated = mockData?.generatedAt ?? analytics?.generatedAt

  const handleRefresh = () => {
    // Trigger re-render
    setTimeRange(prev => prev)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <FeatureHeader
        title={workspaceName}
        subtitle="Workspace overview and analytics"
        primaryAction={{
          label: "Refresh",
          icon: RefreshCcw,
          onClick: handleRefresh,
        }}
        secondaryActions={[
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => { },
          },
          {
            id: "export",
            label: "Export",
            icon: Download,
            onClick: () => { },
          },
        ]}
      />

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time range:</span>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Updated {typeof lastUpdated === 'number'
              ? formatDistanceToNow(lastUpdated, { addSuffix: true })
              : lastUpdated
            }
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
            {roles && (
              <div className="flex gap-1 mt-2">
                {Object.entries(roles).map(([role, count]) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {count as number} {role}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckSquare className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksTotal}</div>
            <p className="text-xs text-muted-foreground">{tasksCompleted} completed</p>
            {tasksTotal > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{Math.round((tasksCompleted / tasksTotal) * 100)}% completion rate</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <FolderKanban className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsTotal}</div>
            <p className="text-xs text-muted-foreground">{projectsActive} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsCount}</div>
            <p className="text-xs text-muted-foreground">Total documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="p-1.5 rounded-full bg-muted">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">
                        {activity.action || activity.type || "Activity"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp
                          ? (typeof activity.timestamp === 'number'
                            ? formatDistanceToNow(activity.timestamp, { addSuffix: true })
                            : activity.timestamp)
                          : "Recently"
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-medium text-foreground mb-1">No recent activity</h4>
                <p className="text-sm text-muted-foreground">
                  Activity from your workspace will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Roles */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Composition
            </CardTitle>
            <CardDescription>Members by role</CardDescription>
          </CardHeader>
          <CardContent>
            {roles && Object.keys(roles).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(roles).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="capitalize">{role}</span>
                    </div>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-medium text-foreground mb-1">No team members</h4>
                <p className="text-sm text-muted-foreground">
                  Invite team members to get started.
                </p>
              </div>
            )}
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
                <CheckSquare className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Create Task</div>
                  <div className="text-xs text-muted-foreground">
                    Add a new task
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
                <UserPlus className="h-5 w-5" />
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

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
