import { internalMutation, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { paymentAttemptDataValidator } from "./paymentAttemptTypes";

async function userByClerkId(ctx: QueryCtx, clerkId: string | null | undefined) {
  if (!clerkId) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export const savePaymentAttempt = internalMutation({
  args: {
    paymentAttemptData: paymentAttemptDataValidator,
  },
  returns: v.null(),
  handler: async (ctx, { paymentAttemptData }) => {
    const user = await userByClerkId(ctx, paymentAttemptData.payer.user_id);

    const existingPaymentAttempt = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_payment_id", (q) =>
        q.eq("payment_id", paymentAttemptData.payment_id),
      )
      .unique();

    const paymentAttemptRecord = {
      ...paymentAttemptData,
      userId: user?._id,
    };

    if (existingPaymentAttempt) {
      await ctx.db.patch(existingPaymentAttempt._id, paymentAttemptRecord as any);
    } else {
      await ctx.db.insert("paymentAttempts", paymentAttemptRecord as any);
    }

    return null;
  },
});
