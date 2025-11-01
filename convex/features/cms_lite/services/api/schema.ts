import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  services: defineTable({
    slug: v.string(),
    displayOrder: v.number(),
    labelId: v.string(),
    labelEn: v.string(),
    labelAr: v.string(),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "displayOrder"])
    .index("by_display_order", ["displayOrder"]),
} as const;
