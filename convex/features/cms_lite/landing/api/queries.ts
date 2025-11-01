import { query } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * Get content for a specific section and locale
 */
export const getContent = query({
  args: {
    workspaceId: v.string(),
    section: v.string(),
    locale: v.string(),
    fallbackLocale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get content in requested locale
    const content = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("section", args.section)
         .eq("locale", args.locale)
      )
      .filter((q) => q.eq("status", "published"))
      .unique();

    if (content) {
      return {
        section: args.section,
        locale: args.locale,
        content: content.content,
        metadata: content.metadata,
      };
    }

    // Try fallback locale if provided
    if (args.fallbackLocale) {
      const fallbackLocale = args.fallbackLocale!;
      const fallbackContent = await ctx.db
        .query("landingContent")
        .withIndex("by_section_locale", (q) =>
          q.eq("workspaceId", args.workspaceId)
           .eq("section", args.section)
           .eq("locale", fallbackLocale)
        )
        .filter((q) => q.eq("status", "published"))
        .unique();

      if (fallbackContent) {
        return {
          section: args.section,
          locale: fallbackLocale,
          content: fallbackContent.content,
          metadata: fallbackContent.metadata,
          isFallback: true,
        };
      }
    }

    // Return empty content if nothing found
    return {
      section: args.section,
      locale: args.locale,
      content: {
        type: "text",
      },
      metadata: {},
    };
  },
});

/**
 * List all sections for a locale
 */
export const listSections = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("landingContent")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("locale", args.locale));

    if (args.status) {
      q = q.filter((q) => q.eq("status", args.status));
    }

    const sections = await q.collect();

    return sections.map(section => ({
      section: section.section,
      locale: section.locale,
      type: section.content.type,
      title: section.content.title,
      status: section.status,
      updatedAt: section.updatedAt,
      publishedAt: section.publishedAt,
    }));
  },
});

/**
 * Get all versions of a section (all locales)
 */
export const getSectionVersions = query({
  args: {
    workspaceId: v.string(),
    section: v.string(),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("landingContent")
      .withIndex("by_section_locale", (q) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("section", args.section)
      )
      .collect();

    return versions.map(version => ({
      locale: version.locale,
      status: version.status,
      updatedAt: version.updatedAt,
      publishedAt: version.publishedAt,
      updatedBy: version.updatedBy,
    }));
  },
});

