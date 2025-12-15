import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

/**
 * Mutations for inventory feature
 */

export const createItem = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        sku: v.string(),
        quantity: v.number(),
        price: v.number(),
    },
    handler: async (ctx, args) => {
        // ✅ REQUIRED: Check permission
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.INVENTORY_MANAGE
        )

        // TODO: Implement inventory item creation logic
        // const itemId = await ctx.db.insert("inventoryItems", { ... })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "inventory.item.create",
            resourceType: "inventoryItem",
            resourceId: "temp_id",
            metadata: { sku: args.sku, name: args.name }
        })

        return {
            success: true,
            message: "Inventory item creation - not yet implemented",
        }
    },
})
