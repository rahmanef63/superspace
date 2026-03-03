import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { resolveCandidateUserIds, getExistingUserId, getUserByExternalId } from "../auth/helpers";
import type { Id } from "../_generated/dataModel";

// Helper to get Convex user ID (same as in workspaces.ts)
async function getConvexUserId(ctx: any): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  
  const user = await getUserByExternalId(ctx, identity.subject)
  if (user) return user._id
  
  if (identity.email) {
    const byEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", identity.email))
      .first()
    if (byEmail) return byEmail._id
  }
  
  return null
}

// Debug: Exact mirror of getUserWorkspaces with detailed logging
export const debugGetUserWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { error: "No identity", workspaces: [] }
    
    const userId = await getConvexUserId(ctx)
    const clerkId = identity.subject
    
    const debug: any = {
      identity: {
        subject: identity.subject,
        email: identity.email,
      },
      userId,
      clerkId,
      sources: {
        memberships: [],
        createdByUserId: [],
        createdByClerkId: [],
      },
    }
    
    const workspaceIds = new Set<string>()

    // 1. Memberships
    if (userId) {
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
      debug.sources.memberships = memberships.map(m => ({
        workspaceId: m.workspaceId,
        userId: m.userId,
        status: m.status,
      }))
      for (const m of memberships) {
        workspaceIds.add(m.workspaceId)
      }
    }

    // 2. Created by Convex userId
    if (userId) {
      const created = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", userId))
        .collect()
      debug.sources.createdByUserId = created.map(w => ({ _id: w._id, name: (w as any).name, createdBy: (w as any).createdBy }))
      for (const w of created) {
        workspaceIds.add(w._id)
      }
    }

    // 3. Created by Clerk ID (legacy)
    if (clerkId) {
      const created = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", clerkId as any))
        .collect()
      debug.sources.createdByClerkId = created.map(w => ({ _id: w._id, name: (w as any).name, createdBy: (w as any).createdBy }))
      for (const w of created) {
        workspaceIds.add(w._id)
      }
    }

    debug.uniqueWorkspaceIds = Array.from(workspaceIds)
    
    const workspaces = await Promise.all(
      Array.from(workspaceIds).map((id) => ctx.db.get(id as any))
    )
    
    debug.workspaces = workspaces.filter(w => w !== null).map(w => ({ _id: w!._id, name: (w as any).name }))
    
    return debug
  },
});

// Debug: List ALL users in the database
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect()
    return allUsers.map(u => ({
      _id: u._id,
      name: (u as any).name,
      email: (u as any).email,
      clerkId: (u as any).clerkId,
    }))
  },
})

// FIX: Merge duplicate user records - links clerkId to old user and cleans up
// Call this WITHOUT authentication check for admin fix
export const fixDuplicateUser = mutation({
  args: {
    oldUserId: v.string(), // The user ID that has workspaces
    newUserId: v.string(), // The new duplicate user ID to delete
    clerkId: v.string(),   // The clerk ID to set
  },
  handler: async (ctx, args) => {
    // Get both user records
    const oldUser = await ctx.db.get(args.oldUserId as any)
    const newUser = await ctx.db.get(args.newUserId as any)
    
    if (!oldUser) throw new Error("Old user not found")
    if (!newUser) throw new Error("New user not found")
    
    // Update old user with clerkId
    await ctx.db.patch(args.oldUserId as any, { clerkId: args.clerkId })
    
    // Delete the new duplicate user
    await ctx.db.delete(args.newUserId as any)
    
    return { success: true, message: `Linked clerkId to ${args.oldUserId} and deleted ${args.newUserId}` }
  },
})

// Debug: List ALL workspaces in the database (admin/debug only)
export const listAllWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const allWorkspaces = await ctx.db.query("workspaces").collect()
    return allWorkspaces.map(w => ({
      _id: w._id,
      name: (w as any).name,
      createdBy: (w as any).createdBy,
      slug: (w as any).slug,
    }))
  },
})

// Debug: List ALL memberships in the database
export const listAllMemberships = query({
  args: {},
  handler: async (ctx) => {
    const allMemberships = await ctx.db.query("workspaceMemberships").collect()
    return allMemberships.map(m => ({
      _id: m._id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      status: m.status,
    }))
  },
})

// Returns identity + how the server resolves your Convex user ids
export const whoAmI = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const authUserId = await getAuthUserId(ctx);
    const existingUserId = await getExistingUserId(ctx);
    const candidates = await resolveCandidateUserIds(ctx);

    // Try to load user docs for the resolved candidate ids (best effort)
    const users = await Promise.all(
      candidates.map(async (id) => ({ id, doc: await ctx.db.get(id as any) }))
    );

    return {
      identity: identity
        ? {
            subject: identity.subject,
            name: (identity as any).name ?? null,
            email: identity.email ?? null,
            phone: (identity as any).phone ?? null,
          }
        : null,
      authUserId,
      existingUserId,
      candidates,
      users,
    } as any;
  },
});

// Diagnose which workspaces are visible based on memberships and creator fallback
export const diagnoseWorkspaces = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const candidates = await resolveCandidateUserIds(ctx);
    const includeInactive = args.includeInactive ?? true;

    // Gather memberships for any candidate id
    const memberships: any[] = [];
    for (const idStr of candidates) {
      const rows = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user", (q) => q.eq("userId", idStr as any))
        .collect();
      memberships.push(
        ...rows.filter((m) => includeInactive || m.status === "active")
      );
    }

    // Enrich with workspace + role
    const membershipDetails = await Promise.all(
      memberships.map(async (m) => {
        const workspace = await ctx.db.get(m.workspaceId);
        const role = await ctx.db.get(m.roleId);
        return { membership: m, workspace, role };
      })
    );

    // Workspaces created by any candidate id (creator fallback)
    const createdBy: any[] = [];
    for (const idStr of candidates) {
      const rows = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", idStr as any))
        .collect();
      createdBy.push(...rows);
    }

    // Summaries
    const activeCount = memberships.filter((m) => m.status === "active").length;
    const pendingCount = memberships.filter((m) => m.status === "pending").length;
    const inactiveCount = memberships.filter((m) => m.status === "inactive").length;
    const uniqueWorkspaceIds = Array.from(
      new Set([
        ...membershipDetails.map((d) => String(d.workspace?._id || "")),
        ...createdBy.map((w) => String(w._id || "")),
      ]).values()
    ).filter(Boolean);

    return {
      candidates,
      memberships: membershipDetails,
      createdBy,
      summary: {
        activeCount,
        pendingCount,
        inactiveCount,
        createdCount: createdBy.length,
        uniqueWorkspaceIdsCount: uniqueWorkspaceIds.length,
        uniqueWorkspaceIds,
      },
    } as any;
  },
});
