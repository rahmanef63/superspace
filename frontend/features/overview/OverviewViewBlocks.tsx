/**
 * Overview View (Refactored with Shared Blocks)
 * 
 * Uses shared block components from frontend/shared/builder/blocks.
 * 
 * Block Structure:
 * - shared/     - Reusable utilities (EmptyState, BlockCard, etc.)
 * - Activity/   - Activity feed block
 * - Stats/      - Stats grid block
 * - Events/     - Upcoming events block
 * - Team/       - Team composition block
 * - List/       - Generic list block
 * - TimeRange/  - Time range selector
 * - Agent/      - AI Assistant panel
 */

"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AlertCircle } from "lucide-react"
import { getFeatureRoute } from "@/frontend/shared/foundation/utils"

// Layout
import { OverviewHeader } from "./views/OverviewHeader"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"

// ============================================================================
// SHARED BLOCKS - New Structure Import
// ============================================================================
import {
    // Block Components
    StatsBlock,
    ActivityBlock,
    ListBlock,
    EventsBlock,
    TimeRangeBlock,
    TeamBlock,
    AgentBlock,
    // Types
    type TimeRange,
    type ActivityItem,
    type ListItem,
    type EventItem,
    type ActivityType,
} from "@/frontend/shared/builder/blocks"

// Local components
import { OverviewSkeleton } from "./components"

// Types
import type { OverviewData } from "./types"

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

interface OverviewViewBlocksProps {
    workspaceId?: Id<"workspaces"> | null
    mockData?: OverviewData & {
        recentItems?: ListItem[]
        upcomingEvents?: EventItem[]
    }
}

type AnalyticsTimeRange = "today" | "7d" | "30d" | "90d"

// ============================================================================
// Overview View with Shared Blocks
// ============================================================================

export function OverviewViewBlocks({ workspaceId, mockData }: OverviewViewBlocksProps) {
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
    const lastUpdated = mockData?.generatedAt ?? Date.now()

    // Transform to ActivityItem format (using shared block type)
    const recentActivity: ActivityItem[] = rawActivity.map((activity: any, index: number) => ({
        id: activity._id || `activity-${index}`,
        type: mapActivityType(activity.action || activity.type),
        title: activity.action || activity.type || "Activity",
        description: activity.details || undefined,
        timestamp: activity.timestamp || Date.now(),
        user: activity.userName ? { name: activity.userName } : undefined,
    }))

    // Recent items (using shared block type)
    const recentItems: ListItem[] = mockData?.recentItems ?? recentActivity.slice(0, 5).map((activity) => ({
        id: activity.id,
        type: activity.type === "document" ? "document" :
            activity.type === "task" ? "task" :
                activity.type === "message" ? "message" : "other",
        title: activity.title,
        subtitle: activity.description,
        timestamp: activity.timestamp,
        href: getFeatureRoute(activity.type, activity.id),
    }))

    // Upcoming events (using shared block type)
    const upcomingEvents: EventItem[] = mockData?.upcomingEvents ?? upcomingEventsData?.map((e: any) => ({
        ...e,
        startTime: e.startTime,
        href: getFeatureRoute(e.type, e.id),
    })) ?? []

    // Stats configuration (using icon names as strings for the shared block)
    const stats = [
        {
            title: "Team Members",
            value: activeUsers,
            description: "Active members",
            icon: "Users",
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
            icon: "CheckSquare",
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
            icon: "FolderKanban",
            iconBgClass: "bg-purple-100 dark:bg-purple-900/20",
            iconColorClass: "text-purple-600",
        },
        {
            title: "Documents",
            value: documentsCount,
            description: "Total documents",
            icon: "FileText",
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
            window.dispatchEvent(
                new CustomEvent("open-ai-chat", {
                    detail: {
                        feature: "overview",
                        initialMessage: message
                    }
                })
            )

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
                                <TimeRangeBlock
                                    value={timeRange}
                                    onChange={(v) => setTimeRange(v as AnalyticsTimeRange)}
                                    options={["today", "7d", "30d", "90d"]}
                                    lastUpdated={lastUpdated}
                                />

                                {/* Stats Grid */}
                                <StatsBlock stats={stats} columns={4} />

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Activity */}
                                    <ActivityBlock activities={recentActivity} />

                                    {/* Team */}
                                    <TeamBlock roles={roles} />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Recent Items */}
                                    <ListBlock items={recentItems} />

                                    {/* Events */}
                                    <EventsBlock events={upcomingEvents} />
                                </div>
                            </div>
                        </ScrollArea>
                    </ResizablePanel>

                    {isAIPanelOpen && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={25} minSize={20} maxSize={50} className="bg-muted/5">
                                <AgentBlock
                                    agentName="Overview Assistant"
                                    description="Helps summarize workspace activity, understand dashboard data, and navigate your workspace."
                                    featureSlug="overview"
                                    suggestions={[
                                        "What can you help me with?",
                                        "Show me what's new",
                                        "Help me get started"
                                    ]}
                                    toolCount={6}
                                    response={aiResponse}
                                    loading={aiLoading}
                                    onSendMessage={handleAIMessage}
                                    className="h-full border-l rounded-none"
                                />
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>
        </div>
    )
}

export default OverviewViewBlocks
