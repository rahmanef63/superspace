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
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    // ID from Clerk (or other auth provider). Used to look up users.
    // Made optional to accommodate pre-existing records without this field.
    externalId: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("byExternalId", ["externalId"]),
}

export default defineSchema({
  ...extendedAuthTables,
  ...featureTables,
  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),
})

