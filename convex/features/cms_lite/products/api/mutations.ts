import { mutation } from "../../_generated";
import type { MutationCtx } from "../../_generated";
import { v } from "convex/values";
import type { Doc, Id } from "../../_generated";
import { requireAdmin, requireEditor } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";
import { productObject, serializeProduct } from "./queries";

type ProductDoc = Doc<"products">;

const baseProductArgs = {
  slug: v.string(),
  titleId: v.string(),
  titleEn: v.string(),
  titleAr: v.string(),
  descId: v.optional(v.union(v.string(), v.null())),
  descEn: v.optional(v.union(v.string(), v.null())),
  descAr: v.optional(v.union(v.string(), v.null())),
  price: v.number(),
  currency: v.string(),
  paymentLink: v.optional(v.union(v.string(), v.null())),
  coverImage: v.optional(v.union(v.string(), v.null())),
  status: v.string(),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
  metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
  scheduledActivateAt: v.optional(v.union(v.number(), v.null())),
};

type ProductWriteArgs = {
  slug: string;
  titleId: string;
  titleEn: string;
  titleAr: string;
  descId?: string | null;
  descEn?: string | null;
  descAr?: string | null;
  price: number;
  currency: string;
  paymentLink?: string | null;
  coverImage?: string | null;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  scheduledActivateAt?: number | null;
};

function buildProductWritePayload(
  args: ProductWriteArgs,
  actorId: string,
  existing?: ProductDoc,
) {
  return {
    slug: args.slug,
    titleId: args.titleId,
    titleEn: args.titleEn,
    titleAr: args.titleAr,
    descId: args.descId ?? null,
    descEn: args.descEn ?? null,
    descAr: args.descAr ?? null,
    price: args.price,
    currency: args.currency,
    paymentLink: args.paymentLink ?? null,
    coverImage: args.coverImage ?? null,
    status: args.status,
    metaTitle: args.metaTitle ?? null,
    metaDescription: args.metaDescription ?? null,
    metaKeywords: args.metaKeywords ?? null,
    scheduledActivateAt: args.scheduledActivateAt ?? null,
    available: existing?.available ?? true,
    updatedBy: actorId,
    createdBy: existing?.createdBy ?? actorId,
  };
}

export const createProduct = mutation({
  args: baseProductArgs,
  returns: productObject,
  handler: async (ctx: MutationCtx, args: ProductWriteArgs) => {
    const actor = await requireEditor(ctx);

    const conflict = await ctx.db
      .query("products")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
    if (conflict) {
      throw new Error("Product with this slug already exists");
    }

    const productId = await ctx.db.insert(
      "products",
      buildProductWritePayload(args, actor.clerkUserId),
    );

    const product = await ctx.db.get(productId);
    if (!product) {
      throw new Error("Failed to load product after creation");
    }

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "product",
      entityId: productId,
      action: "create",
      changes: {
        slug: product.slug,
        status: product.status,
      },
    });

    return serializeProduct(product);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    ...baseProductArgs,
  },
  returns: productObject,
  handler: async (
    ctx: MutationCtx,
    args: ProductWriteArgs & {
      id: Id<"products">;
    },
  ) => {
    const actor = await requireEditor(ctx);

    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    const conflict = await ctx.db
      .query("products")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
    if (conflict && conflict._id !== args.id) {
      throw new Error("Another product with this slug already exists");
    }

    const payload = buildProductWritePayload(args, actor.clerkUserId, product);

    await ctx.db.patch(args.id, payload);

    const updated = await ctx.db.get(args.id);
    if (!updated) {
      throw new Error("Failed to load product after update");
    }

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "product",
      entityId: args.id,
      action: "update",
      changes: {
        titleEn: updated.titleEn,
        status: updated.status,
      },
    });

    return serializeProduct(updated);
  },
});

export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx: MutationCtx, { id }: { id: Id<"products"> }) => {
    const actor = await requireEditor(ctx);

    const product = await ctx.db.get(id);
    if (!product) {
      throw new Error("Product not found");
    }

    await ctx.db.delete(id);

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "product",
      entityId: id,
      action: "delete",
    });

    return { success: true };
  },
});

export const bulkUpdateProducts = mutation({
  args: {
    ids: v.array(v.id("products")),
    action: v.union(
      v.literal("activate"),
      v.literal("deactivate"),
      v.literal("delete"),
      v.literal("update_price"),
    ),
    priceMultiplier: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    affected: v.number(),
  }),
  handler: async (
    ctx: MutationCtx,
    args: {
      ids: Id<"products">[];
      action: "activate" | "deactivate" | "delete" | "update_price";
      priceMultiplier?: number;
    },
  ) => {
    const actor = await requireAdmin(ctx);

    if (args.ids.length === 0) {
      return { success: true, affected: 0 };
    }

    let affected = 0;

    for (const id of args.ids) {
      const product = await ctx.db.get(id);
      if (!product) {
        continue;
      }

      switch (args.action) {
        case "activate": {
          await ctx.db.patch(id, { available: true, updatedBy: actor.clerkUserId });
          affected += 1;
          await recordAuditEvent(ctx, {
            actorId: actor.clerkUserId,
            entity: "product",
            entityId: id,
            action: "activate",
          });
          break;
        }
        case "deactivate": {
          await ctx.db.patch(id, { available: false, updatedBy: actor.clerkUserId });
          affected += 1;
          await recordAuditEvent(ctx, {
            actorId: actor.clerkUserId,
            entity: "product",
            entityId: id,
            action: "deactivate",
          });
          break;
        }
        case "delete": {
          await ctx.db.delete(id);
          affected += 1;
          await recordAuditEvent(ctx, {
            actorId: actor.clerkUserId,
            entity: "product",
            entityId: id,
            action: "delete",
          });
          break;
        }
        case "update_price": {
          if (args.priceMultiplier && args.priceMultiplier > 0) {
            const newPrice = product.price * args.priceMultiplier;
            await ctx.db.patch(id, {
              price: newPrice,
              updatedBy: actor.clerkUserId,
            });
            affected += 1;
            await recordAuditEvent(ctx, {
              actorId: actor.clerkUserId,
              entity: "product",
              entityId: id,
              action: "update_price",
              changes: {
                previousPrice: product.price,
                newPrice,
              },
            });
          }
          break;
        }
      }
    }

    return { success: true, affected };
  },
});


