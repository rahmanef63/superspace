import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";

// Using Clerk via convex/react-clerk. We don't configure providers in
// @convex-dev/auth since Clerk handles auth on the frontend and issues JWTs.
// Provide an empty provider list to avoid misconfiguring Convex Auth.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [],
} as any);

export const loggedInUser = query({
  handler: async (ctx) => {
    const maybeAuthUserId = await getAuthUserId(ctx);
    if (!maybeAuthUserId) return null as any;

    // If we already have a Convex user doc ID, return that user document.
    if (typeof maybeAuthUserId !== "string") {
      const user = await ctx.db.get(maybeAuthUserId as any);
      return user ?? null;
    }

    // Otherwise, we're in an auth state where the identity is available
    // but we haven't created a Convex users document yet.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null as any;

    // Try to find an existing users doc by email or phone (read-only in query)
    let userDoc: any = null;
    if (identity.email) {
      userDoc = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
    }
    if (!userDoc && (identity as any).phone) {
      // Note: Phone queries should use an appropriate field in the users table
      // For now, skip phone-based lookup since it's not in the schema
      userDoc = null;
    }

    // If no user doc yet, return null; a mutation like createWorkspace will create it.
    return userDoc ?? null;
  },
});
