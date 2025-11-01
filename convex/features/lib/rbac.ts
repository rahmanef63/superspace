import type { Doc } from "../../_generated/dataModel";
import {
  getMembership,
  hasPermission as membershipHasPermission,
  requirePermission as requireWorkspacePermission,
  type MembershipInfo,
  type AnyConvexCtx,
} from "../../shared/auth";

type AdminUserDoc = Doc<"adminUsers">;

export type ActorContext = {
  adminUserId: AdminUserDoc["_id"];
  clerkUserId: string;
  email: string;
  name: string;
  roleLevel: number;
  permissions: string[];
};

const ACTIVE_STATUS = "active";

const SYSTEM_ADMIN_PERMISSION = "system.admin";
const EDITOR_PERMISSIONS = [
  "content.create",
  "content.edit",
  "content.publish",
  "content.manage",
];

async function getActiveAdminUser(ctx: AnyConvexCtx): Promise<AdminUserDoc> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  let adminUser = await ctx.db
    .query("adminUsers")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  // Auto-create admin user if user is a workspace owner
  if (!adminUser) {
    console.log(`[rbac] Admin user not found for ${identity.subject}, checking workspace ownership...`);
    
    // Get the user from users table
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) {
      throw new Error("User record not found. Please ensure you are logged in.");
    }
    
    // Check if user is owner of any workspace (role level 0)
    const ownerMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("roleLevel"), 0))
      .first();
    
    if (!ownerMembership) {
      throw new Error("CMS access requires workspace owner role. Please contact your administrator.");
    }
    
    // User is a workspace owner - return a temporary admin user object
    // The actual admin user record will be created by initializeSelfAsAdmin action
    const email = (identity.email ?? identity.emailVerified ?? user.email ?? "no-email@example.com") as string;
    const name = (identity.name ?? identity.nickname ?? user.name ?? "User") as string;
    
    console.log(`[rbac] User ${email} is a workspace owner, allowing access (admin record will be auto-created)`);
    
    // Return a temporary admin user object that matches workspace owner permissions
    return {
      _id: user._id as any, // Use user ID temporarily
      _creationTime: Date.now(),
      clerkId: identity.subject,
      email,
      name,
      roleLevel: 0, // Owner level
      permissions: ["*"], // All permissions
      status: "active",
      workspaceIds: [ownerMembership.workspaceId],
      createdBy: identity.subject,
      updatedBy: identity.subject,
    } as AdminUserDoc;
  }

  if (adminUser.status !== ACTIVE_STATUS) {
    throw new Error("Account is not active");
  }

  return adminUser;
}

function toActor(user: AdminUserDoc): ActorContext {
  return {
    adminUserId: user._id,
    clerkUserId: user.clerkId,
    email: user.email,
    name: user.name,
    roleLevel: user.roleLevel,
    permissions: user.permissions,
  };
}

function hasAnyPermission(user: AdminUserDoc, permissions: string[]): boolean {
  return permissions.some((perm) => user.permissions.includes(perm));
}

function isSystemAdmin(user: AdminUserDoc): boolean {
  return (
    user.roleLevel <= 10 ||
    user.permissions.includes(SYSTEM_ADMIN_PERMISSION)
  );
}

async function ensureRoleLevel(
  ctx: AnyConvexCtx,
  allowedLevel: number,
  options: {
    fallbackPermissions?: string[];
    errorMessage: string;
  },
): Promise<ActorContext> {
  const adminUser = await getActiveAdminUser(ctx);
  const hasRoleAccess = adminUser.roleLevel <= allowedLevel;
  const hasFallback =
    options.fallbackPermissions &&
    hasAnyPermission(adminUser, options.fallbackPermissions);

  if (isSystemAdmin(adminUser) || hasRoleAccess || hasFallback) {
    return toActor(adminUser);
  }

  throw new Error(options.errorMessage);
}

export async function requireOwner(ctx: AnyConvexCtx): Promise<ActorContext> {
  return ensureRoleLevel(ctx, 0, {
    errorMessage: "Owner access required",
  });
}

export async function requireAdmin(ctx: AnyConvexCtx): Promise<ActorContext> {
  return ensureRoleLevel(ctx, 10, {
    errorMessage: "Admin access required",
  });
}

export async function requireEditor(ctx: AnyConvexCtx): Promise<ActorContext> {
  return ensureRoleLevel(ctx, 50, {
    fallbackPermissions: EDITOR_PERMISSIONS,
    errorMessage: "Editor access required",
  });
}

export async function ensureWorkspaceMembership(
  ctx: AnyConvexCtx,
  workspaceId: string,
): Promise<MembershipInfo> {
  const membership = await getMembership(ctx, workspaceId);
  if (!membership) {
    throw new Error("Not a member of this workspace");
  }
  return membership;
}

export async function requirePermission(
  ctx: AnyConvexCtx,
  workspaceId: string,
  permission: string,
): Promise<{ membership: MembershipInfo }> {
  const membership = await requireWorkspacePermission(
    ctx,
    workspaceId,
    permission,
  );
  return { membership };
}

export async function hasPermission(
  ctx: AnyConvexCtx,
  workspaceId: string,
  permission: string,
): Promise<boolean> {
  return membershipHasPermission(ctx, workspaceId, permission);
}
