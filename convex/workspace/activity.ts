import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser } from "../auth/helpers";

// Log an activity event
export const logEvent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    diff: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    return await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      action: args.action,
      diff: args.diff,
      createdAt: Date.now(),
    });
  },
});

// List workspace activity events (newest first)
export const listWorkspaceEvents = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const sorted = events.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return sorted.slice(0, args.limit ?? 100);
  },
});
