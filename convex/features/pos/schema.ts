/**
 * POS (Point of Sale) Feature Schema
 * Provides POS functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const posTables = {
  // POS Products (quick access items for POS)
  posProducts: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    price: v.number(),
    cost: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    taxRate: v.optional(v.number()),
    isActive: v.boolean(),
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    variants: v.optional(v.array(v.object({
      name: v.string(),
      price: v.number(),
      sku: v.optional(v.string()),
    }))),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_sku", ["sku"])
    .index("by_barcode", ["barcode"])
    .index("by_category", ["category"]),

  // POS Transactions
  posTransactions: defineTable({
    transactionNumber: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("refunded"),
      v.literal("voided")
    ),
    items: v.array(v.object({
      productId: v.optional(v.id("posProducts")),
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
      discount: v.optional(v.number()),
      tax: v.optional(v.number()),
      total: v.number(),
    })),
    subtotal: v.number(),
    discount: v.optional(v.number()),
    tax: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("digital"),
      v.literal("other")
    ),
    paymentDetails: v.optional(v.record(v.string(), v.any())),
    customerId: v.optional(v.id("contacts")),
    customerName: v.optional(v.string()),
    notes: v.optional(v.string()),
    cashierId: v.id("users"),
    terminalId: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_transaction_number", ["transactionNumber"])
    .index("by_status", ["status"])
    .index("by_cashier", ["cashierId"])
    .index("by_date", ["createdAt"]),
};

export default posTables;
