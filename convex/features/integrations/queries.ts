import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for integrations feature
 */

export const getIntegrations = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return integrations
  },
})

export const getAvailableIntegrations = query({
  handler: async () => {
    // Return list of available integrations
    return [
      { id: "slack", name: "Slack", category: "communication" },
      { id: "discord", name: "Discord", category: "communication" },
      { id: "gdrive", name: "Google Drive", category: "storage" },
      { id: "dropbox", name: "Dropbox", category: "storage" },
      { id: "salesforce", name: "Salesforce", category: "crm" },
      { id: "hubspot", name: "HubSpot", category: "crm" },
      { id: "mailchimp", name: "Mailchimp", category: "marketing" },
      { id: "stripe", name: "Stripe", category: "payment" },
      { id: "zapier", name: "Zapier", category: "automation" },
      { id: "github", name: "GitHub", category: "development" },
    ]
  },
})
