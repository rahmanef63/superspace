import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

/**
 * Mutations for sales feature
 */

export const createDeal = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        title: v.string(),
        value: v.number(),
    },
    handler: async (ctx, args) => {
        // ✅ REQUIRED: Check permission
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        // TODO: Implement deal creation logic
        // const dealId = await ctx.db.insert("sales_deals", { ... })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.deal.create",
            resourceType: "sales_deal",
            resourceId: "temp_id",
            metadata: { title: args.title }
        })

        return {
            success: true,
            message: "Deal creation - not yet implemented",
        }
    },
})
