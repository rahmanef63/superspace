import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for accounting feature
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Return default accounting data structure
    // In a real implementation, this would query actual accounting tables
    return {
      stats: {
        totalRevenue: 0,
        netProfit: 0,
        pendingInvoices: 0,
        expenses: 0,
        cashBalance: 0,
      },
      recentTransactions: [],
      recentInvoices: [],
    }
  },
})
