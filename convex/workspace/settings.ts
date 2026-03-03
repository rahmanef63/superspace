import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requirePermission, ensureUser } from "../auth/helpers";
import { PERMS } from "./permissions";
import type { Id } from "../_generated/dataModel";

/**
 * Workspace Settings Manager
 * Centralize workspace settings CRUD with validation, diff tracking, and audit logging
 */

// Update workspace settings with validation and audit trail
export const updateSettings = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    settings: v.object({
      allowInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      defaultRoleId: v.optional(v.id("roles")),
      allowPublicDocuments: v.optional(v.boolean()),
      theme: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);
    const userId = await ensureUser(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Validate defaultRoleId if provided
    if (args.settings.defaultRoleId) {
      const role = await ctx.db.get(args.settings.defaultRoleId);
      if (!role) throw new Error("Default role not found");
      if (role.workspaceId !== args.workspaceId) {
        throw new Error("Default role must belong to this workspace");
      }
    }

    // Validate theme if provided
    if (args.settings.theme && !["light", "dark", "system"].includes(args.settings.theme)) {
      throw new Error("Theme must be 'light', 'dark', or 'system'");
    }

    const oldSettings = workspace.settings || {};
    const newSettings = { ...oldSettings, ...args.settings };

    // Compute diff for audit trail
    const diff: Record<string, any> = {};
    for (const key of Object.keys(args.settings) as Array<keyof typeof args.settings>) {
      if (args.settings[key] !== undefined && oldSettings[key] !== args.settings[key]) {
        diff[key] = {
          old: oldSettings[key],
          new: args.settings[key],
        };
      }
    }

    // Update workspace
    await ctx.db.patch(args.workspaceId, { settings: newSettings });

    // Write audit event with diff
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace_settings",
      entityId: String(args.workspaceId),
      action: "workspace_settings_updated",
      diff: { changes: diff },
      createdAt: Date.now(),
    });

    return args.workspaceId;
  },
});

// Get workspace settings
export const getSettings = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const settings = workspace.settings || {};

    // Enrich with default role details if available
    let defaultRole = null;
    if (settings.defaultRoleId) {
      defaultRole = await ctx.db.get(settings.defaultRoleId);
    }

    return {
      ...settings,
      defaultRole: defaultRole ? {
        _id: defaultRole._id,
        name: defaultRole.name,
        slug: defaultRole.slug,
        color: defaultRole.color,
      } : null,
    };
  },
});

// Validate workspace settings (for pre-flight checks)
export const validateSettings = query({
  args: {
    workspaceId: v.id("workspaces"),
    settings: v.object({
      allowInvites: v.optional(v.boolean()),
      requireApproval: v.optional(v.boolean()),
      defaultRoleId: v.optional(v.id("roles")),
      allowPublicDocuments: v.optional(v.boolean()),
      theme: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const errors: string[] = [];

    // Validate defaultRoleId if provided
    if (args.settings.defaultRoleId) {
      const role = await ctx.db.get(args.settings.defaultRoleId);
      if (!role) {
        errors.push("Default role not found");
      } else if (role.workspaceId !== args.workspaceId) {
        errors.push("Default role must belong to this workspace");
      }
    }

    // Validate theme if provided
    if (args.settings.theme && !["light", "dark", "system"].includes(args.settings.theme)) {
      errors.push("Theme must be 'light', 'dark', or 'system'");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
});

// Get settings history (audit trail)
export const getSettingsHistory = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);

    const events = await ctx.db
      .query("activityEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("action"), "workspace_settings_updated"))
      .order("desc")
      .take(args.limit || 50);

    // Enrich with actor details
    const enriched = await Promise.all(
      events.map(async (event) => {
        const actor = await ctx.db.get(event.actorUserId);
        return {
          ...event,
          actor: actor ? {
            name: actor.name,
            email: actor.email,
            image: actor.avatarUrl,
          } : null,
        };
      })
    );

    return enriched;
  },
});

// Reset settings to defaults
export const resetToDefaults = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);
    const userId = await ensureUser(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Find default client role
    const clientRole = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("slug"), "client"))
      .first();

    const defaultSettings = {
      allowInvites: true,
      requireApproval: false,
      defaultRoleId: clientRole?._id as Id<"roles"> | undefined,
      allowPublicDocuments: false,
      theme: "system",
    };

    const oldSettings = workspace.settings || {};

    await ctx.db.patch(args.workspaceId, { settings: defaultSettings });

    // Write audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace_settings",
      entityId: String(args.workspaceId),
      action: "workspace_settings_reset",
      diff: {
        old: oldSettings,
        new: defaultSettings,
      },
      createdAt: Date.now(),
    });

    return args.workspaceId;
  },
});

// ============================================================================
// Timezone & Language Settings
// ============================================================================

// Valid IANA timezones (common ones - full list would be much larger)
const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

// Valid ISO 639-1 language codes
const SUPPORTED_LANGUAGES = [
  "en", // English
  "es", // Spanish
  "fr", // French
  "de", // German
  "pt", // Portuguese
  "id", // Indonesian
  "zh", // Chinese
  "ja", // Japanese
  "ko", // Korean
  "ar", // Arabic
  "hi", // Hindi
  "ru", // Russian
];

/**
 * Update workspace timezone
 */
export const updateTimezone = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);
    const userId = await ensureUser(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Validate timezone (basic check - in production, use a proper timezone library)
    // For now, we accept any string but log a warning for unknown timezones
    const isKnownTimezone = COMMON_TIMEZONES.includes(args.timezone);
    
    const oldTimezone = workspace.timezone;

    await ctx.db.patch(args.workspaceId, { timezone: args.timezone });

    // Write audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace_settings",
      entityId: String(args.workspaceId),
      action: "workspace_timezone_updated",
      diff: {
        old: oldTimezone,
        new: args.timezone,
        isKnownTimezone,
      },
      createdAt: Date.now(),
    });

    return args.workspaceId;
  },
});

/**
 * Update workspace language
 */
export const updateLanguage = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE);
    const userId = await ensureUser(ctx);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    // Validate language code
    if (!SUPPORTED_LANGUAGES.includes(args.language)) {
      throw new Error(
        `Unsupported language: ${args.language}. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`
      );
    }

    const oldLanguage = workspace.language;

    await ctx.db.patch(args.workspaceId, { language: args.language });

    // Write audit event
    await ctx.db.insert("activityEvents", {
      actorUserId: userId,
      workspaceId: args.workspaceId,
      entityType: "workspace_settings",
      entityId: String(args.workspaceId),
      action: "workspace_language_updated",
      diff: {
        old: oldLanguage,
        new: args.language,
      },
      createdAt: Date.now(),
    });

    return args.workspaceId;
  },
});

/**
 * Get workspace localization settings (timezone + language)
 */
export const getLocalizationSettings = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    return {
      timezone: workspace.timezone ?? "UTC",
      language: workspace.language ?? "en",
      supportedLanguages: SUPPORTED_LANGUAGES,
      commonTimezones: COMMON_TIMEZONES,
    };
  },
});

/**
 * Get list of supported timezones
 */
export const getSupportedTimezones = query({
  args: {},
  handler: async () => {
    return COMMON_TIMEZONES;
  },
});

/**
 * Get list of supported languages
 */
export const getSupportedLanguages = query({
  args: {},
  handler: async () => {
    return SUPPORTED_LANGUAGES.map((code) => ({
      code,
      name: getLanguageName(code),
    }));
  },
});

// Helper to get language name from code
function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    pt: "Português",
    id: "Bahasa Indonesia",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
    ar: "العربية",
    hi: "हिन्दी",
    ru: "Русский",
  };
  return names[code] ?? code;
}
