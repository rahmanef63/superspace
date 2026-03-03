import { action } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

/**
 * Action to migrate users from Encore PostgreSQL to Convex
 */
export const migrateUsers = action({
  args: {
    // JSON array of user records from Encore
    users: v.array(
      v.object({
        id: v.string(),
        email: v.string(),
        name: v.string(),
        role: v.string(),
        workspaces: v.array(
          v.object({
            id: v.string(),
            role: v.string(),
            permissions: v.array(v.string()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      success: 0,
      failures: [] as { id: string; error: string }[],
    };

    // Role level mapping from Encore to Convex
    const roleToLevel = {
      owner: 0,
      admin: 10,
      manager: 30,
      staff: 50,
      client: 70,
      guest: 90,
    };

    for (const user of args.users) {
      try {
        // Create admin user
        const { userId } = await ctx.runMutation(
          internal.auth.api.mutations.createAdminUser,
          {
            name: user.name,
            email: user.email,
            roleLevel: roleToLevel[user.role as keyof typeof roleToLevel] ?? 90,
          },
        );

        // Add to workspaces
        for (const workspace of user.workspaces) {
          await ctx.runMutation(internal.auth.api.mutations.addToWorkspace, {
            userId,
            workspaceId: workspace.id,
            roleLevel:
              roleToLevel[workspace.role as keyof typeof roleToLevel] ?? 90,
            additionalPermissions: workspace.permissions,
          });
        }

        results.success++;
      } catch (error) {
        results.failures.push({
          id: user.id,
          error:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
