import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  currencySettings: defineTable({
    workspaceId: v.string(),
    // Base currency for the workspace (e.g., USD)
    baseCurrency: v.string(),
    // List of enabled currencies (e.g., ["USD", "EUR", "SAR"])
    enabledCurrencies: v.array(v.string()),
    // API key for external exchange rate service
    apiKey: v.optional(v.string()),
    // Auto-update settings
    autoUpdate: v.boolean(),
    autoUpdateInterval: v.number(), // in minutes
    // Last update timestamp
    lastUpdateAt: v.number(),
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_workspace", ["workspaceId"]),

  exchangeRates: defineTable({
    workspaceId: v.string(),
    // Currency pair
    fromCurrency: v.string(),
    toCurrency: v.string(),
    // Exchange rate value
    rate: v.number(),
    // Rate timestamp
    timestamp: v.number(),
    // Source of rate (api, manual, etc)
    source: v.string(),
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_pair", ["workspaceId", "fromCurrency", "toCurrency"])
    .index("by_currency", ["workspaceId", "fromCurrency"]),
} as const;
