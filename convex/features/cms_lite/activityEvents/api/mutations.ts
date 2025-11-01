import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";

// Record an activity event (internal use)
export const recordEvent = mutation({
	args: {
		actorId: v.string(),
		entity: v.string(),
		entityId: v.string(),
		action: v.string(),
		changes: v.optional(v.any()),
	},
	returns: v.id("activityEvents"),
	handler: async (ctx: any, args: any) => {
		// Require an admin identity to create events via this mutation
		await requireAdmin(ctx);

		const id = await ctx.db.insert("activityEvents", {
			actorId: args.actorId,
			entity: args.entity,
			entityId: args.entityId,
			action: args.action,
			changes: args.changes ?? null,
		});

		return id;
	},
});

