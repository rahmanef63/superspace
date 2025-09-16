import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";

export const PROVIDER_CLERK = "clerk" as const;

export async function resolveCandidateUserIds(ctx: any): Promise<any[]> {
  const candidateIds: any[] = [];

  const authId = await getAuthUserId(ctx);
  if (authId) candidateIds.push(authId as any);

  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    // Linked auth account (e.g., Clerk subject -> users.userId)
    try {
      const account = await ctx.db
        .query("authAccounts")
        .withIndex("providerAndAccountId", (q: any) =>
          q.eq("provider", PROVIDER_CLERK).eq("providerAccountId", String(identity.subject))
        )
        .unique();
      if (account) candidateIds.push(account.userId as any);
    } catch (_err) {
      // Table may not exist or not linked yet
    }
    if (identity.email) {
      const byEmailAll = await ctx.db
        .query("users")
        .withIndex("email", (q: any) => q.eq("email", identity.email!))
        .collect();
      for (const u of byEmailAll) candidateIds.push(u._id as any);
    }
    const phone = (identity as any).phone as string | undefined;
    if (phone) {
      const byPhoneAll = await ctx.db
        .query("users")
        .withIndex("phone", (q: any) => q.eq("phone", phone))
        .collect();
      for (const u of byPhoneAll) candidateIds.push(u._id as any);
    }
  }

  return [...new Set(candidateIds.map(String))] as any[];
}

// Query-safe helper: resolve an existing Convex users DocId for
// the current identity without writing to the database.
export async function getExistingUserId(ctx: any): Promise<Id<"users"> | null> {
  const authId = await getAuthUserId(ctx);
  if (authId && typeof authId !== "string") return authId as Id<"users">;

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Try linked account
  try {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q: any) =>
        q.eq("provider", PROVIDER_CLERK).eq("providerAccountId", String(identity.subject))
      )
      .unique();
    if (account) {
      const userDoc = await ctx.db.get(account.userId);
      if (userDoc) return userDoc._id as Id<"users">;
    }
  } catch (_err) {}

  if (identity.email) {
    const byEmail = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", identity.email!))
      .first();
    if (byEmail) return byEmail._id as Id<"users">;
  }
  const phone = (identity as any).phone as string | undefined;
  if (phone) {
    const byPhone = await ctx.db
      .query("users")
      .withIndex("phone", (q: any) => q.eq("phone", phone))
      .first();
    if (byPhone) return byPhone._id as Id<"users">;
  }

  return null;
}

// Mutation-only: ensure a Convex users document exists and return its Id.
export async function ensureUser(ctx: any): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  // Only return immediately if we already have a Convex users DocId
  if (userId && typeof userId !== "string") return userId as Id<"users">;

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  // Try to find existing user by linked account, email, or phone
  try {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q: any) =>
        q.eq("provider", PROVIDER_CLERK).eq("providerAccountId", String(identity.subject))
      )
      .unique();
    if (account) {
      const userDoc = await ctx.db.get(account.userId);
      if (userDoc) return userDoc._id as Id<"users">;
    }
  } catch (_err) {}

  if (identity.email) {
    const byEmail = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", identity.email!))
      .first();
    if (byEmail) return byEmail._id as Id<"users">;
  }
  const phone = (identity as any).phone as string | undefined;
  if (phone) {
    const byPhone = await ctx.db
      .query("users")
      .withIndex("phone", (q: any) => q.eq("phone", phone))
      .first();
    if (byPhone) return byPhone._id as Id<"users">;
  }

  // Create a minimal users record
  const newUserId = (await ctx.db.insert("users", {
    name: identity.name ?? undefined,
    image: ((identity as any).pictureUrl ?? (identity as any).imageUrl) ?? undefined,
    email: identity.email ?? undefined,
    phone: (identity as any).phone ?? undefined,
    isAnonymous: false,
  } as any)) as Id<"users">;

  // Link identity to the users doc for future lookups
  try {
    await ctx.db.insert("authAccounts", {
      userId: newUserId,
      provider: PROVIDER_CLERK,
      providerAccountId: String(identity.subject),
    } as any);
  } catch (_err) {
    // unique race tolerance
  }

  return newUserId;
}

export async function requireActiveMembership(
  ctx: any,
  workspaceId: Id<"workspaces">,
  opts: { allowCreatorFallback?: boolean } = { allowCreatorFallback: true }
): Promise<{ membership: any | null; role: any | null }> {
  const candidateIds = await resolveCandidateUserIds(ctx);
  if (candidateIds.length === 0) throw new Error("Not authenticated");

  for (const idStr of candidateIds) {
    const m = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q: any) =>
        q.eq("userId", idStr as any).eq("workspaceId", workspaceId)
      )
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .unique();
    if (m) {
      const role = await ctx.db.get(m.roleId);
      return { membership: m, role };
    }
  }

  if (opts.allowCreatorFallback) {
    const workspace = await ctx.db.get(workspaceId);
    const isCreator = workspace && candidateIds.includes(String(workspace.createdBy));
    if (isCreator) return { membership: null, role: null };
  }

  throw new Error("Not authorized");
}

export function hasPermission(role: any, perm: string) {
  return Boolean(role?.permissions?.includes("*") || role?.permissions?.includes(perm));
}

// Guard requiring a specific permission within a workspace.
// Returns membership/role for convenience if authorized.
export async function requirePermission(
  ctx: any,
  workspaceId: Id<"workspaces">,
  perm: string,
  opts: { allowCreatorFallback?: boolean } = { allowCreatorFallback: true }
): Promise<{ membership: any | null; role: any | null }> {
  const { membership, role } = await requireActiveMembership(ctx, workspaceId, opts);
  if (role && hasPermission(role, perm)) return { membership, role };

  // If creator fallback is enabled and no role, allow only if creator.
  if (!role && opts.allowCreatorFallback) {
    const workspace = await ctx.db.get(workspaceId);
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (workspace && candidateIds.includes(String(workspace.createdBy))) {
      return { membership: null, role: null };
    }
  }
  throw new Error("Insufficient permissions");
}

// Boolean variant for conditional checks.
export async function canPermission(
  ctx: any,
  workspaceId: Id<"workspaces">,
  perm: string,
  opts: { allowCreatorFallback?: boolean } = { allowCreatorFallback: true }
): Promise<boolean> {
  try {
    await requirePermission(ctx, workspaceId, perm, opts);
    return true;
  } catch {
    return false;
  }
}
