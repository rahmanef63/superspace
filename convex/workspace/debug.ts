import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { resolveCandidateUserIds, getExistingUserId } from "../auth/helpers";

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
