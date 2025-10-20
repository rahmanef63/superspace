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
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"]);

export const tasks = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"]);

export const wiki = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"]);

export const contentTables = {
  reports,
  calendar,
  tasks,
  wiki,
};
