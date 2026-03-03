/**
 * Workspace Templates API
 *
 * Provides CRUD operations for workspace templates.
 * Templates allow quick workspace creation with pre-configured settings.
 *
 * @module convex/workspace/templates
 */

import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { ensureUser, requirePermission } from "../auth/helpers";
import type { Id, Doc } from "../_generated/dataModel";
import { PERMS } from "./permissions";
import { normalizeSlug } from "../lib/utils";
import { ensureSystemRoles } from "./roles";

// ============================================================================
// Types
// ============================================================================

type WorkspaceTemplate = Doc<"workspaceTemplates">;

// ============================================================================
// Queries
// ============================================================================

/**
 * List all available templates for the current user
 * Includes public templates and templates the user has access to
 */
export const listTemplates = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("business"),
        v.literal("personal"),
        v.literal("team"),
        v.literal("project"),
        v.literal("industry"),
        v.literal("custom")
      )
    ),
    includeSystem: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get templates based on category filter
    let allTemplates;

    if (args.category) {
      allTemplates = await ctx.db
        .query("workspaceTemplates")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      allTemplates = await ctx.db.query("workspaceTemplates").collect();
    }

    // Filter: public OR system (if includeSystem) OR created by user
    const userId = await ensureUser(ctx);
    const includeSystem = args.includeSystem ?? true;

    return allTemplates.filter((t) => {
      if (t.isPublic) return true;
      if (includeSystem && t.isSystemTemplate) return true;
      if (String(t.createdBy) === String(userId)) return true;
      return false;
    });
  },
});

/**
 * Get a specific template by ID
 */
export const getTemplate = query({
  args: { templateId: v.id("workspaceTemplates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

/**
 * Get a template by slug
 */
export const getTemplateBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workspaceTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Get system templates
 */
export const getSystemTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("workspaceTemplates")
      .withIndex("by_system", (q) => q.eq("isSystemTemplate", true))
      .collect();
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new workspace template
 */
export const createTemplate = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.union(
      v.literal("business"),
      v.literal("personal"),
      v.literal("team"),
      v.literal("project"),
      v.literal("industry"),
      v.literal("custom")
    ),
    industryTags: v.optional(v.array(v.string())),
    workspaceType: v.union(
      v.literal("organization"),
      v.literal("institution"),
      v.literal("group"),
      v.literal("family"),
      v.literal("personal")
    ),
    defaultSettings: v.optional(
      v.object({
        allowInvites: v.optional(v.boolean()),
        requireApproval: v.optional(v.boolean()),
        allowPublicDocuments: v.optional(v.boolean()),
        theme: v.optional(v.string()),
        bundleId: v.optional(v.string()),
        enabledFeatures: v.optional(v.array(v.string())),
        allowGuestOnly: v.optional(v.boolean()),
        guestAccessDuration: v.optional(v.number()),
      })
    ),
    defaultTimezone: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
    enabledFeatures: v.array(v.string()),
    customRoles: v.optional(
      v.array(
        v.object({
          name: v.string(),
          slug: v.string(),
          description: v.optional(v.string()),
          permissions: v.array(v.string()),
          color: v.optional(v.string()),
          level: v.number(),
        })
      )
    ),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const slug = args.slug || normalizeSlug(args.name);

    // Check for duplicate slug
    const existing = await ctx.db
      .query("workspaceTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`Template with slug "${slug}" already exists`);
    }

    const templateId = await ctx.db.insert("workspaceTemplates", {
      name: args.name,
      slug,
      description: args.description,
      icon: args.icon,
      coverImageUrl: args.coverImageUrl,
      category: args.category,
      industryTags: args.industryTags,
      workspaceType: args.workspaceType,
      defaultSettings: args.defaultSettings,
      defaultTimezone: args.defaultTimezone,
      defaultLanguage: args.defaultLanguage,
      enabledFeatures: args.enabledFeatures,
      customRoles: args.customRoles,
      isSystemTemplate: false,
      isPublic: args.isPublic ?? false,
      createdBy: userId,
      createdAt: Date.now(),
      usageCount: 0,
    });

    return templateId;
  },
});

/**
 * Update a template
 */
export const updateTemplate = mutation({
  args: {
    templateId: v.id("workspaceTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("business"),
        v.literal("personal"),
        v.literal("team"),
        v.literal("project"),
        v.literal("industry"),
        v.literal("custom")
      )
    ),
    industryTags: v.optional(v.array(v.string())),
    defaultSettings: v.optional(
      v.object({
        allowInvites: v.optional(v.boolean()),
        requireApproval: v.optional(v.boolean()),
        allowPublicDocuments: v.optional(v.boolean()),
        theme: v.optional(v.string()),
        bundleId: v.optional(v.string()),
        enabledFeatures: v.optional(v.array(v.string())),
        allowGuestOnly: v.optional(v.boolean()),
        guestAccessDuration: v.optional(v.number()),
      })
    ),
    defaultTimezone: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
    enabledFeatures: v.optional(v.array(v.string())),
    customRoles: v.optional(
      v.array(
        v.object({
          name: v.string(),
          slug: v.string(),
          description: v.optional(v.string()),
          permissions: v.array(v.string()),
          color: v.optional(v.string()),
          level: v.number(),
        })
      )
    ),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    // Only creator can update non-system templates
    if (
      !template.isSystemTemplate &&
      String(template.createdBy) !== String(userId)
    ) {
      throw new Error("You can only update templates you created");
    }

    // System templates cannot be updated by non-admins
    if (template.isSystemTemplate) {
      throw new Error("System templates cannot be modified");
    }

    const { templateId, ...updates } = args;

    // Filter undefined values
    const patch: Record<string, unknown> = { updatedAt: Date.now(), updatedBy: userId };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    await ctx.db.patch(templateId, patch);
    return templateId;
  },
});

/**
 * Delete a template
 */
export const deleteTemplate = mutation({
  args: { templateId: v.id("workspaceTemplates") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    // Only creator can delete non-system templates
    if (
      !template.isSystemTemplate &&
      String(template.createdBy) !== String(userId)
    ) {
      throw new Error("You can only delete templates you created");
    }

    // System templates cannot be deleted
    if (template.isSystemTemplate) {
      throw new Error("System templates cannot be deleted");
    }

    await ctx.db.delete(args.templateId);
    return true;
  },
});

/**
 * Create a workspace from a template
 */
export const createWorkspaceFromTemplate = mutation({
  args: {
    templateId: v.id("workspaceTemplates"),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    // Override template defaults
    timezone: v.optional(v.string()),
    language: v.optional(v.string()),
    parentWorkspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    const slug = args.slug || normalizeSlug(args.name);

    // Create workspace with template settings
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug,
      description: args.description ?? template.description,
      type: template.workspaceType,
      isPublic: false,
      timezone: args.timezone ?? template.defaultTimezone,
      language: args.language ?? template.defaultLanguage,
      parentWorkspaceId: args.parentWorkspaceId,
      sourceTemplateId: args.templateId,
      settings: {
        ...template.defaultSettings,
        enabledFeatures: template.enabledFeatures,
      },
      createdBy: userId,
    });

    // Create system roles
    const { ordered: roles, map: roleMap } = await ensureSystemRoles(
      ctx,
      workspaceId,
      userId
    );

    // Create custom roles from template
    if (template.customRoles && template.customRoles.length > 0) {
      for (const customRole of template.customRoles) {
        await ctx.db.insert("roles", {
          name: customRole.name,
          slug: customRole.slug,
          description: customRole.description,
          workspaceId,
          permissions: customRole.permissions,
          color: customRole.color,
          isDefault: false,
          isSystemRole: false,
          level: customRole.level,
          createdBy: userId,
        });
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

    // Increment template usage count
    await ctx.db.patch(args.templateId, {
      usageCount: (template.usageCount ?? 0) + 1,
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId,
      entityType: "workspace",
      entityId: String(workspaceId),
      action: "workspace_created_from_template",
      diff: { templateId: args.templateId, templateName: template.name },
      createdAt: Date.now(),
    });

    return workspaceId;
  },
});

/**
 * Save an existing workspace as a template
 */
export const saveWorkspaceAsTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.union(
      v.literal("business"),
      v.literal("personal"),
      v.literal("team"),
      v.literal("project"),
      v.literal("industry"),
      v.literal("custom")
    ),
    industryTags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    includeCustomRoles: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Check permission to manage workspace
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const slug = args.slug || normalizeSlug(args.name);

    // Check for duplicate slug
    const existing = await ctx.db
      .query("workspaceTemplates")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      throw new Error(`Template with slug "${slug}" already exists`);
    }

    // Get custom roles if requested
    let customRoles: Array<{
      name: string;
      slug: string;
      description?: string;
      permissions: string[];
      color?: string;
      level: number;
    }> = [];

    if (args.includeCustomRoles) {
      const roles = await ctx.db
        .query("roles")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect();

      customRoles = roles
        .filter((r) => !r.isSystemRole)
        .map((r) => ({
          name: r.name,
          slug: r.slug,
          description: r.description,
          permissions: r.permissions as string[],
          color: r.color,
          level: r.level ?? 50,
        }));
    }

    const templateId = await ctx.db.insert("workspaceTemplates", {
      name: args.name,
      slug,
      description: args.description,
      icon: args.icon ?? workspace.icon,
      category: args.category,
      industryTags: args.industryTags,
      workspaceType: workspace.type,
      defaultSettings: workspace.settings,
      defaultTimezone: workspace.timezone,
      defaultLanguage: workspace.language,
      enabledFeatures: workspace.settings?.enabledFeatures ?? [],
      customRoles: customRoles.length > 0 ? customRoles : undefined,
      isSystemTemplate: false,
      isPublic: args.isPublic ?? false,
      createdBy: userId,
      createdAt: Date.now(),
      usageCount: 0,
    });

    // Log audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace_template",
      entityId: String(templateId),
      action: "template_created_from_workspace",
      diff: { templateName: args.name },
      createdAt: Date.now(),
    });

    return templateId;
  },
});
