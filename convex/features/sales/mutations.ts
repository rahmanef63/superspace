import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for sales feature
 * Manages quotes, invoices, and sales-related operations
 */

// ============================================================================
// Quote Mutations
// ============================================================================

/**
 * Create a new quote/estimate
 */
export const createQuote = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        customerId: v.id("users"),
        currency: v.string(),
        validUntil: v.number(),
        terms: v.string(),
        notes: v.optional(v.string()),
        items: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            quantity: v.number(),
            unitPrice: v.number(),
            discount: v.number(),
            taxRate: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const now = Date.now()

        // Calculate totals
        let subtotal = 0
        let totalTax = 0
        let totalDiscount = 0

        const processedItems = args.items.map(item => {
            const lineTotal = item.quantity * item.unitPrice
            const discountAmount = (lineTotal * item.discount) / 100
            const afterDiscount = lineTotal - discountAmount
            const taxAmount = (afterDiscount * item.taxRate) / 100
            const total = afterDiscount + taxAmount

            subtotal += afterDiscount
            totalTax += taxAmount
            totalDiscount += discountAmount

            return {
                ...item,
                taxAmount,
                total,
            }
        })

        const total = subtotal + totalTax

        // Generate quote number
        const existingQuotes = await ctx.db
            .query("quotes")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .collect()

        const quoteNumber = `QT-${String(existingQuotes.length + 1).padStart(6, "0")}`

        const quoteId = await ctx.db.insert("quotes", {
            workspaceId: args.workspaceId,
            quoteNumber,
            customerId: args.customerId,
            status: "draft",
            currency: args.currency,
            validUntil: args.validUntil,
            terms: args.terms,
            notes: args.notes,
            subtotal,
            taxAmount: totalTax,
            total,
            discountAmount: totalDiscount,
            paidAmount: 0,
            balance: total,
            items: processedItems,
            createdAt: now,
            updatedAt: now,
            createdBy: membership.userId,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.quote.create",
            resourceType: "quote",
            resourceId: quoteId,
            metadata: { quoteNumber, total },
        })

        return { quoteId, quoteNumber }
    },
})

/**
 * Update quote status
 */
export const updateQuoteStatus = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        quoteId: v.id("quotes"),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("expired"),
            v.literal("converted")
        ),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const quote = await ctx.db.get(args.quoteId)
        if (!quote || quote.workspaceId !== args.workspaceId) {
            throw new Error("Quote not found")
        }

        const now = Date.now()
        const updates: any = {
            status: args.status,
            updatedAt: now,
        }

        if (args.status === "sent") {
            updates.sentAt = now
        } else if (args.status === "accepted") {
            updates.acceptedAt = now
        }

        await ctx.db.patch(args.quoteId, updates)

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.quote.status_update",
            resourceType: "quote",
            resourceId: args.quoteId,
            metadata: { status: args.status },
        })

        return { success: true }
    },
})

// ============================================================================
// Invoice Mutations
// ============================================================================

/**
 * Create a new invoice
 */
export const createInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        customerId: v.id("users"),
        quoteId: v.optional(v.id("quotes")),
        currency: v.string(),
        dueDate: v.number(),
        terms: v.string(),
        notes: v.optional(v.string()),
        items: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.optional(v.string()),
            quantity: v.number(),
            unitPrice: v.number(),
            discount: v.number(),
            taxRate: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const now = Date.now()

        // Calculate totals
        let subtotal = 0
        let totalTax = 0
        let totalDiscount = 0

        const processedItems = args.items.map(item => {
            const lineTotal = item.quantity * item.unitPrice
            const discountAmount = (lineTotal * item.discount) / 100
            const afterDiscount = lineTotal - discountAmount
            const taxAmount = (afterDiscount * item.taxRate) / 100
            const total = afterDiscount + taxAmount

            subtotal += afterDiscount
            totalTax += taxAmount
            totalDiscount += discountAmount

            return {
                ...item,
                taxAmount,
                total,
            }
        })

        const total = subtotal + totalTax

        // Generate invoice number
        const existingInvoices = await ctx.db
            .query("invoices")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .collect()

        const invoiceNumber = `INV-${String(existingInvoices.length + 1).padStart(6, "0")}`

        const invoiceId = await ctx.db.insert("invoices", {
            workspaceId: args.workspaceId,
            invoiceNumber,
            customerId: args.customerId,
            quoteId: args.quoteId as any,
            status: "draft",
            currency: args.currency,
            dueDate: args.dueDate,
            terms: args.terms,
            notes: args.notes,
            subtotal,
            taxAmount: totalTax,
            total,
            discountAmount: totalDiscount,
            paidAmount: 0,
            balance: total,
            items: processedItems,
            createdAt: now,
            updatedAt: now,
            createdBy: membership.userId,
        })

        // If created from quote, update quote status
        if (args.quoteId) {
            await ctx.db.patch(args.quoteId, {
                status: "converted",
                invoiceId: invoiceId as any,
                updatedAt: now,
            })
        }

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.invoice.create",
            resourceType: "invoice",
            resourceId: invoiceId,
            metadata: { invoiceNumber, total },
        })

        return { invoiceId, invoiceNumber }
    },
})

/**
 * Record payment for invoice
 */
export const recordPayment = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        invoiceId: v.id("invoices"),
        amount: v.number(),
        paymentMethod: v.string(),
        reference: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const invoice = await ctx.db.get(args.invoiceId)
        if (!invoice || invoice.workspaceId !== args.workspaceId) {
            throw new Error("Invoice not found")
        }

        const now = Date.now()
        const newPaidAmount = invoice.paidAmount + args.amount
        const newBalance = invoice.total - newPaidAmount

        let newStatus = invoice.status
        if (newBalance <= 0) {
            newStatus = "paid"
        } else if (newPaidAmount > 0) {
            newStatus = "partial"
        }

        // Generate payment number
        const existingPayments = await ctx.db
            .query("payments")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .collect()
        
        const paymentNumber = `PMT-${String(existingPayments.length + 1).padStart(6, "0")}`

        // Record payment
        await ctx.db.insert("payments", {
            workspaceId: args.workspaceId,
            paymentNumber,
            invoiceId: args.invoiceId as any,
            customerId: invoice.customerId,
            amount: args.amount,
            currency: invoice.currency,
            paymentMethod: args.paymentMethod as any,
            status: "completed",
            refundAmount: 0,
            transactionDate: now,
            notes: args.notes,
            attachments: [],
            createdBy: membership.userId,
            createdAt: now,
            updatedAt: now,
        })

        // Update invoice
        await ctx.db.patch(args.invoiceId, {
            paidAmount: newPaidAmount,
            balance: newBalance,
            status: newStatus,
            updatedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.payment.record",
            resourceType: "invoice",
            resourceId: args.invoiceId,
            metadata: { amount: args.amount, paymentMethod: args.paymentMethod },
        })

        return { success: true, newBalance, newStatus }
    },
})

/**
 * Send invoice to customer
 */
export const sendInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        invoiceId: v.id("invoices"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const invoice = await ctx.db.get(args.invoiceId)
        if (!invoice || invoice.workspaceId !== args.workspaceId) {
            throw new Error("Invoice not found")
        }

        const now = Date.now()

        await ctx.db.patch(args.invoiceId, {
            status: "sent",
            sentAt: now,
            updatedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.invoice.send",
            resourceType: "invoice",
            resourceId: args.invoiceId,
            metadata: { invoiceNumber: invoice.invoiceNumber },
        })

        return { success: true }
    },
})

/**
 * Void an invoice
 */
export const voidInvoice = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        invoiceId: v.id("invoices"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.SALES_MANAGE
        )

        const invoice = await ctx.db.get(args.invoiceId)
        if (!invoice || invoice.workspaceId !== args.workspaceId) {
            throw new Error("Invoice not found")
        }

        if (invoice.paidAmount > 0) {
            throw new Error("Cannot void invoice with payments")
        }

        const now = Date.now()

        await ctx.db.patch(args.invoiceId, {
            status: "void",
            notes: `${invoice.notes || ""}\n\nVoided: ${args.reason}`,
            updatedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "sales.invoice.void",
            resourceType: "invoice",
            resourceId: args.invoiceId,
            metadata: { reason: args.reason },
        })

        return { success: true }
    },
})
