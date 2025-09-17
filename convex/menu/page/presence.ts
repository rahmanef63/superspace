import { mutation, query } from "../../_generated/server";
import { components } from "../../_generated/api";
import { v } from "convex/values";
import { Presence } from "@convex-dev/presence";
import { ensureUser, getExistingUserId } from "../../auth/helpers";
import { Id } from "../../_generated/dataModel";

export const presence = new Presence(components.presence);

export const getUserId = query({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx) => {
    return (await getExistingUserId(ctx)) ?? null;
  },
});

export const heartbeat = mutation({
  args: { roomId: v.string(), userId: v.string(), sessionId: v.string(), interval: v.number() },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    try {
      // Validate input parameters
      if (!roomId || !userId || !sessionId) {
        console.warn("Invalid parameters for heartbeat:", { roomId, userId, sessionId });
        return null;
      }

      const authUserId = await ensureUser(ctx);
      return await presence.heartbeat(ctx, roomId, authUserId, sessionId, interval);
    } catch (error) {
      // If not authenticated, skip heartbeat
      if (error instanceof Error && error.message === "Not authenticated") {
        return null;
      }
      console.error("Error in presence heartbeat:", error);
      throw error;
    }
  },
});

export const list = query({
  args: { roomToken: v.optional(v.string()) },
  handler: async (ctx, { roomToken }) => {
    try {
      // Validate roomToken
      if (!roomToken) {
        console.warn("No roomToken provided to presence list");
        return [];
      }

      const presenceList = await presence.list(ctx, roomToken);
      const listWithUserInfo = await Promise.all(
        presenceList.map(async (entry) => {
          const user = await ctx.db.get(entry.userId as Id<"users">);
          if (!user) {
            return entry;
          }
          return {
            ...entry,
            name: user?.name,
            image: user?.image,
          };
        })
      );
      return listWithUserInfo;
    } catch (error) {
      console.error("Error in presence list:", error);
      return [];
    }
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    try {
      // Validate sessionToken
      if (!sessionToken) {
        console.warn("No sessionToken provided to presence disconnect");
        return null;
      }

      return await presence.disconnect(ctx, sessionToken);
    } catch (error) {
      console.error("Error in presence disconnect:", error);
      return null;
    }
  },
});

