/**
 * Workspace Storage Mutations
 * 
 * Handle logo upload and deletion for workspaces.
 */

import { v } from "convex/values"
import { mutation, query } from "../_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"
import { requirePermission } from "../auth/helpers"
import { PERMS } from "./permissions"

// Max file size: 1MB
const MAX_LOGO_SIZE = 1 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp",
]

/**
 * Generate upload URL for workspace logo
 */
export const generateLogoUploadUrl = mutation({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error("Not authenticated")

        // Check permission to manage workspace
        await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

        // Generate upload URL
        return await ctx.storage.generateUploadUrl()
    },
})

/**
 * Save uploaded logo to workspace
 */
export const saveWorkspaceLogo = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error("Not authenticated")

        await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

        const workspace = await ctx.db.get(args.workspaceId)
        if (!workspace) throw new Error("Workspace not found")

        // Delete old logo if exists
        if (workspace.logoStorageId) {
            await ctx.storage.delete(workspace.logoStorageId)
        }

        // Update workspace with new logo
        await ctx.db.patch(args.workspaceId, {
            logoStorageId: args.storageId,
        })

        return args.storageId
    },
})

/**
 * Delete workspace logo
 */
export const deleteWorkspaceLogo = mutation({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error("Not authenticated")

        await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

        const workspace = await ctx.db.get(args.workspaceId)
        if (!workspace) throw new Error("Workspace not found")

        if (workspace.logoStorageId) {
            await ctx.storage.delete(workspace.logoStorageId)
            await ctx.db.patch(args.workspaceId, {
                logoStorageId: undefined,
            })
        }

        return true
    },
})

/**
 * Get logo URL for workspace
 */
export const getWorkspaceLogoUrl = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.workspaceId)
        if (!workspace?.logoStorageId) return null

        return await ctx.storage.getUrl(workspace.logoStorageId)
    },
})

/**
 * Update workspace theme preset
 */
export const updateWorkspaceTheme = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        themePreset: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) throw new Error("Not authenticated")

        await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)

        await ctx.db.patch(args.workspaceId, {
            themePreset: args.themePreset,
        })

        return args.workspaceId
    },
})

/**
 * Get effective theme for workspace (with inheritance)
 */
export const getWorkspaceEffectiveTheme = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.workspaceId)
        if (!workspace) return null

        // If workspace has its own theme, use it
        if (workspace.themePreset) {
            return {
                themePreset: workspace.themePreset,
                inheritedFrom: null,
            }
        }

        // Check parent workspace for inherited theme
        if (workspace.parentWorkspaceId) {
            const parent = await ctx.db.get(workspace.parentWorkspaceId)
            if (parent?.themePreset) {
                return {
                    themePreset: parent.themePreset,
                    inheritedFrom: parent._id,
                }
            }
        }

        // Return null (use user's global preference)
        return {
            themePreset: null,
            inheritedFrom: null,
        }
    },
})
