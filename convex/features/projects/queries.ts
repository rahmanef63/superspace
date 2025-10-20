import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId } from "../../auth/helpers";

/**
 * Get all projects in a workspace
 */
export const getWorkspaceProjects = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("on_hold"),
      v.literal("completed"),
      v.literal("archived"),
    )),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const { status } = args;
    const projectsQuery =
      status !== undefined
        ? ctx.db
            .query("projects")
            .withIndex("by_status", (q) => q.eq("status", status))
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
        : ctx.db
            .query("projects")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const projects = await projectsQuery.collect();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const owner = await ctx.db.get(project.ownerId);

        // Get member count
        const members = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        return {
          ...project,
          owner,
          memberCount: members.length,
        };
      })
    );

    return projectsWithDetails;
  },
});

/**
 * Get a single project with full details
 */
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const owner = await ctx.db.get(project.ownerId);

    // Get all members
    const projectMembers = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const membersWithUsers = await Promise.all(
      projectMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user,
        };
      })
    );

    // Get conversation if exists
    let conversation = null;
    if (project.conversationId) {
      conversation = await ctx.db.get(project.conversationId);
    }

    return {
      ...project,
      owner,
      members: membersWithUsers,
      conversation,
    };
  },
});

/**
 * Get projects where user is a member
 */
export const getMyProjects = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const projects = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        if (!project || project.workspaceId !== args.workspaceId) return null;

        const owner = await ctx.db.get(project.ownerId);

        return {
          ...project,
          owner,
          memberRole: membership.role,
        };
      })
    );

    return projects.filter(Boolean);
  },
});
