import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, requirePermission, requireActiveMembership } from "../auth/helpers";
import { normalizeSlug } from "../lib/utils";
import { PERMS } from "./permissions";

// Get all roles for a workspace
export const getAllRoles = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    return await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

// Create basic roles for a workspace
export const setupBasicRoles = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Load existing roles and create any missing system roles
    const existingRoles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const byName = new Map(existingRoles.map((r: any) => [String(r.name).toLowerCase(), r]));

    // Seed hierarchical roles (owner -> guest)
    const owner = byName.get("owner") ?? await ctx.db.insert("roles", {
      name: "Owner",
      slug: "owner",
      description: "Workspace owner (super admin)",
      workspaceId: args.workspaceId,
      permissions: ["*"],
      color: "#111827",
      isDefault: false,
      isSystemRole: true,
      level: 0,
      createdBy: userId,
    });

    const admin = byName.get("admin") ?? await ctx.db.insert("roles", {
      name: "Admin",
      slug: "admin",
      description: "Full access except system-level actions",
      workspaceId: args.workspaceId,
      permissions: [
        PERMS.MANAGE_WORKSPACE,
        PERMS.MANAGE_MEMBERS,
        PERMS.INVITE_MEMBERS,
        PERMS.MANAGE_ROLES,
        PERMS.MANAGE_MENUS,
        PERMS.DOCUMENTS_CREATE,
        PERMS.DOCUMENTS_EDIT,
        PERMS.DOCUMENTS_DELETE,
        PERMS.DOCUMENTS_MANAGE,
        PERMS.CREATE_CONVERSATIONS,
        PERMS.MANAGE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#dc2626",
      isDefault: false,
      isSystemRole: true,
      level: 10,
      createdBy: userId,
    });

    const manager = byName.get("manager") ?? await ctx.db.insert("roles", {
      name: "Manager",
      slug: "manager",
      description: "Manage content and conversations",
      workspaceId: args.workspaceId,
      permissions: [
        PERMS.DOCUMENTS_CREATE,
        PERMS.DOCUMENTS_EDIT,
        PERMS.CREATE_CONVERSATIONS,
        PERMS.MANAGE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#2563eb",
      isDefault: false,
      isSystemRole: true,
      level: 30,
      createdBy: userId,
    });

    const staff = byName.get("staff") ?? await ctx.db.insert("roles", {
      name: "Staff",
      slug: "staff",
      description: "Contribute content and chat",
      workspaceId: args.workspaceId,
      permissions: [
        PERMS.DOCUMENTS_CREATE,
        PERMS.DOCUMENTS_EDIT,
        PERMS.CREATE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#10b981",
      isDefault: false,
      isSystemRole: true,
      level: 50,
      createdBy: userId,
    });

    const client = byName.get("client") ?? await ctx.db.insert("roles", {
      name: "Client",
      slug: "client",
      description: "Limited access; cannot view member list",
      workspaceId: args.workspaceId,
      permissions: [
        PERMS.CREATE_CONVERSATIONS,
        PERMS.VIEW_WORKSPACE,
      ],
      color: "#6b7280",
      isDefault: true,
      isSystemRole: true,
      level: 70,
      createdBy: userId,
    });

    const guest = byName.get("guest") ?? await ctx.db.insert("roles", {
      name: "Guest",
      slug: "guest",
      description: "Read-only viewer",
      workspaceId: args.workspaceId,
      permissions: [PERMS.VIEW_WORKSPACE],
      color: "#9ca3af",
      isDefault: false,
      isSystemRole: true,
      level: 90,
      createdBy: userId,
    });

    return [owner, admin, manager, staff, client, guest];
  },
});

// Check if user has permission
export const hasPermission = query({
  args: {
    workspaceId: v.id("workspaces"),
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await requirePermission(ctx, args.workspaceId, args.permission);
      return true;
    } catch {
      return false;
    }
  },
});

// Create a custom role in a workspace
export const createRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    level: v.number(), // expected 0..99
    color: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    isDefault: v.optional(v.boolean()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Require manage roles permission
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_ROLES);

    // Basic validation
    if (args.level < 0 || args.level > 99) {
      throw new Error("Role level must be between 0 and 99");
    }

    const slug = normalizeSlug(args.name);

    // Enforce unique name in workspace
    const existing = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const exists = existing.some((r: any) => String(r.name).toLowerCase() === args.name.toLowerCase());
    if (exists) throw new Error("A role with this name already exists");

    const roleId = await ctx.db.insert("roles", {
      name: args.name,
      slug,
      description: undefined,
      workspaceId: args.workspaceId,
      permissions: args.permissions && args.permissions.length > 0 ? args.permissions : [PERMS.VIEW_WORKSPACE],
      color: args.color,
      isDefault: args.isDefault ?? false,
      isSystemRole: false,
      level: args.level,
      icon: args.icon,
      createdBy: userId,
    } as any);

    // If set default, patch workspace settings
    if (args.isDefault) {
      try {
        const ws = await ctx.db.get(args.workspaceId);
        await ctx.db.patch(args.workspaceId, {
          settings: {
            ...(ws?.settings || {}),
            defaultRoleId: roleId,
          },
        } as any);
      } catch {}
    }

    return roleId;
  },
});
