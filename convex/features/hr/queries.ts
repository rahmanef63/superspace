import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for hr feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get workspace members as employees
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()

    // Get user details for members
    const employees = await Promise.all(
      memberships.slice(0, 10).map(async (m) => {
        const user = await ctx.db.get(m.userId)
        return {
          id: m._id,
          name: user?.name || user?.email || "Unknown",
          role: "Member",
          department: "General",
          status: "active" as const,
          avatar: user?.avatarUrl || user?.image,
        }
      })
    )

    return {
      stats: {
        totalEmployees: memberships.length,
        onLeave: 0,
        openPositions: 0,
        newHires: memberships.filter(m => {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
          return m._creationTime > thirtyDaysAgo
        }).length,
        departmentCount: 1,
      },
      recentHires: employees,
      leaveRequests: [],
    }
  },
})
