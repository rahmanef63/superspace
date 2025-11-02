/**
 * CMS Lite Website Settings Queries
 * 
 * Read-only operations for website settings.
 */

import { query } from "../../../../_generated/server";
import type { QueryCtx } from "../../../../_generated/server";
import { v } from "convex/values";

/**
 * Get website settings for a workspace
 * Returns null if no settings exist yet
 */
export const getWebsiteSettings = query({
  args: { 
    workspaceId: v.id("workspaces") 
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    
    return settings;
  },
});

/**
 * Get website settings by subdomain
 * Used for public website resolution
 */
export const getWebsiteSettingsBySubdomain = query({
  args: { 
    subdomain: v.string() 
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
    
    return settings;
  },
});

/**
 * Get website settings by custom domain
 * Used for custom domain resolution
 */
export const getWebsiteSettingsByCustomDomain = query({
  args: { 
    customDomain: v.string() 
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", args.customDomain))
      .first();
    
    return settings;
  },
});

/**
 * Check if a subdomain is available
 */
export const isSubdomainAvailable = query({
  args: { 
    subdomain: v.string(),
    excludeWorkspaceId: v.optional(v.id("workspaces")) 
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain))
      .first();
    
    // Available if doesn't exist, or if it belongs to the excluded workspace
    if (!existing) return true;
    if (args.excludeWorkspaceId && existing.workspaceId === args.excludeWorkspaceId) {
      return true;
    }
    
    return false;
  },
});

/**
 * Check if a custom domain is available
 */
export const isCustomDomainAvailable = query({
  args: { 
    customDomain: v.string(),
    excludeWorkspaceId: v.optional(v.id("workspaces")) 
  },
  handler: async (ctx: QueryCtx, args) => {
    const existing = await ctx.db
      .query("cms_lite_website_settings")
      .withIndex("by_custom_domain", (q) => q.eq("customDomain", args.customDomain))
      .first();
    
    // Available if doesn't exist, or if it belongs to the excluded workspace
    if (!existing) return true;
    if (args.excludeWorkspaceId && existing.workspaceId === args.excludeWorkspaceId) {
      return true;
    }
    
    return false;
  },
});
