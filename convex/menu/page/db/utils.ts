import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";

/**
 * Narrow context to the operations we support (queries + mutations).
 */
type Ctx = QueryCtx | MutationCtx;

/**
 * Check whether the given user belongs to the workspace via membership records.
 */
export async function hasWorkspaceAccess(
  ctx: Ctx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users"> | null | undefined
): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const membership = await ctx.db
    .query("workspaceMemberships")
    .withIndex("by_user_workspace", (q) =>
      q.eq("userId", userId).eq("workspaceId", workspaceId)
    )
    .unique();

  return Boolean(membership);
}

/**
 * Ensure a user has access to a workspace, throwing if not.
 */
export async function assertWorkspaceAccess(
  ctx: Ctx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users"> | null | undefined
): Promise<void> {
  const allowed = await hasWorkspaceAccess(ctx, workspaceId, userId);
  if (!allowed) {
    throw new Error("Unauthorized");
  }
}

/**
 * Calculate the next order/position value when appending to an ordered collection.
 */
export function nextOrderValue<T extends { position?: number }>(items: T[]): number {
  if (items.length === 0) {
    return 0;
  }

  const positions = items.map((item) => item.position ?? 0);
  return Math.max(...positions) + 1;
}
