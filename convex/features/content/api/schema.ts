import { defineTable } from "convex/server";
import { v } from "convex/values";

export const reports = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"]);

export const calendar = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  startsAt: v.number(),
  endsAt: v.optional(v.number()),
  allDay: v.optional(v.boolean()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_start", ["workspaceId", "startsAt"]);

export const tasks = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("completed")),
  priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  dueDate: v.optional(v.number()),
  assigneeId: v.optional(v.id("users")),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_workspace_due", ["workspaceId", "dueDate"]);

export const wiki = defineTable({
  workspaceId: v.id("workspaces"),
  title: v.string(),
  slug: v.optional(v.string()),
  content: v.string(),
  summary: v.optional(v.string()),
  category: v.optional(v.string()),
  isPublished: v.optional(v.boolean()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_category", ["workspaceId", "category"])
  .index("by_workspace_slug", ["workspaceId", "slug"]);

export const contentTables = {
  reports,
  calendar,
  tasks,
  wiki,
};
