import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId } from "../../auth/helpers";

/**
 * Get all calls for a workspace
 */
export const getWorkspaceCalls = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .collect();

    const callsWithDetails = await Promise.all(
      calls.map(async (call) => {
        const initiator = await ctx.db.get(call.initiatorId);
        const participants = await ctx.db
          .query("callParticipants")
          .withIndex("by_call", (q) => q.eq("callId", call._id))
          .collect();

        const participantDetails = await Promise.all(
          participants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            return { ...p, user };
          })
        );

        return {
          ...call,
          initiator,
          participants: participantDetails,
        };
      })
    );

    return callsWithDetails;
  },
});

/**
 * Get a single call with full details
 */
export const getCall = query({
  args: {
    callId: v.id("calls"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const call = await ctx.db.get(args.callId);
    if (!call) return null;

    const initiator = await ctx.db.get(call.initiatorId);
    const participants = await ctx.db
      .query("callParticipants")
      .withIndex("by_call", (q) => q.eq("callId", call._id))
      .collect();

    const participantDetails = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return { ...p, user };
      })
    );

    return {
      ...call,
      initiator,
      participants: participantDetails,
    };
  },
});

/**
 * Get call history for current user
 */
export const getMyCallHistory = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // Get calls where user was initiator
    const initiatedCalls = await ctx.db
      .query("calls")
      .withIndex("by_initiator", (q) => q.eq("initiatorId", userId))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .take(args.limit ?? 50);

    // Get calls where user was participant
    const participations = await ctx.db
      .query("callParticipants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const participatedCallIds = participations.map((p) => p.callId);
    const participatedCalls = await Promise.all(
      participatedCallIds.map((id) => ctx.db.get(id))
    );

    const validParticipatedCalls = participatedCalls.filter(
      (call): call is NonNullable<typeof call> =>
        call !== null && call.workspaceId === args.workspaceId
    );

    // Merge and dedupe
    const allCalls = [...initiatedCalls, ...validParticipatedCalls];
    const uniqueCalls = Array.from(
      new Map(allCalls.map((c) => [c._id, c])).values()
    );

    // Sort by start time desc and limit
    const sortedCalls = uniqueCalls
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, args.limit ?? 50);

    // Add details
    const callsWithDetails = await Promise.all(
      sortedCalls.map(async (call) => {
        const initiator = await ctx.db.get(call.initiatorId);
        const participants = await ctx.db
          .query("callParticipants")
          .withIndex("by_call", (q) => q.eq("callId", call._id))
          .collect();

        const participantDetails = await Promise.all(
          participants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            return { ...p, user };
          })
        );

        return {
          ...call,
          initiator,
          participants: participantDetails,
        };
      })
    );

    return callsWithDetails;
  },
});
