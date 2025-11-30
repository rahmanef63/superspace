import type { Doc } from "../../_generated/dataModel";
import {
  getMembership,
  hasPermission as membershipHasPermission,
  requirePermission as requireWorkspacePermission,
  type MembershipInfo,
  type AnyConvexCtx,
} from "../../shared/auth";
import {
  isPlatformAdmin,
  createPlatformAdminContext,
  type PlatformAdminContext,
} from "../../lib/platformAdmin";

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

  const email = (identity.email ?? identity.emailVerified ?? "") as string;
  const name = (identity.name ?? identity.nickname ?? "Platform Admin") as string;

  // ========================================
  // PLATFORM ADMIN CHECK (HIGHEST PRIORITY)
  // ========================================
  if (isPlatformAdmin(email)) {
    console.log(`[rbac] Platform admin access granted for: ${email}`);
    
    // Return a virtual admin user with full permissions
    return {
      _id: "platform_admin" as any,
      _creationTime: Date.now(),
      clerkId: identity.subject,
      email,
      name,
      roleLevel: 0, // Highest level
      permissions: ["*"], // All permissions (wildcard)
      status: "active",
      workspaceIds: [], // Has access to ALL workspaces
      isPlatformAdmin: true,
      createdBy: null,
      updatedBy: null,
    } as AdminUserDoc;
  }

  // ========================================
  // NORMAL ADMIN USER LOOKUP
  // ========================================
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
  // Platform admin wildcard matches everything
  if (user.permissions.includes("*")) {
    return true;
  }
  return permissions.some((perm) => user.permissions.includes(perm));
}

function isSystemAdmin(user: AdminUserDoc): boolean {
  // Platform admin with wildcard permission is always system admin
  if (user.permissions.includes("*")) {
    return true;
  }
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
  // Check platform admin first
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const email = (identity.email ?? identity.emailVerified ?? "") as string;
    if (isPlatformAdmin(email)) {
      return true; // Platform admin has all permissions
    }
  }
  
  return membershipHasPermission(ctx, workspaceId, permission);
}

// ============================================================================
// PLATFORM ADMIN SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Require platform admin access (throws if not platform admin)
 */
export async function requirePlatformAdmin(ctx: AnyConvexCtx): Promise<ActorContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  const email = (identity.email ?? identity.emailVerified ?? "") as string;
  
  if (!isPlatformAdmin(email)) {
    throw new Error("Platform administrator access required");
  }
  
  return {
    adminUserId: "platform_admin" as any,
    clerkUserId: identity.subject,
    email,
    name: (identity.name ?? "Platform Admin") as string,
    roleLevel: 0,
    permissions: ["*"],
  };
}

/**
 * Check if current user is platform admin (non-throwing)
 */
export async function checkPlatformAdmin(ctx: AnyConvexCtx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  
  const email = (identity.email ?? identity.emailVerified ?? "") as string;
  return isPlatformAdmin(email);
}

/**
 * Get actor context with platform admin check
 * Returns platform admin context if user is platform admin,
 * otherwise returns normal actor context
 */
export async function getActorWithPlatformCheck(ctx: AnyConvexCtx): Promise<ActorContext> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  
  const email = (identity.email ?? identity.emailVerified ?? "") as string;
  
  // Platform admin gets special context
  if (isPlatformAdmin(email)) {
    return {
      adminUserId: "platform_admin" as any,
      clerkUserId: identity.subject,
      email,
      name: (identity.name ?? "Platform Admin") as string,
      roleLevel: 0,
      permissions: ["*"],
    };
  }
  
  // Otherwise use normal admin user lookup
  const adminUser = await getActiveAdminUser(ctx);
  return toActor(adminUser);
}
