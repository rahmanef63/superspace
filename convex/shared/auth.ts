import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { isPlatformAdmin } from "../lib/platformAdmin";

export type ActionCtxWithDb = ActionCtx & { db: MutationCtx["db"] };
export type AnyConvexCtx = QueryCtx | MutationCtx | ActionCtxWithDb;

type DatabaseLike = MutationCtx["db"];

const dbFromCtx = (ctx: AnyConvexCtx): DatabaseLike => {
  if ("db" in ctx) {
    return (ctx as any).db as DatabaseLike;
  }
  throw new Error("Database access unavailable in this context");
};

export async function getUserByExternalId(
  ctx: AnyConvexCtx,
  externalId: string,
): Promise<Doc<"users"> | null> {
  const db = dbFromCtx(ctx);
  if (!externalId) return null;
  return db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", externalId))
    .unique();
}

export type MembershipInfo = {
  userId: string;
  userDocId: Id<"users">;
  workspaceId: Id<"workspaces">;
  roleLevel: number;
  permissions: string[];
};

export async function getMembership(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
): Promise<MembershipInfo | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const db = dbFromCtx(ctx);
  const email = (identity.email ?? identity.emailVerified ?? "") as string;

  // ========================================
  // PLATFORM ADMIN CHECK (HIGHEST PRIORITY)
  // ========================================
  if (isPlatformAdmin(email)) {
    
    // Platform admin has access to ALL workspaces with full permissions
    const convexUser = await getUserByExternalId(ctx, identity.subject);
    
    // Normalize workspaceId
    const normalizedWorkspaceId =
      typeof workspaceId === "string"
        ? (db as any).normalizeId?.("workspaces", workspaceId) ?? null
        : workspaceId;
    
    if (!normalizedWorkspaceId) {
      return null;
    }
    
    return {
      userId: identity.subject,
      userDocId: convexUser?._id ?? ("platform_admin" as any),
      workspaceId: normalizedWorkspaceId as Id<"workspaces">,
      roleLevel: 0, // Owner level
      permissions: ["*"], // All permissions
    };
  }

  // ========================================
  // NORMAL MEMBERSHIP LOOKUP
  // ========================================
  const convexUser = await getUserByExternalId(ctx, identity.subject);
  if (!convexUser) {
    return null;
  }

  const normalizedWorkspaceId =
    typeof workspaceId === "string"
      ? (db as any).normalizeId?.("workspaces", workspaceId) ?? null
      : workspaceId;
  if (!normalizedWorkspaceId) {
    return null;
  }
  const workspaceIdDoc = normalizedWorkspaceId as Id<"workspaces">;

  const membership = await db
    .query("workspaceMemberships")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceIdDoc).eq("userId", convexUser._id),
    )
    .unique();

  if (!membership) {
    return null;
  }

  const role = await db.get(membership.roleId);
  if (!role) {
    throw new Error(`Invalid role level ${membership.roleLevel}`);
  }

  // Ensure role.level is defined — callers expect a numeric roleLevel.
  if (role.level == null) {
    throw new Error(`Invalid role level ${membership.roleLevel ?? "undefined"}`);
  }

  const permissions = Array.from(
    new Set([...role.permissions, ...membership.additionalPermissions]),
  );

  const roleLevel = membership.roleLevel ?? role.level;

  return {
    userId: identity.subject,
    userDocId: convexUser._id,
    workspaceId: workspaceIdDoc,
    roleLevel,
    permissions,
  };
}

export async function requireMembership(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
): Promise<MembershipInfo> {
  const membership = await getMembership(ctx, workspaceId);
  if (!membership) {
    throw new Error("Workspace membership required");
  }
  return membership;
}

export async function requirePermission(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
  permission: string,
): Promise<MembershipInfo> {
  const membership = await requireMembership(ctx, workspaceId);

  // Platform admin has wildcard permission
  if (membership.permissions.includes("*")) {
    return membership;
  }

  if (!membership.permissions.includes(permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return membership;
}

export async function hasPermission(
  ctx: AnyConvexCtx,
  workspaceId: Id<"workspaces"> | string,
  permission: string,
): Promise<boolean> {
  const membership = await getMembership(ctx, workspaceId);
  if (!membership) return false;
  
  // Platform admin has all permissions
  if (membership.permissions.includes("*")) {
    return true;
  }
  
  return membership.permissions.includes(permission);
}
