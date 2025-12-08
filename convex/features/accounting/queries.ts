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
    // ✅ REQUIRED: Check workspace membership
    const { membership, role } = await requireActiveMembership(ctx, args.workspaceId)

    // TODO: Implement your query logic
    return {
      message: "Query successful",
      userId: membership.userDocId,
      role: role.name,
    }
  },
})
