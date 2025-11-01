import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";
import { serviceObject } from "./queries";
import type { MutationCtx, Id } from "../../_generated";

const baseFields = {
  slug: v.string(),
  displayOrder: v.number(),
  labelId: v.string(),
  labelEn: v.string(),
  labelAr: v.string(),
  active: v.optional(v.boolean()),
};

export const createService = mutation({
  args: baseFields,
  returns: serviceObject,
  handler: async (
    ctx: MutationCtx,
    args: {
      slug: string;
      displayOrder: number;
      labelId: string;
      labelEn: string;
      labelAr: string;
      active?: boolean;
    },
  ) => {
    const actor = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Service with this slug already exists");
    }

    const serviceId = await ctx.db.insert("services", {
      slug: args.slug,
      displayOrder: args.displayOrder,
      labelId: args.labelId,
      labelEn: args.labelEn,
      labelAr: args.labelAr,
      active: args.active ?? true,
    });

    const doc = await ctx.db.get(serviceId);
    if (!doc) {
      throw new Error("Failed to create service");
    }

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "services",
      entityId: serviceId,
      action: "create",
      changes: { ...args },
    });

    return doc;
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    slug: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    labelId: v.optional(v.string()),
    labelEn: v.optional(v.string()),
    labelAr: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  returns: serviceObject,
  handler: async (
    ctx: MutationCtx,
    args: {
      id: Id<"services">;
      slug?: string;
      displayOrder?: number;
      labelId?: string;
      labelEn?: string;
      labelAr?: string;
      active?: boolean;
    },
  ) => {
    const actor = await requireAdmin(ctx);
    const service = await ctx.db.get(args.id);
    if (!service) {
      throw new Error("Service not found");
    }

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (key !== "id" && value !== undefined) {
        patch[key] = value;
      }
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.id, patch);
    }

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new Error("Failed to update service");
    }

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "services",
      entityId: args.id,
      action: "update",
      changes: patch,
    });

    return updated;
  },
});

export const deleteService = mutation({
  args: {
    id: v.id("services"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, { id }: { id: Id<"services"> }) => {
    const actor = await requireAdmin(ctx);

    await ctx.db.delete(id);

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "services",
      entityId: id,
      action: "delete",
    });

    return { success: true };
  },
});


