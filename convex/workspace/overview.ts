/**
 * Workspace Overview API
 * 
 * Provides aggregated data queries for the Main Workspace overview.
 * Aggregates activity, stats, and notifications from all child workspaces.
 * 
 * @module convex/workspace/overview
 */

import { v } from "convex/values"
import { query } from "../_generated/server"
import { ensureUser } from "../auth/helpers"
import type { Id, Doc } from "../_generated/dataModel"

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceSummary {
  workspace: Doc<"workspaces">
  isLinked: boolean
  link?: Doc<"workspaceLinks">
  stats: {
    memberCount: number
    documentCount: number
    recentActivityCount: number
    unreadNotificationCount: number
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: number
    actorName?: string
  }>
}

export interface AggregatedReport {
  totalWorkspaces: number
  totalMembers: number
  totalDocuments: number
  totalActivity: number
  workspaceBreakdown: Array<{
    workspaceId: Id<"workspaces">
    workspaceName: string
    color?: string
    memberCount: number
    documentCount: number
    activityCount: number
  }>
  activityTimeline: Array<{
    date: string
    count: number
  }>
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Get summaries for all child workspaces of a main workspace
 * Used for the Main Workspace overview dashboard
 */
export const getChildWorkspaceSummaries = query({
  args: {
    mainWorkspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    const limit = args.limit ?? 10
    
    // Verify this is the user's main workspace
    const mainWorkspace = await ctx.db.get(args.mainWorkspaceId)
    if (!mainWorkspace || !mainWorkspace.isMainWorkspace) {
      return []
    }
    if (String(mainWorkspace.createdBy) !== String(userId)) {
      return []
    }
    
    // Get direct children
    const directChildren = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .take(limit)
    
    // Get linked children
    const links = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .take(limit)
    
    const linkedChildren = await Promise.all(
      links.map(async (link) => {
        const workspace = await ctx.db.get(link.childWorkspaceId)
        return workspace ? { workspace, link, isLinked: true } : null
      })
    ).then(arr => arr.filter(Boolean))
    
    // Build summaries for each child
    const summaries: WorkspaceSummary[] = []
    
    // Process direct children
    for (const workspace of directChildren) {
      const summary = await buildWorkspaceSummary(ctx, workspace, false)
      summaries.push(summary)
    }
    
    // Process linked children
    for (const item of linkedChildren) {
      if (!item) continue
      const summary = await buildWorkspaceSummary(ctx, item.workspace, true, item.link)
      summaries.push(summary)
    }
    
    // Sort by recent activity
    summaries.sort((a, b) => {
      const aLatest = a.recentActivity[0]?.timestamp ?? 0
      const bLatest = b.recentActivity[0]?.timestamp ?? 0
      return bLatest - aLatest
    })
    
    return summaries.slice(0, limit)
  },
})

/**
 * Get aggregated reports from all child workspaces
 * Provides metrics and trends for the overview dashboard
 */
export const getAggregatedReports = query({
  args: {
    mainWorkspaceId: v.id("workspaces"),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    // Verify this is the user's main workspace
    const mainWorkspace = await ctx.db.get(args.mainWorkspaceId)
    if (!mainWorkspace || !mainWorkspace.isMainWorkspace) {
      return null
    }
    if (String(mainWorkspace.createdBy) !== String(userId)) {
      return null
    }
    
    // Default to last 30 days
    const now = Date.now()
    const start = args.dateRange?.start ?? now - 30 * 24 * 60 * 60 * 1000
    const end = args.dateRange?.end ?? now
    
    // Get all child workspaces (direct + linked)
    const directChildren = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
    
    const links = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
    
    const linkedWorkspaceIds = links.map(l => l.childWorkspaceId)
    const linkedWorkspaces = await Promise.all(
      linkedWorkspaceIds.map(id => ctx.db.get(id))
    ).then(arr => arr.filter(Boolean) as Doc<"workspaces">[])
    
    const allChildren = [...directChildren, ...linkedWorkspaces]
    
    // Aggregate stats
    let totalMembers = 0
    let totalDocuments = 0
    let totalActivity = 0
    const workspaceBreakdown: AggregatedReport["workspaceBreakdown"] = []
    const activityByDate: Record<string, number> = {}
    
    for (const workspace of allChildren) {
      // Only include workspaces that share data to parent
      if (workspace.shareDataToParent === false) continue
      
      // Count members
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect()
      const memberCount = memberships.length
      totalMembers += memberCount
      
      // Count documents
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .collect()
      const documentCount = documents.length
      totalDocuments += documentCount
      
      // Count activity in date range
      const activities = await ctx.db
        .query("activityEvents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .filter((q) => 
          q.and(
            q.gte(q.field("createdAt"), start),
            q.lte(q.field("createdAt"), end)
          )
        )
        .collect()
      const activityCount = activities.length
      totalActivity += activityCount
      
      // Track activity by date
      for (const activity of activities) {
        const date = new Date(activity.createdAt).toISOString().split("T")[0]
        activityByDate[date] = (activityByDate[date] ?? 0) + 1
      }
      
      workspaceBreakdown.push({
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        color: workspace.color,
        memberCount,
        documentCount,
        activityCount,
      })
    }
    
    // Build activity timeline
    const activityTimeline = Object.entries(activityByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    const report: AggregatedReport = {
      totalWorkspaces: allChildren.length,
      totalMembers,
      totalDocuments,
      totalActivity,
      workspaceBreakdown: workspaceBreakdown.sort((a, b) => b.activityCount - a.activityCount),
      activityTimeline,
    }
    
    return report
  },
})

/**
 * Get aggregated notifications from child workspaces
 */
export const getChildWorkspaceNotifications = query({
  args: {
    mainWorkspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    const limit = args.limit ?? 20
    
    // Verify this is the user's main workspace
    const mainWorkspace = await ctx.db.get(args.mainWorkspaceId)
    if (!mainWorkspace || !mainWorkspace.isMainWorkspace) {
      return []
    }
    if (String(mainWorkspace.createdBy) !== String(userId)) {
      return []
    }
    
    // Get all child workspace IDs
    const directChildren = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
    
    const links = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
    
    const allWorkspaceIds = [
      ...directChildren.map(w => w._id),
      ...links.map(l => l.childWorkspaceId),
    ]
    
    // Get notifications for user from all child workspaces
    const allNotifications: Array<Doc<"notifications"> & { workspace: Doc<"workspaces"> }> = []
    
    for (const workspaceId of allWorkspaceIds) {
      const workspace = await ctx.db.get(workspaceId)
      if (!workspace) continue
      
      // Only include if sharing data to parent
      if (workspace.shareDataToParent === false) continue
      
      // Query notifications by workspace and filter by user
      let notificationsForWorkspace = await ctx.db
        .query("notifications")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect()
      
      if (args.unreadOnly) {
        notificationsForWorkspace = notificationsForWorkspace.filter((n) => !n.isRead)
      }
      
      for (const notification of notificationsForWorkspace.slice(0, limit)) {
        allNotifications.push({ ...notification, workspace })
      }
    }
    
    // Sort by creation time and limit
    return allNotifications
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit)
  },
})

/**
 * Get quick stats for main workspace header
 */
export const getMainWorkspaceQuickStats = query({
  args: {
    mainWorkspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    // Verify this is the user's main workspace
    const mainWorkspace = await ctx.db.get(args.mainWorkspaceId)
    if (!mainWorkspace || !mainWorkspace.isMainWorkspace) {
      return null
    }
    if (String(mainWorkspace.createdBy) !== String(userId)) {
      return null
    }
    
    // Count child workspaces
    const directChildCount = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
      .then(arr => arr.length)
    
    const linkedChildCount = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
      .then(arr => arr.length)
    
    // Count unread notifications across all children
    const allWorkspaceIds: Id<"workspaces">[] = []
    
    const directChildren = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
    allWorkspaceIds.push(...directChildren.map(w => w._id))
    
    const links = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.mainWorkspaceId))
      .collect()
    allWorkspaceIds.push(...links.map(l => l.childWorkspaceId))
    
    let unreadNotifications = 0
    for (const wsId of allWorkspaceIds) {
      const notificationsForWs = await ctx.db
        .query("notifications")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", wsId))
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), userId),
            q.eq(q.field("isRead"), false)
          )
        )
        .collect()
      unreadNotifications += notificationsForWs.length
    }
    
    return {
      totalChildWorkspaces: directChildCount + linkedChildCount,
      ownedWorkspaces: directChildCount,
      linkedWorkspaces: linkedChildCount,
      unreadNotifications,
    }
  },
})

// ============================================================================
// Helpers
// ============================================================================

async function buildWorkspaceSummary(
  ctx: any,
  workspace: Doc<"workspaces">,
  isLinked: boolean,
  link?: Doc<"workspaceLinks">
): Promise<WorkspaceSummary> {
  // Get member count
  const memberships = await ctx.db
    .query("workspaceMemberships")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .filter((q: any) => q.eq(q.field("status"), "active"))
    .collect()
  
  // Get document count
  const documents = await ctx.db
    .query("documents")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .collect()
  
  // Get recent activity (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentActivities = await ctx.db
    .query("auditLogs")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspace._id))
    .filter((q: any) => q.gte(q.field("timestamp"), sevenDaysAgo))
    .order("desc")
    .take(5)
  
  // Format activities
  const recentActivity = await Promise.all(
    recentActivities.map(async (activity: any) => {
      let actorName: string | undefined
      if (activity.actorUserId) {
        const actor = await ctx.db.get(activity.actorUserId)
        actorName = actor?.name
      }
      return {
        type: activity.action,
        description: activity.details || activity.action,
        timestamp: activity.timestamp,
        actorName,
      }
    })
  )
  
  // Count unread notifications (would need user context)
  // For now, just return 0
  const unreadNotificationCount = 0
  
  return {
    workspace,
    isLinked,
    link,
    stats: {
      memberCount: memberships.length,
      documentCount: documents.length,
      recentActivityCount: recentActivities.length,
      unreadNotificationCount,
    },
    recentActivity,
  }
}
