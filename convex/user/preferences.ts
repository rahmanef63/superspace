/**
 * User Preferences API
 *
 * Queries and mutations for user preferences (theme, language, UI settings)
 * and notification preferences.
 *
 * @module convex/user/preferences
 */

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

// ============================================================================
// HELPERS
// ============================================================================

async function getCurrentUserOrThrow(ctx: any): Promise<{ _id: Id<"users">; clerkId?: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

// ============================================================================
// USER PREFERENCES QUERIES
// ============================================================================

export const getUserPreferences = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Return defaults if no preferences exist
    return prefs ?? {
      userId: user._id,
      theme: "system",
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      startOfWeek: "sunday",
      compactMode: false,
      sidebarCollapsed: false,
      keyboardShortcuts: true,
      reducedMotion: false,
    };
  },
});

export const getNotificationPreferences = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Return defaults if no preferences exist
    return prefs ?? {
      userId: user._id,
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      digestFrequency: "instant",
      channels: {
        mentions: true,
        comments: true,
        assignments: true,
        statusChanges: true,
        deadlines: true,
        announcements: true,
        directMessages: true,
        teamUpdates: false,
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  },
});

// ============================================================================
// USER PREFERENCES MUTATIONS
// ============================================================================

export const updateTheme = mutation({
  args: {
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        theme: args.theme,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: user._id,
        theme: args.theme,
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateUserPreferences = mutation({
  args: {
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.union(v.literal("12h"), v.literal("24h"))),
    startOfWeek: v.optional(
      v.union(v.literal("sunday"), v.literal("monday"), v.literal("saturday"))
    ),
    compactMode: v.optional(v.boolean()),
    sidebarCollapsed: v.optional(v.boolean()),
    keyboardShortcuts: v.optional(v.boolean()),
    reducedMotion: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const updates = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("userPreferences", {
        userId: user._id,
        ...updates,
      });
    }
  },
});

export const updateNotificationPreferences = mutation({
  args: {
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    inAppNotifications: v.optional(v.boolean()),
    digestFrequency: v.optional(
      v.union(
        v.literal("instant"),
        v.literal("hourly"),
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("never")
      )
    ),
    channels: v.optional(
      v.object({
        mentions: v.optional(v.boolean()),
        comments: v.optional(v.boolean()),
        assignments: v.optional(v.boolean()),
        statusChanges: v.optional(v.boolean()),
        deadlines: v.optional(v.boolean()),
        announcements: v.optional(v.boolean()),
        directMessages: v.optional(v.boolean()),
        teamUpdates: v.optional(v.boolean()),
      })
    ),
    quietHours: v.optional(
      v.object({
        enabled: v.optional(v.boolean()),
        start: v.optional(v.string()),
        end: v.optional(v.string()),
        timezone: v.optional(v.string()),
      })
    ),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);

    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const updates = {
      ...args,
      updatedAt: Date.now(),
    };

    if (existing) {
      // Merge channels and quietHours with existing values
      const mergedChannels = args.channels
        ? { ...existing.channels, ...args.channels }
        : existing.channels;
      const mergedQuietHours = args.quietHours
        ? { ...existing.quietHours, ...args.quietHours }
        : existing.quietHours;

      await ctx.db.patch(existing._id, {
        ...updates,
        channels: mergedChannels,
        quietHours: mergedQuietHours,
      });
    } else {
      await ctx.db.insert("notificationPreferences", {
        userId: user._id,
        ...updates,
      });
    }
  },
});

export const resetPreferences = mutation({
  args: {},
  async handler(ctx) {
    const user = await getCurrentUserOrThrow(ctx);

    // Delete user preferences
    const userPrefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (userPrefs) {
      await ctx.db.delete(userPrefs._id);
    }

    // Delete notification preferences
    const notifPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (notifPrefs) {
      await ctx.db.delete(notifPrefs._id);
    }
  },
});
