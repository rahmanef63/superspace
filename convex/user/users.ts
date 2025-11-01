import { internalMutation, mutation, query, QueryCtx } from "../_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import type { Doc } from "../_generated/dataModel";

const deriveStatus = (user: UserJSON): "active" | "inactive" | "blocked" => {
  if ((user as any).banned === true) return "blocked";
  if ((user as any).locked === true) return "inactive";
  return "active";
};

const resolvePrimaryEmail = (user: UserJSON): string => {
  const primaryId = user.primary_email_address_id;
  const primary = primaryId
    ? user.email_addresses?.find((email) => email.id === primaryId)
    : undefined;
  const email = primary?.email_address ?? user.email_addresses?.[0]?.email_address;
  return email ?? `${user.id}@generated.invalid`;
};

const buildUserAttributes = (user: UserJSON) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const metadata =
    user.public_metadata && Object.keys(user.public_metadata).length > 0
      ? (user.public_metadata as Record<string, any>)
      : undefined;

  return {
    name: fullName.length > 0 ? fullName : user.username ?? undefined,
    email: resolvePrimaryEmail(user),
    status: deriveStatus(user),
    clerkId: user.id,
    avatarUrl:
      (user as any).image_url ?? (user as any).profile_image_url ?? undefined,
    metadata,
  };
};

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = buildUserAttributes(data);

    const user = await userByClerkId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByClerkId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});



export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

async function userByClerkId(ctx: QueryCtx, clerkId: string): Promise<Doc<"users"> | null> {
  if (!clerkId) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await getCurrentUserOrThrow(ctx);
    const patch: any = {};
    if (typeof args.name !== "undefined") patch.name = args.name;
    if (typeof args.bio !== "undefined") patch.bio = args.bio;
    if (typeof args.image !== "undefined") patch.avatarUrl = args.image;
    if (Object.keys(patch).length === 0) return;
    await ctx.db.patch(user._id as any, patch);
  },
});
