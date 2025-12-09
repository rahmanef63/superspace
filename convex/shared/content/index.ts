/**
 * Shared Content Module
 * 
 * Centralized content management for all workspace assets.
 * 
 * Usage from other features:
 * ```ts
 * import { api } from "@/convex/_generated/api"
 * 
 * // Query content
 * const content = await ctx.runQuery(api.shared.content.queries.list, { workspaceId })
 * 
 * // Create content
 * const contentId = await ctx.runMutation(api.shared.content.mutations.create, { ... })
 * ```
 */

export * from "./schema";
export * from "./queries";
export * from "./mutations";
