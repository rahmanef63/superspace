import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for contacts feature
 * Note: Uses CRM contacts schema with firstName/lastName fields
 */

export const createContact = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.id("accounts")),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("contacts", {
      workspaceId: args.workspaceId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      company: args.company,
      title: args.title,
      tags: args.tags ?? [],
      notes: args.notes,
      owner: userId,
      isActive: true,
      isOptOut: false,
      isDoNotCall: false,
      isKeyContact: false,
      contactType: "primary",
      preferredContact: "email",
      emailConsent: true,
      smsConsent: false,
      marketingConsent: false,
      leadScore: 0,
      engagementScore: 0,
      relatedContacts: [],
      customFields: [],
      address: {
        line1: "",
        city: "",
        country: "",
        postalCode: "",
      },
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      updatedBy: userId,
    })

    return { id, success: true }
  },
})

export const updateContact = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contactId: v.id("contacts"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.id("accounts")),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const contact = await ctx.db.get(args.contactId)
    if (!contact || contact.workspaceId !== args.workspaceId) {
      throw new Error("Contact not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now(), updatedBy: userId }
    if (args.firstName !== undefined) updates.firstName = args.firstName
    if (args.lastName !== undefined) updates.lastName = args.lastName
    if (args.email !== undefined) updates.email = args.email
    if (args.phone !== undefined) updates.phone = args.phone
    if (args.company !== undefined) updates.company = args.company
    if (args.title !== undefined) updates.title = args.title
    if (args.tags !== undefined) updates.tags = args.tags
    if (args.notes !== undefined) updates.notes = args.notes

    await ctx.db.patch(args.contactId, updates)

    return { success: true }
  },
})

export const deleteContact = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const contact = await ctx.db.get(args.contactId)
    if (!contact || contact.workspaceId !== args.workspaceId) {
      throw new Error("Contact not found")
    }

    await ctx.db.delete(args.contactId)

    return { success: true }
  },
})
