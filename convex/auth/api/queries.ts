import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId } from "../helpers";

/**
 * Get the current user's membership info for a workspace
 */
export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("adminUsers"),
      clerkId: v.string(),
      email: v.string(),
      name: v.string(),
      roleLevel: v.number(),
      permissions: v.array(v.string()),
      status: v.string(),
      workspaceIds: v.array(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * List workspace memberships for the current user
 */
export const listMyWorkspaceMemberships = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("workspaceMemberships"),
      workspaceId: v.id("workspaces"),
      roleLevel: v.number(),
      status: v.string(),
      permissions: v.array(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const convexUser = await getUserByExternalId(ctx, identity.subject);
    if (!convexUser) {
      return [];
    }

    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", convexUser._id))
      .collect();

    const results = await Promise.all(
      memberships.map(async (membership) => {
        const role = await ctx.db.get(membership.roleId);
        const basePermissions = role?.permissions ?? [];
        const roleLevel = membership.roleLevel ?? role?.level ?? 0;
        const permissions = [
          ...new Set([...basePermissions, ...membership.additionalPermissions]),
        ];

        return {
          _id: membership._id,
          workspaceId: membership.workspaceId,
          roleLevel,
          status: membership.status,
          permissions,
        };
      }),
    );

    return results;
  },
});
