import { action } from "../../_generated/server";
import { v } from "convex/values";
import { logAuditEvent } from "../../shared/audit";
import { getUserByExternalId, type ActionCtxWithDb } from "../helpers";
import { internal } from "../../_generated/api";

/**
 * Synchronize user data from Clerk webhook
 */
export const syncClerkUser = action({
  args: {
    clerkEvent: v.object({
      data: v.object({
        id: v.string(),
        email_addresses: v.array(
          v.object({
            email_address: v.string(),
            verification: v.object({
              status: v.string(),
            }),
          }),
        ),
        first_name: v.optional(v.string()),
        last_name: v.optional(v.string()),
      }),
      type: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const actionCtx = ctx as ActionCtxWithDb;
    const { data: user, type: eventType } = args.clerkEvent;

    // Get primary email
    const primaryEmail = user.email_addresses.find(
      (email) => email.verification?.status === "verified",
    )?.email_address;

    if (!primaryEmail) {
      throw new Error("No verified email found");
    }

    // Format user name
    const name = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (eventType === "user.created") {
      // Create new admin user
      await ctx.runMutation(
        internal.auth.api.mutations.createAdminUser,
        {
          name: name || "Unnamed User",
          email: primaryEmail,
        }
      );
    } else if (eventType === "user.updated") {
      // Update existing user (or create if missing)
      const existing = await actionCtx.db
        .query("adminUsers")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.id))
        .unique();

      if (existing) {
        await actionCtx.db.patch(existing._id, {
          email: primaryEmail,
          name: name || existing.name,
          updatedBy: user.id,
        });

        await logAuditEvent(actionCtx, {
          workspaceId: "system",
          action: "auth.user.updated",
          actor: user.id,
          target: {
            type: "adminUser",
            id: existing._id,
            workspaceId: "system",
          },
          changes: { email: primaryEmail, name },
        });
      } else {
        // Create a lightweight adminUsers record for this clerk user
        await actionCtx.db.insert("adminUsers", {
          clerkId: user.id,
          email: primaryEmail,
          name: name || "",
          roleLevel: 10,
          permissions: [],
          status: "active",
          workspaceIds: [],
          createdBy: user.id,
          updatedBy: user.id,
        });
      }
    } else if (eventType === "user.deleted") {
      // Mark user as inactive and mark workspace memberships inactive
      const existing = await actionCtx.db
        .query("adminUsers")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.id))
        .unique();

      if (existing) {
        await actionCtx.db.patch(existing._id, {
          status: "inactive",
          updatedBy: user.id,
        });

        const convexUser = await getUserByExternalId(actionCtx, user.id);

        if (convexUser) {
          // Deactivate workspace memberships referencing this user
          const memberships = await actionCtx.db
            .query("workspaceMemberships")
            .withIndex("by_user", (q) => q.eq("userId", convexUser._id))
            .collect();

          for (const m of memberships) {
            await actionCtx.db.patch(m._id, {
              status: "inactive",
              updatedBy: convexUser._id,
            });
          }
        }

        await logAuditEvent(actionCtx, {
          workspaceId: "system",
          action: "auth.user.deleted",
          actor: user.id,
          target: {
            type: "adminUser",
            id: existing._id,
            workspaceId: "system",
          },
        });
      }
    }
  },
});

/**
 * Initialize current user as admin (public action for workspace owners)
 * Creates an admin user record for workspace owners only
 */
export const initializeSelfAsAdmin = action({
  args: {},
  returns: v.object({
    userId: v.id("adminUsers"),
    created: v.boolean(),
  }),
  handler: async (ctx): Promise<{ userId: any; created: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Use internal mutation to create the admin user
    // Actions can't directly access db, must use runMutation
    const result: { userId: any; created: boolean } = await ctx.runMutation(
      internal.auth.api.mutations.initializeCurrentUserAsAdmin
    );

    return result;
  },
});
