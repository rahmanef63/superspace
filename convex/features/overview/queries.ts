import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Overview Queries
 * Dashboard aggregation for workspace overview
 */

// Get workspace overview data
export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get workspace info
    const workspace = await ctx.db.get(args.workspaceId)

    // Get member count (workspaceMemberships table)
    const members = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const activeMembers = members.filter((m) => m.status === "active")

    // Get tasks stats (handles both content and CRM task schemas)
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const completedTasks = tasks.filter((t) => t.status === "completed")
    const pendingTasks = tasks.filter((t) => t.status === "todo" || t.status === "not-started")
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress")

    // Get recent activity from audit logs
    const recentActivity = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(10)

    // Get projects count (status: "planning" | "active" | "on_hold" | "completed" | "archived")
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const activeProjects = projects.filter((p) => p.status === "active")

    // Get documents/files count
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return {
      workspace: {
        name: workspace?.name || "Workspace",
        createdAt: workspace?._creationTime,
        roles: members.reduce((acc: any, m: any) => {
          const role = m.role || "member"
          acc[role] = (acc[role] || 0) + 1
          return acc
        }, {}),
      },
      stats: {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        taskCompletionRate:
          tasks.length > 0
            ? Math.round((completedTasks.length / tasks.length) * 100)
            : 0,
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalDocuments: documents.length,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a._id,
        entityId: a.entityId, // Add entityId for navigation
        action: a.action,
        actor: a.userEmail || "System",
        timestamp: a.timestamp || a._creationTime,
        resourceType: a.entityType,
      })),
    }
  },
})

// Get upcoming events (calendar + tasks)
export const getUpcomingEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const days = args.days || 14
    const now = Date.now()
    const endDate = now + days * 24 * 60 * 60 * 1000

    // 1. Get Calendar Events
    const calendarEvents = await ctx.db
      .query("calendar")
      .withIndex("by_workspace_start", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("startsAt"), now))
      .filter((q) => q.lte(q.field("startsAt"), endDate))
      .collect()

    // 2. Get Tasks with Due Dates
    // We want Overdue tasks too, so we don't filter by start date > now for tasks, 
    // but rather tasks that are NOT completed and have due date.
    // However, for "upcoming" logic, showing overdue is good.
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .filter((q) => q.neq(q.field("dueDate"), undefined))
      .collect()

    const relevantTasks = tasks.filter((t: any) => {
      // Include overdue and upcoming within range
      return t.dueDate && t.dueDate <= endDate
    })

    // 3. Normalize and Merge
    const events = [
      ...calendarEvents.map((e: any) => ({
        id: e._id,
        type: "event",
        title: e.title,
        description: e.description,
        startTime: e.startsAt,
        endTime: e.endsAt,
        isAllDay: e.isAllDay,
        color: e.color,
      })),
      ...relevantTasks.map((t: any) => ({
        id: t._id,
        type: "task", // Used for icon/color mapping
        title: t.title,
        description: t.description, // or status
        startTime: t.dueDate!,
        isAllDay: true, // Tasks usually treated as all-day for deadline
        completed: t.status === "completed",
      }))
    ]

    // 4. Sort by time
    return events.sort((a, b) => a.startTime - b.startTime)
  }
})

// Get quick stats for dashboard cards
export const getQuickStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Calculate stats for the last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    // Tasks created this week
    const recentTasks = await ctx.db
      .query("tasks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("_creationTime"), sevenDaysAgo))
      .collect()

    // Tasks completed this week (status: "completed")
    const completedThisWeek = recentTasks.filter(
      (t) => t.status === "completed"
    )

    // Active automations
    const automations = await ctx.db
      .query("automationRules")
      .withIndex("by_active", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("isActive", true)
      )
      .collect()

    // Pending approvals
    const pendingApprovals = await ctx.db
      .query("approvalRequests")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect()

    // Unread notifications (approximate - would need user context)
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .take(100)

    return {
      tasksCreatedThisWeek: recentTasks.length,
      tasksCompletedThisWeek: completedThisWeek.length,
      activeAutomations: automations.length,
      pendingApprovals: pendingApprovals.length,
      unreadNotifications: notifications.length,
    }
  },
})

// Get activity timeline for charts
export const getActivityTimeline = query({
  args: {
    workspaceId: v.id("workspaces"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const days = args.days || 7
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000

    // Get audit logs for the period
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) =>
        q.gte(q.field("timestamp"), startDate)
      )
      .collect()

    // Group by day
    const activityByDay: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split("T")[0]
      activityByDay[dateKey] = 0
    }

    logs.forEach((log) => {
      const dateKey = new Date(log.timestamp || log._creationTime)
        .toISOString()
        .split("T")[0]
      if (activityByDay[dateKey] !== undefined) {
        activityByDay[dateKey]++
      }
    })

    return Object.entries(activityByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },
})

// Get top contributors
export const getTopContributors = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const limit = args.limit || 5

    // Get recent audit logs
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(500)

    // Count by user
    const userCounts: Record<string, { count: number; email: string }> = {}
    logs.forEach((log) => {
      const userId = log.userId?.toString() || "system"
      if (!userCounts[userId]) {
        userCounts[userId] = { count: 0, email: log.userEmail || "Unknown" }
      }
      userCounts[userId].count++
    })

    // Sort and return top contributors
    return Object.entries(userCounts)
      .map(([userId, data]) => ({
        userId,
        email: data.email,
        activityCount: data.count,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, limit)
  },
})
