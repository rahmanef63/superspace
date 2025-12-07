import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

// Record an activity event (internal use)
export const recordEvent = mutation({
	args: {
		workspaceId: v.string(),
		actorId: v.string(),
		entity: v.string(),
		entityId: v.string(),
		action: v.string(),
		changes: v.optional(v.any()),
	},
	returns: v.union(v.id("activityEvents"), v.null()),
	handler: async (ctx: any, args: any) => {
		// Require an admin identity to create events via this mutation
		await requireAdmin(ctx);

		const id = await logAuditEvent(ctx, {
			workspaceId: args.workspaceId,
			actor: args.actorId,
			resourceType: args.entity,
			resourceId: args.entityId,
			action: args.action,
			changes: args.changes,
		});

		return id;
	},
});

