/**
 * Overview View
 * 
 * Main dashboard view for workspace overview.
 * Uses SingleColumnLayout with modular components.
 */

"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AlertCircle, Users, CheckSquare, FolderKanban, FileText } from "lucide-react"

// Layout
import { SingleColumnLayout } from "@/frontend/shared/ui/layout/container"
import { OverviewHeader } from "./views/OverviewHeader"

// Modular components
import { 
  StatsGrid, 
  TimeRangeSelector, 
  RecentActivitySection, 
  QuickActionsSection,
  DEFAULT_QUICK_ACTIONS,
  TeamCompositionSection,
  OverviewSkeleton,
  type TimeRange,
  type ActivityItem
} from "./components"

// Types
import type { OverviewData } from "./types"
import type { ActivityType } from "./components"

// ============================================================================
// Helpers
// ============================================================================

function mapActivityType(actionOrType: string): ActivityType {
  const action = actionOrType?.toLowerCase() || ""
  
  if (action.includes("document") || action.includes("doc")) return "document"
  if (action.includes("task")) return "task"
  if (action.includes("message") || action.includes("comment")) return "message"
  if (action.includes("member") || action.includes("user") || action.includes("invite")) return "member"
  if (action.includes("setting")) return "settings"
  
  return "general"
}

// ============================================================================
// Types
// ============================================================================

interface OverviewViewProps {
  workspaceId?: Id<"workspaces"> | null
  mockData?: OverviewData
}

// Type compatible with analytics query
type AnalyticsTimeRange = "today" | "7d" | "30d" | "90d"

// ============================================================================
// Overview View Component
// ============================================================================

export function OverviewView({ workspaceId, mockData }: OverviewViewProps) {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d")

  const shouldUseRealData = !mockData && !!workspaceId

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    shouldUseRealData && workspaceId ? { workspaceId } : "skip"
  )

  const members = useQuery(
    api.workspace.workspaces.getWorkspaceMembers,
    shouldUseRealData && workspaceId ? { workspaceId } : "skip"
  )

  const analytics = useQuery(
    api.features.analytics.queries.getOverview,
    shouldUseRealData && workspaceId ? { workspaceId, timeRange: timeRange as AnalyticsTimeRange } : "skip"
  )

  // ============================================================================
  // Empty & Loading States
  // ============================================================================

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

  if (shouldUseRealData && (workspace === undefined || members === undefined)) {
    return <OverviewSkeleton />
  }

  // ============================================================================
  // Data Mapping
  // ============================================================================

  const activeUsers = mockData?.members?.total ?? analytics?.members?.total ?? members?.length ?? 0
  const tasksTotal = mockData?.tasks?.total ?? analytics?.tasks?.total ?? 0
  const tasksCompleted = mockData?.tasks?.completed ?? analytics?.tasks?.completed ?? 0
  const projectsTotal = mockData?.projects?.total ?? analytics?.projects?.total ?? 0
  const projectsActive = mockData?.projects?.active ?? analytics?.projects?.active ?? 0
  const documentsCount = mockData?.documents ?? analytics?.documents ?? 0

  const rawActivity = mockData?.recentActivity ?? analytics?.recentActivity ?? []
  const roles = mockData?.members?.roles ?? analytics?.members?.roles ?? {}
  const lastUpdated = mockData?.generatedAt ?? analytics?.generatedAt

  // Transform raw activity to ActivityItem format
  const recentActivity: ActivityItem[] = rawActivity.map((activity: any, index: number) => ({
    id: activity._id || `activity-${index}`,
    type: mapActivityType(activity.action || activity.type),
    title: activity.action || activity.type || "Activity",
    description: activity.details || undefined,
    timestamp: activity.timestamp || Date.now(),
    user: activity.userName ? { name: activity.userName } : undefined,
  }))

  // Stats configuration
  const stats = [
    {
      title: "Team Members",
      value: activeUsers,
      description: "Active members",
      icon: Users,
      iconBgClass: "bg-blue-100 dark:bg-blue-900/20",
      iconColorClass: "text-blue-600",
      badges: Object.entries(roles).map(([role, count]) => ({
        label: role,
        count: count as number,
      })),
    },
    {
      title: "Tasks",
      value: tasksTotal,
      description: `${tasksCompleted} completed`,
      icon: CheckSquare,
      iconBgClass: "bg-green-100 dark:bg-green-900/20",
      iconColorClass: "text-green-600",
      trend: tasksTotal > 0 
        ? { value: Math.round((tasksCompleted / tasksTotal) * 100), label: "completion rate", isPositive: true }
        : undefined,
    },
    {
      title: "Projects",
      value: projectsTotal,
      description: `${projectsActive} active`,
      icon: FolderKanban,
      iconBgClass: "bg-purple-100 dark:bg-purple-900/20",
      iconColorClass: "text-purple-600",
    },
    {
      title: "Documents",
      value: documentsCount,
      description: "Total documents",
      icon: FileText,
      iconBgClass: "bg-orange-100 dark:bg-orange-900/20",
      iconColorClass: "text-orange-600",
    },
  ]

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleRefresh = () => {
    setTimeRange((prev: AnalyticsTimeRange) => prev)
  }

  const handleOpenSettings = () => {
    window.dispatchEvent(
      new CustomEvent("open-settings", {
        detail: {
          tab: "features",
          id: "ft_settings"
        }
      })
    )
  }

  const quickActions = DEFAULT_QUICK_ACTIONS.map(action => {
    if (action.id === "settings") {
      return {
        ...action,
        onClick: handleOpenSettings
      }
    }
    return action
  })

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SingleColumnLayout
      maxWidth="full"
      padding="none"
      header={<OverviewHeader onRefresh={handleRefresh} />}
    >
      <div className="flex flex-col gap-6 p-6">
        {/* Time Range Selector */}
        <TimeRangeSelector
          value={timeRange}
          onChange={(v) => setTimeRange(v as AnalyticsTimeRange)}
          options={["today", "7d", "30d", "90d"]}
          lastUpdated={lastUpdated}
        />

        {/* Stats Grid */}
        <StatsGrid stats={stats} />

        {/* Two Column Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <RecentActivitySection activities={recentActivity} />

          {/* Team Composition */}
          <TeamCompositionSection roles={roles} />
        </div>

        {/* Quick Actions */}
        <QuickActionsSection actions={quickActions} />
      </div>
    </SingleColumnLayout>
  )
}
