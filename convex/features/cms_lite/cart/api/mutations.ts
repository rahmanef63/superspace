import { mutation } from "../../_generated";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "../../_generated";

/**
 * Add an item to the cart
 */
export const addItem = mutation({
  args: {
    workspaceId: v.string(),
    productId: v.string(),
    productType: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    quantity: v.number(),
    unitPrice: v.number(),
    currency: v.string(),
    options: v.optional(
      v.array(
        v.object({
          name: v.string(),
          value: v.string(),
          priceModifier: v.optional(v.number()),
        })
      )
    ),
  },
  returns: v.object({
    cartId: v.id("carts"),
    itemId: v.id("cartItems"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Find or create active cart
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!cart) {
      // Create new cart
      const cartId = await ctx.db.insert("carts", {
        userId: identity.subject,
        workspaceId: args.workspaceId,
        status: "active",
        itemCount: 0,
        subtotal: 0,
        currency: args.currency,
        lastActivityAt: Date.now(),
        createdBy: identity.subject,
        updatedBy: identity.subject,
      });
      cart = await ctx.db.get(cartId);
      if (!cart) throw new ConvexError("Failed to create cart");
    }

    if (!cart) {
      throw new ConvexError("Cart not available");
    }
    const cartDoc = cart;

    // Add item to cart
    const itemId = await ctx.db.insert("cartItems", {
      cartId: cartDoc._id,
      productId: args.productId,
      productType: args.productType,
      name: args.name,
      description: args.description,
      quantity: args.quantity,
      unitPrice: args.unitPrice,
      currency: args.currency,
      options: args.options,
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    // Update cart totals
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cartDoc._id))
      .collect();

    const subtotal = items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    await ctx.db.patch(cartDoc._id, {
      itemCount: items.length,
      subtotal,
      lastActivityAt: Date.now(),
      updatedBy: identity.subject,
    });

    return { cartId: cartDoc._id, itemId };
  },
});

/**
 * Update item quantity in cart
 */
export const updateItemQuantity = mutation({
  args: {
    itemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Get item and verify cart ownership
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new ConvexError("Item not found");
    }

    const cart = await ctx.db.get(item.cartId);
    if (!cart || cart.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    if (args.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await ctx.db.delete(args.itemId);
    } else {
      // Update quantity
      await ctx.db.patch(args.itemId, {
        quantity: args.quantity,
        updatedBy: identity.subject,
      });
    }

    // Update cart totals
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    const subtotal = items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );

    await ctx.db.patch(cart._id, {
      itemCount: items.length,
      subtotal,
      lastActivityAt: Date.now(),
      updatedBy: identity.subject,
    });

    return null;
  },
});

/**
 * Clear all items from cart
 */
export const clearCart = mutation({
  args: {
    cartId: v.id("carts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Verify cart ownership
    const cart = await ctx.db.get(args.cartId);
    if (!cart || cart.userId !== identity.subject) {
      throw new ConvexError("Unauthorized");
    }

    // Delete all items
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Reset cart totals
    await ctx.db.patch(args.cartId, {
      itemCount: 0,
      subtotal: 0,
      lastActivityAt: Date.now(),
      updatedBy: identity.subject,
    });

    return null;
  },
});

