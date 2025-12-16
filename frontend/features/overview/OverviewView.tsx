/**
 * Overview View
 * 
 * Main dashboard view for workspace overview.
 * Uses SingleColumnLayout with modular components.
 * 
 * Features comprehensive sections:
 * - Stats Grid with key metrics
 * - Recent Activity feed
 * - Recent Items (docs, tasks accessed)
 * - Upcoming Events (calendar, deadlines)
 * - AI Quick Chat for assistance
 * - Team Composition
 */

"use client"

import { useState, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AlertCircle, Users, CheckSquare, FolderKanban, FileText } from "lucide-react"
import { getFeatureRoute } from "@/frontend/shared/foundation/utils"

// Layout
import { SingleColumnLayout } from "@/frontend/shared/ui/layout/container"
import { OverviewHeader } from "./views/OverviewHeader"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"

// Modular components
import {
  StatsGrid,
  TimeRangeSelector,
  RecentActivitySection,
  TeamCompositionSection,
  RecentItemsSection,
  UpcomingEventsSection,
  AIQuickChatSection,
  OverviewSkeleton,
  type TimeRange,
  type ActivityItem,
  type RecentItem,
  type UpcomingEvent,
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
  mockData?: OverviewData & {
    recentItems?: RecentItem[]
    upcomingEvents?: UpcomingEvent[]
  }
}

// Type compatible with analytics query
type AnalyticsTimeRange = "today" | "7d" | "30d" | "90d"

// ============================================================================
// Overview View Component
// ============================================================================

export function OverviewView({ workspaceId, mockData }: OverviewViewProps) {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d")
  const [aiResponse, setAiResponse] = useState<string | undefined>()
  const [aiLoading, setAiLoading] = useState(false)
  const [isAIPanelOpen, setAIPanelOpen] = useState(false)

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

  const overviewData = useQuery(
    api.features.overview.queries.getData,
    shouldUseRealData && workspaceId ? { workspaceId } : "skip"
  )

  const upcomingEventsData = useQuery(
    api.features.overview.queries.getUpcomingEvents,
    shouldUseRealData && workspaceId ? { workspaceId, days: 14 } : "skip"
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

  const activeUsers = mockData?.members?.total ?? overviewData?.stats?.activeMembers ?? members?.length ?? 0
  const tasksTotal = mockData?.tasks?.total ?? overviewData?.stats?.totalTasks ?? 0
  const tasksCompleted = mockData?.tasks?.completed ?? overviewData?.stats?.completedTasks ?? 0
  const projectsTotal = mockData?.projects?.total ?? overviewData?.stats?.totalProjects ?? 0
  const projectsActive = mockData?.projects?.active ?? overviewData?.stats?.activeProjects ?? 0
  const documentsCount = mockData?.documents ?? overviewData?.stats?.totalDocuments ?? 0

  const rawActivity = mockData?.recentActivity ?? overviewData?.recentActivity ?? []
  const roles = mockData?.members?.roles ?? overviewData?.workspace?.roles ?? {}
  const lastUpdated = mockData?.generatedAt ?? Date.now() // overviewData doesn't have generatedAt

  // Transform raw activity to ActivityItem format
  const recentActivity: ActivityItem[] = rawActivity.map((activity: any, index: number) => ({
    id: activity._id || `activity-${index}`,
    type: mapActivityType(activity.action || activity.type),
    title: activity.action || activity.type || "Activity",
    description: activity.details || undefined,
    timestamp: activity.timestamp || Date.now(),
    user: activity.userName ? { name: activity.userName } : undefined,
  }))

  // Route helper - now using centralized utility
  // const getRoute = (type: string, id: string) => { ... } // Replaced by getFeatureRoute

  // Recent items (from mock data or generate from activity)
  const recentItems: RecentItem[] = mockData?.recentItems ?? recentActivity.slice(0, 5).map((activity) => ({
    id: activity.id,
    type: activity.type === "document" ? "document" :
      activity.type === "task" ? "task" :
        activity.type === "message" ? "message" : "other",
    title: activity.title,
    subtitle: activity.description,
    timestamp: activity.timestamp,
    href: getFeatureRoute(activity.type, activity.id),
  }))

  // Upcoming events (from mock data or real query)
  // We map the query result to ensure types match strictly if needed, 
  // currently the query returns properties matching UpcomingEvent (except date string vs number).
  // The query returns `startTime` as number (from query).
  const upcomingEvents: UpcomingEvent[] = mockData?.upcomingEvents ?? upcomingEventsData?.map((e: any) => ({
    ...e,
    startTime: e.startTime, // Ensure type compatibility
    href: getFeatureRoute(e.type, e.id),
  })) ?? []

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

  const handleAIMessage = async (message: string) => {
    setAiLoading(true)
    setAiResponse(undefined)

    try {
      // Open AI chat panel with the message
      window.dispatchEvent(
        new CustomEvent("open-ai-chat", {
          detail: {
            feature: "overview",
            initialMessage: message
          }
        })
      )

      // Simple response for now - in production this would call the AI API
      setTimeout(() => {
        setAiResponse(`I'll help you with: "${message}". Opening the full AI chat for a detailed response...`)
        setAiLoading(false)
      }, 1000)
    } catch (error) {
      setAiResponse("Sorry, I couldn't process that. Please try the full AI chat.")
      setAiLoading(false)
    }
  }



  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <OverviewHeader
        onRefresh={handleRefresh}
        onToggleAI={() => setAIPanelOpen(!isAIPanelOpen)}
        isAIPanelOpen={isAIPanelOpen}
      />

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full border-t">
          <ResizablePanel defaultSize={75} minSize={30}>
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-6 p-6 pb-20">
                {/* Time Range Selector */}
                <TimeRangeSelector
                  value={timeRange}
                  onChange={(v) => setTimeRange(v as AnalyticsTimeRange)}
                  options={["today", "7d", "30d", "90d"]}
                  lastUpdated={lastUpdated}
                />

                {/* Stats Grid */}
                <StatsGrid stats={stats} />

                {/* Two Column Layout - Activity & Team */}
                <div className="grid gap-6 md:grid-cols-2">
                  <RecentActivitySection activities={recentActivity} />
                  <TeamCompositionSection roles={roles} />
                </div>

                {/* Two Column Layout - Recent Items & Upcoming Events */}
                <div className="grid gap-6 md:grid-cols-2">
                  <RecentItemsSection items={recentItems} />
                  <UpcomingEventsSection events={upcomingEvents} />
                </div>
              </div>
            </ScrollArea>
          </ResizablePanel>

          {isAIPanelOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={50} className="bg-muted/5">
                <div className="h-full border-l p-4 flex flex-col">
                  <AIQuickChatSection
                    onSendMessage={handleAIMessage}
                    response={aiResponse}
                    isLoading={aiLoading}
                    compact={true}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
