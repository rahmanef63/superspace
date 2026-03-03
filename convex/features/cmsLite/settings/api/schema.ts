import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  settings: defineTable({
    brandName: v.string(),
    defaultLocale: v.string(),
    heroImage: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    instagram: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
  }).index("by_default_locale", ["defaultLocale"]),
} as const;
