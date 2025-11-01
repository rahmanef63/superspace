import { mutation } from "./_generated";
import { v } from "convex/values";
import { requirePermission } from "./shared/auth";
import { PERMS } from "./shared/schema";
import { ensureUser } from "../../auth/helpers";

/**
 * Mutations for cms-lite feature
 */
export const createItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: REQUIRED: Check permission
    await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.DOCUMENTS_CREATE, // TODO: Use appropriate permission
    );
    const userId = await ensureUser(ctx);

    // TODO: Implement your mutation logic
    const itemId = await ctx.db.insert("documents", {
      workspaceId: args.workspaceId,
      title: args.title,
      createdBy: userId,
      isPublic: false,
      lastModified: Date.now(),
    });

    // TODO: Add audit logging
    // await ctx.runMutation(internal.audit.logEvent, { ... })

    return itemId;
  },
});
