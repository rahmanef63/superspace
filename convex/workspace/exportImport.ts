/**
 * Workspace Export/Import API
 *
 * Provides comprehensive export and import functionality for workspaces.
 * Supports exporting workspace configuration, roles, members, and settings.
 *
 * @module convex/workspace/exportImport
 */

import { v } from "convex/values";
import { query, mutation, action } from "../_generated/server";
import { ensureUser, requirePermission } from "../auth/helpers";
import type { Id, Doc } from "../_generated/dataModel";
import { PERMS } from "./permissions";
import { normalizeSlug } from "../lib/utils";
import { ensureSystemRoles } from "./roles";
import { api } from "../_generated/api";

// ============================================================================
// Types
// ============================================================================

export type WorkspaceExportData = {
  version: string;
  exportedAt: number;
  exportedBy: string;
  workspace: {
    name: string;
    slug: string;
    description?: string;
    type: string;
    timezone?: string;
    language?: string;
    icon?: string;
    color?: string;
    themePreset?: string;
    settings?: Record<string, unknown>;
  };
  roles: Array<{
    name: string;
    slug: string;
    description?: string;
    permissions: string[];
    color?: string;
    level?: number;
    isSystemRole?: boolean;
  }>;
  members?: Array<{
    email: string;
    roleSlug: string;
    additionalPermissions?: string[];
  }>;
  enabledFeatures?: string[];
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get export preview (what will be exported)
 */
export const getExportPreview = query({
  args: {
    workspaceId: v.id("workspaces"),
    includeMembers: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const roles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    let memberCount = 0;
    if (args.includeMembers) {
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();
      memberCount = memberships.length;
    }

    return {
      workspace: {
        name: workspace.name,
        slug: workspace.slug,
        type: workspace.type,
        hasSettings: !!workspace.settings,
        hasTimezone: !!workspace.timezone,
        hasLanguage: !!workspace.language,
      },
      roles: {
        total: roles.length,
        system: roles.filter((r) => r.isSystemRole).length,
        custom: roles.filter((r) => !r.isSystemRole).length,
      },
      members: args.includeMembers ? memberCount : null,
      enabledFeatures: workspace.settings?.enabledFeatures?.length ?? 0,
    };
  },
});

/**
 * Get import/export history for a workspace
 */
export const getExportHistory = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const history = await ctx.db
      .query("importExportHistory")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit ?? 20);

    // Enrich with user info
    const enriched = await Promise.all(
      history.map(async (h) => {
        const user = await ctx.db.get(h.userId);
        return {
          ...h,
          user: user
            ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl }
            : null,
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// Export Mutations
// ============================================================================

/**
 * Export workspace configuration as JSON
 * Returns a structured export that can be used for import
 */
export const exportWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    includeMembers: v.optional(v.boolean()),
    includeCustomRolesOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Get roles
    const allRoles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const roles = args.includeCustomRolesOnly
      ? allRoles.filter((r) => !r.isSystemRole)
      : allRoles;

    // Get members if requested
    let members: Array<{
      email: string;
      roleSlug: string;
      additionalPermissions?: string[];
    }> = [];

    if (args.includeMembers) {
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();

      members = await Promise.all(
        memberships.map(async (m) => {
          const user = await ctx.db.get(m.userId);
          const role = await ctx.db.get(m.roleId);
          return {
            email: user?.email ?? "",
            roleSlug: role?.slug ?? "client",
            additionalPermissions:
              m.additionalPermissions?.length > 0
                ? m.additionalPermissions
                : undefined,
          };
        })
      );

      // Filter out empty emails
      members = members.filter((m) => m.email);
    }

    const exportData: WorkspaceExportData = {
      version: "1.0",
      exportedAt: Date.now(),
      exportedBy: userId as string,
      workspace: {
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        type: workspace.type,
        timezone: workspace.timezone,
        language: workspace.language,
        icon: workspace.icon,
        color: workspace.color,
        themePreset: workspace.themePreset,
        settings: workspace.settings as Record<string, unknown>,
      },
      roles: roles.map((r) => ({
        name: r.name,
        slug: r.slug,
        description: r.description,
        permissions: r.permissions as string[],
        color: r.color,
        level: r.level,
        isSystemRole: r.isSystemRole,
      })),
      members: args.includeMembers ? members : undefined,
      enabledFeatures: workspace.settings?.enabledFeatures,
    };

    // Log export in history
    await ctx.db.insert("importExportHistory", {
      type: "export",
      entityType: "workspace",
      status: "completed",
      fileName: `${workspace.slug}-export.json`,
      format: "json",
      recordCount: 1,
      successCount: 1,
      errorCount: 0,
      userId,
      workspaceId: args.workspaceId,
      startedAt: Date.now(),
      completedAt: Date.now(),
      options: {
        includeMembers: args.includeMembers ?? false,
        includeCustomRolesOnly: args.includeCustomRolesOnly ?? false,
      },
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace",
      entityId: String(args.workspaceId),
      action: "workspace_exported",
      diff: {
        includeMembers: args.includeMembers ?? false,
        rolesCount: roles.length,
        membersCount: members.length,
      },
      createdAt: Date.now(),
    });

    return exportData;
  },
});

// ============================================================================
// Import Mutations
// ============================================================================

/**
 * Validate import data before importing
 */
export const validateImportData = query({
  args: {
    importData: v.string(), // JSON string
  },
  handler: async (ctx, args) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = JSON.parse(args.importData) as WorkspaceExportData;

      // Check version
      if (!data.version) {
        errors.push("Missing version field");
      }

      // Check workspace
      if (!data.workspace?.name) {
        errors.push("Missing workspace name");
      }

      if (!data.workspace?.type) {
        errors.push("Missing workspace type");
      } else {
        const validTypes = [
          "organization",
          "institution",
          "group",
          "family",
          "personal",
        ];
        if (!validTypes.includes(data.workspace.type)) {
          errors.push(`Invalid workspace type: ${data.workspace.type}`);
        }
      }

      // Check roles
      if (data.roles && Array.isArray(data.roles)) {
        for (const role of data.roles) {
          if (!role.name || !role.slug) {
            errors.push(`Role missing name or slug`);
          }
          if (!Array.isArray(role.permissions)) {
            errors.push(`Role "${role.name}" has invalid permissions`);
          }
        }
      }

      // Check members
      if (data.members && Array.isArray(data.members)) {
        for (const member of data.members) {
          if (!member.email) {
            warnings.push(`Member missing email`);
          }
          if (!member.roleSlug) {
            warnings.push(`Member "${member.email}" missing roleSlug`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        preview: {
          workspaceName: data.workspace?.name,
          workspaceType: data.workspace?.type,
          rolesCount: data.roles?.length ?? 0,
          membersCount: data.members?.length ?? 0,
          enabledFeaturesCount: data.enabledFeatures?.length ?? 0,
        },
      };
    } catch (e) {
      return {
        valid: false,
        errors: ["Invalid JSON format"],
        warnings: [],
        preview: null,
      };
    }
  },
});

/**
 * Import workspace from export data
 * Creates a new workspace with imported configuration
 */
export const importWorkspace = mutation({
  args: {
    importData: v.string(), // JSON string
    overrideName: v.optional(v.string()),
    overrideSlug: v.optional(v.string()),
    importMembers: v.optional(v.boolean()),
    parentWorkspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Parse and validate import data
    let data: WorkspaceExportData;
    try {
      data = JSON.parse(args.importData);
    } catch (e) {
      throw new Error("Invalid import data format");
    }

    if (!data.version || !data.workspace?.name) {
      throw new Error("Invalid import data: missing required fields");
    }

    const workspaceName = args.overrideName ?? data.workspace.name;
    const workspaceSlug =
      args.overrideSlug ?? normalizeSlug(workspaceName);

    // Check for duplicate slug
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
      .first();

    if (existing) {
      throw new Error(`Workspace with slug "${workspaceSlug}" already exists`);
    }

    // Create workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: workspaceName,
      slug: workspaceSlug,
      description: data.workspace.description,
      type: data.workspace.type as any,
      isPublic: false,
      timezone: data.workspace.timezone,
      language: data.workspace.language,
      icon: data.workspace.icon,
      color: data.workspace.color,
      themePreset: data.workspace.themePreset,
      parentWorkspaceId: args.parentWorkspaceId,
      settings: data.workspace.settings as any,
      createdBy: userId,
    });

    // Create system roles
    const { map: roleMap } = await ensureSystemRoles(ctx, workspaceId, userId);

    // Create custom roles from import
    const importedRoleMap = new Map<string, Id<"roles">>();
    if (data.roles && data.roles.length > 0) {
      for (const roleData of data.roles) {
        // Skip system roles (already created)
        if (roleData.isSystemRole) {
          const existingRole = roleMap.get(roleData.slug as any);
          if (existingRole) {
            importedRoleMap.set(roleData.slug, existingRole._id);
          }
          continue;
        }

        const roleId = await ctx.db.insert("roles", {
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          workspaceId,
          permissions: roleData.permissions,
          color: roleData.color,
          isDefault: false,
          isSystemRole: false,
          level: roleData.level ?? 50,
          createdBy: userId,
        });
        importedRoleMap.set(roleData.slug, roleId);
      }
    }

    // Add creator as Owner
    const ownerRole = roleMap.get("owner");
    if (ownerRole) {
      await ctx.db.insert("workspaceMemberships", {
        workspaceId,
        userId,
        roleId: ownerRole._id,
        status: "active",
        joinedAt: Date.now(),
        additionalPermissions: [],
      });
    }

    // Import members (as invitations - they need to accept)
    let importedMembers = 0;
    let failedMembers = 0;
    const memberErrors: Array<{ email: string; error: string }> = [];

    if (args.importMembers && data.members && data.members.length > 0) {
      for (const memberData of data.members) {
        try {
          // Find user by email
          const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", memberData.email))
            .first();

          // Get role for this member
          let memberRoleId = importedRoleMap.get(memberData.roleSlug);
          if (!memberRoleId) {
            // Fall back to client role
            const clientRole = roleMap.get("client");
            memberRoleId = clientRole?._id;
          }

          if (existingUser && memberRoleId) {
            // Create membership directly if user exists
            await ctx.db.insert("workspaceMemberships", {
              workspaceId,
              userId: existingUser._id,
              roleId: memberRoleId,
              status: "pending", // Pending until they accept
              joinedAt: Date.now(),
              additionalPermissions: memberData.additionalPermissions ?? [],
              invitedBy: userId,
            });
            importedMembers++;
          } else {
            // User doesn't exist - create invitation instead
            const token = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await ctx.db.insert("invitations", {
              type: "workspace",
              workspaceId,
              inviterId: userId,
              inviteeEmail: memberData.email,
              roleId: memberRoleId,
              status: "pending",
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
              token,
            });
            importedMembers++;
          }
        } catch (e) {
          failedMembers++;
          memberErrors.push({
            email: memberData.email,
            error: (e as Error).message,
          });
        }
      }
    }

    // Log import in history
    await ctx.db.insert("importExportHistory", {
      type: "import",
      entityType: "workspace",
      status: failedMembers > 0 ? "completed" : "completed",
      fileName: "import.json",
      format: "json",
      recordCount: 1 + (data.roles?.length ?? 0) + (data.members?.length ?? 0),
      successCount:
        1 + (data.roles?.length ?? 0) + importedMembers,
      errorCount: failedMembers,
      errors:
        memberErrors.length > 0
          ? memberErrors.map((e) => ({ message: `${e.email}: ${e.error}` }))
          : undefined,
      userId,
      workspaceId,
      startedAt: Date.now(),
      completedAt: Date.now(),
      options: {
        importMembers: args.importMembers ?? false,
        originalName: data.workspace.name,
        originalSlug: data.workspace.slug,
      },
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId,
      entityType: "workspace",
      entityId: String(workspaceId),
      action: "workspace_imported",
      diff: {
        sourceName: data.workspace.name,
        sourceVersion: data.version,
        rolesImported: data.roles?.length ?? 0,
        membersImported: importedMembers,
        membersFailed: failedMembers,
      },
      createdAt: Date.now(),
    });

    return {
      workspaceId,
      summary: {
        rolesCreated: data.roles?.filter((r) => !r.isSystemRole).length ?? 0,
        membersImported: importedMembers,
        membersFailed: failedMembers,
        memberErrors: memberErrors.length > 0 ? memberErrors : undefined,
      },
    };
  },
});

/**
 * Merge import data into existing workspace
 * Only imports roles that don't exist
 */
export const mergeIntoWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    importData: v.string(), // JSON string
    mergeSettings: v.optional(v.boolean()),
    mergeRoles: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    // Parse import data
    let data: WorkspaceExportData;
    try {
      data = JSON.parse(args.importData);
    } catch (e) {
      throw new Error("Invalid import data format");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    let settingsUpdated = false;
    let rolesCreated = 0;
    let rolesSkipped = 0;

    // Merge settings if requested
    if (args.mergeSettings && data.workspace) {
      const updates: Record<string, unknown> = {};

      if (data.workspace.timezone && !workspace.timezone) {
        updates.timezone = data.workspace.timezone;
      }
      if (data.workspace.language && !workspace.language) {
        updates.language = data.workspace.language;
      }
      if (data.workspace.icon && !workspace.icon) {
        updates.icon = data.workspace.icon;
      }
      if (data.workspace.color && !workspace.color) {
        updates.color = data.workspace.color;
      }
      if (data.workspace.themePreset && !workspace.themePreset) {
        updates.themePreset = data.workspace.themePreset;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(args.workspaceId, updates);
        settingsUpdated = true;
      }
    }

    // Merge roles if requested
    if (args.mergeRoles && data.roles && data.roles.length > 0) {
      const existingRoles = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();

      const existingSlugs = new Set(existingRoles.map((r) => r.slug));

      for (const roleData of data.roles) {
        // Skip system roles
        if (roleData.isSystemRole) {
          rolesSkipped++;
          continue;
        }

        // Skip if role with same slug exists
        if (existingSlugs.has(roleData.slug)) {
          rolesSkipped++;
          continue;
        }

        await ctx.db.insert("roles", {
          name: roleData.name,
          slug: roleData.slug,
          description: roleData.description,
          workspaceId: args.workspaceId,
          permissions: roleData.permissions,
          color: roleData.color,
          isDefault: false,
          isSystemRole: false,
          level: roleData.level ?? 50,
          createdBy: userId,
        });
        rolesCreated++;
      }
    }

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace",
      entityId: String(args.workspaceId),
      action: "workspace_merged",
      diff: {
        settingsUpdated,
        rolesCreated,
        rolesSkipped,
      },
      createdAt: Date.now(),
    });

    return {
      settingsUpdated,
      rolesCreated,
      rolesSkipped,
    };
  },
});
