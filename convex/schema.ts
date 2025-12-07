import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"
import { paymentAttemptSchemaValidator } from "./payment/paymentAttemptTypes"
import { featureTables } from "./features/_schema"

// Table definitions are organized per feature under convex/features/**/api/schema.ts.
// Extend the auth users table to include extra fields
const extendedAuthTables = {
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    avatarUrl: v.optional(v.string()),
    email: v.string(),
    // `status` may be missing on legacy users; treat as optional during
    // configuration. Runtime code should handle defaulting (e.g. to "active").
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("blocked"))),
    // `clerkId` for full parity.
    clerkId: v.optional(v.string()),
    // Current active workspace for the user (optional)
    workspaceId: v.optional(v.id("workspaces")),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"]),
}

export default defineSchema({
  ...extendedAuthTables,
  ...featureTables,
  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("by_payment_id", ["payment_id"])
    .index("by_user_id", ["userId"])
    .index("by_payer_user_id", ["payer.user_id"]),
})

