import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

/**
 * Mutations for communications feature
 */

export const createChannel = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        type: v.optional(v.string()), // public, private
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // ✅ REQUIRED: Check permission
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_MANAGE
        )

        // TODO: Implement channel creation (waiting for schema)
        // const channelId = await ctx.db.insert("channels", { ... })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.channel.create",
            resourceType: "channel",
            resourceId: "temp_id",
            metadata: { name: args.name }
        })

        return {
            success: true,
            message: "Channel creation - not yet implemented",
        }
    },
})

export const sendMessage = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.string(), // ID or slug
        content: v.string(),
    },
    handler: async (ctx, args) => {
        // Basic perm check
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW // Sending messages usually requires view access + membership
        )

        // TODO: Implement message sending

        // Optionally log high-volume events? Maybe not for chat.
        // But per rule: "EVERY mutation MUST log audit events".
        // For chat, this might be noisy. But sticking to rule:
        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.message.send",
            resourceType: "message",
            resourceId: "temp_msg_id",
        })

        return { success: true }
    }
})
