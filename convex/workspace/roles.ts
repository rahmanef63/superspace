import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
  ensureUser,
  requirePermission,
  requireActiveMembership,
} from "../auth/helpers";
import { normalizeSlug } from "../lib/utils";
import { PERMS } from "./permissions";
import { ROLE_TEMPLATES, type RoleTemplate } from "./roles.config";

type RoleDoc = Doc<"roles">;
type RoleSlug = RoleTemplate["slug"];

const hasWildcard = (
  permissions: readonly (typeof PERMS[keyof typeof PERMS] | "*")[],
) => permissions.some((perm) => perm === "*");

const normalizePermissions = (
  permissions: readonly (typeof PERMS[keyof typeof PERMS] | "*")[],
): string[] => (hasWildcard(permissions) ? ["*"] : [...permissions]);

const arraysMatch = (a: readonly string[] | undefined, b: readonly string[]) => {
  if (!a) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
};

const fetchRole = async (ctx: MutationCtx, roleId: Id<"roles">) =>
  (await ctx.db.get(roleId)) as RoleDoc;

export async function ensureSystemRoles(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  createdBy: Id<"users">,
): Promise<{ ordered: RoleDoc[]; map: Map<RoleSlug, RoleDoc> }> {
  const existingRoles = (await ctx.db
    .query("roles")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect()) as RoleDoc[];

  const bySlug = new Map<string, RoleDoc>();
  const byName = new Map<string, RoleDoc>();
  for (const role of existingRoles) {
    const slugKey = String(role.slug ?? role.name).toLowerCase();
    bySlug.set(slugKey, role);
    byName.set(String(role.name).toLowerCase(), role);
  }

  const ordered: RoleDoc[] = [];
  const roleMap = new Map<RoleSlug, RoleDoc>();

  for (const template of ROLE_TEMPLATES) {
    const slugKey = template.slug.toLowerCase();
    let role =
      bySlug.get(slugKey) ??
      bySlug.get(template.name.toLowerCase()) ??
      byName.get(template.name.toLowerCase());

    const expectedPermissions = normalizePermissions(
      template.workspacePermissions,
    );

    if (!role) {
      const roleId = await ctx.db.insert("roles", {
        name: template.name,
        slug: template.slug,
        description: template.description,
        workspaceId,
        permissions: expectedPermissions,
        color: template.color,
        isDefault: template.isDefault,
        isSystemRole: true,
        level: template.level,
        createdBy,
      } as any);
      role = await fetchRole(ctx, roleId);
    } else {
      const updates: Partial<RoleDoc> & Record<string, unknown> = {};

      if (role.slug !== template.slug) updates.slug = template.slug;
      if (role.description !== template.description) {
        updates.description = template.description;
      }
      if (role.color !== template.color) updates.color = template.color;
      if (role.level !== template.level) updates.level = template.level;
      if (role.isDefault !== template.isDefault) {
        updates.isDefault = template.isDefault;
      }
      if (role.isSystemRole !== true) updates.isSystemRole = true;
      if (!arraysMatch(role.permissions as string[] | undefined, expectedPermissions)) {
        updates.permissions = expectedPermissions;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(role._id, updates as any);
        role = { ...role, ...updates };
      }
    }

    roleMap.set(template.slug, role);
    ordered.push(role);
  }

  return { ordered, map: roleMap };
}

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
    const { ordered } = await ensureSystemRoles(
      ctx,
      args.workspaceId,
      userId as Id<"users">,
    );
    return ordered;
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
    const exists = existing.some(
      (r: any) => String(r.name).toLowerCase() === args.name.toLowerCase(),
    );
    if (exists) throw new Error("A role with this name already exists");

    const defaultPermissions =
      args.permissions && args.permissions.length > 0
        ? args.permissions
        : [PERMS.VIEW_WORKSPACE];

    const roleId = await ctx.db.insert("roles", {
      name: args.name,
      slug,
      description: undefined,
      workspaceId: args.workspaceId,
      permissions: defaultPermissions,
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
      } catch {
        // best effort
      }
    }

    return roleId;
  },
});

export const updateRole = mutation({
  args: {
    roleId: v.id("roles"),
    name: v.optional(v.string()),
    level: v.optional(v.number()),
    color: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
    isDefault: v.optional(v.boolean()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check permission
    const role = await ctx.db.get(args.roleId);
    if (!role) throw new Error("Role not found");

    await requirePermission(ctx, role.workspaceId, PERMS.MANAGE_ROLES);

    // Prevent modifying system roles critical fields (optional logic)
    // For now allow all, but maybe restrict slug changes (slug is derived from name so name change changes slug?)
    // If name changes, update slug
    const updates: any = {};
    if (args.name !== undefined) {
      const slug = normalizeSlug(args.name);
      // Check uniqueness if name changed
      if (slug !== role.slug) {
        const existing = await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", role.workspaceId))
          .collect();
        const exists = existing.some((r: any) => r.slug === slug && r._id !== args.roleId);
        if (exists) throw new Error("A role with this name already exists");
        updates.slug = slug;
        updates.name = args.name;
      }
    }

    if (args.color !== undefined) updates.color = args.color;
    if (args.level !== undefined) {
      if (args.level < 0 || args.level > 99) throw new Error("Level must be 0-99");
      updates.level = args.level;
    }
    if (args.permissions !== undefined) updates.permissions = args.permissions;
    if (args.icon !== undefined) updates.icon = args.icon;

    // Handle isDefault
    if (args.isDefault !== undefined && args.isDefault !== role.isDefault) {
      updates.isDefault = args.isDefault;
      if (args.isDefault) {
        // Unset previous default
        const otherRoles = await ctx.db
          .query("roles")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", role.workspaceId))
          .collect();
        for (const r of otherRoles) {
          if (r.isDefault && r._id !== args.roleId) {
            await ctx.db.patch(r._id, { isDefault: false });
          }
        }
        // Update workspace settings
        await ctx.db.patch(role.workspaceId, {
          settings: { defaultRoleId: args.roleId } // merge?
        } as any);
      }
    }

    await ctx.db.patch(args.roleId, updates);
  },
});

export const deleteRole = mutation({
  args: {
    roleId: v.id("roles"),
    fallbackRoleId: v.optional(v.id("roles")),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.roleId);
    if (!role) throw new Error("Role not found");

    await requirePermission(ctx, role.workspaceId, PERMS.MANAGE_ROLES);

    if (role.isSystemRole) {
      throw new Error("Cannot delete system roles");
    }

    // Check usage
    // We assume 'by_role' index on workspaceMemberships exists (if not, full scan)
    // Let's rely on 'by_role' if schema has it. 
    // Checking schema: core/api/schema.ts -> workspaceMemberships
    // If not sure, we can do full scan filter or just proceed.
    // For safety, let's query memberships.

    /* 
       Schema check required to be safe. 
       Assuming no index for now, we scan by workspace.
    */
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", role.workspaceId))
      .filter(q => q.eq(q.field("roleId"), args.roleId))
      .collect();

    if (memberships.length > 0) {
      if (!args.fallbackRoleId) {
        throw new Error(`Role is assigned to ${memberships.length} members. Please specify a fallback role.`);
      }
      // Move members
      for (const m of memberships) {
        await ctx.db.patch(m._id, { roleId: args.fallbackRoleId });
      }
    }

    await ctx.db.delete(args.roleId);
  },
});


