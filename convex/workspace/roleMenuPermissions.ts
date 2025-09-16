import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, requirePermission } from "../auth/helpers";
import { PERMS } from "./permissions";

// Create or update a granular permission entry for a role+menuItem
export const upsertRoleMenuPermission = mutation({
  args: {
    roleId: v.id("roles"),
    menuItemId: v.id("menuItems"),
    canView: v.optional(v.boolean()),
    canCreate: v.optional(v.boolean()),
    canUpdate: v.optional(v.boolean()),
    canDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const role = await ctx.db.get(args.roleId);
    if (!role) throw new Error("Role not found");

  // Require permission over the workspace that owns the role
  if (!role.workspaceId) throw new Error("Role is not associated with a workspace");
  await requirePermission(ctx, role.workspaceId, PERMS.MANAGE_ROLES);

    // Try to find existing permission row
    const existing = await ctx.db
      .query("roleMenuPermissions")
      .withIndex("by_role_menu", (q) =>
        q.eq("roleId", args.roleId).eq("menuItemId", args.menuItemId)
      )
      .unique();

    const payload = {
      roleId: args.roleId,
      menuItemId: args.menuItemId,
      canView: args.canView ?? false,
      canCreate: args.canCreate ?? false,
      canUpdate: args.canUpdate ?? false,
      canDelete: args.canDelete ?? false,
      createdBy: userId,
      createdAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    } else {
      return await ctx.db.insert("roleMenuPermissions", payload as any);
    }
  },
});

// Delete a roleMenuPermissions entry
export const deleteRoleMenuPermission = mutation({
  args: { id: v.id("roleMenuPermissions") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error("Not found");

  const role = await ctx.db.get(row.roleId);
  if (!role) throw new Error("Role not found");
  if (!role.workspaceId) throw new Error("Role is not associated with a workspace");
  await requirePermission(ctx, role.workspaceId, PERMS.MANAGE_ROLES);

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query permissions for a role
export const getPermissionsForRole = query({
  args: { roleId: v.id("roles") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("roleMenuPermissions")
      .withIndex("by_role", (q) => q.eq("roleId", args.roleId))
      .collect();
    return rows;
  },
});
