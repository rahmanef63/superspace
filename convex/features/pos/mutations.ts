import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for POS feature
 */

export const createTransaction = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    items: v.array(v.object({
      productId: v.optional(v.id("posProducts")),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      discount: v.optional(v.number()),
      tax: v.optional(v.number()),
      total: v.number(),
    })),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("digital"),
      v.literal("other")
    ),
    subtotal: v.number(),
    discount: v.optional(v.number()),
    tax: v.optional(v.number()),
    total: v.number(),
    customerId: v.optional(v.id("contacts")),
    customerName: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    // Generate transaction number
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const id = await ctx.db.insert("posTransactions", {
      workspaceId: args.workspaceId,
      transactionNumber,
      items: args.items,
      paymentMethod: args.paymentMethod,
      subtotal: args.subtotal,
      discount: args.discount,
      tax: args.tax,
      total: args.total,
      status: "completed",
      customerId: args.customerId,
      customerName: args.customerName,
      notes: args.notes,
      cashierId: userId,
      createdAt: Date.now(),
    })

    return { id, transactionNumber, success: true }
  },
})
