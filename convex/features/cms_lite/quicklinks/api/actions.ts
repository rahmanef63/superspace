import { action } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";

export const exportQuicklinks = action({
	args: {},
	returns: v.array(v.any()),
	handler: async (ctx: any) => {
		await requireAdmin(ctx);
		const items = await ctx.db.query("quicklinks").order("asc").collect();
		return items.map((i: any) => ({
			id: i._id,
			title: i.title,
			url: i.url,
			icon: i.icon ?? null,
			displayOrder: i.displayOrder,
			active: i.active,
		}));
	},
});

export const importQuicklinks = action({
	args: {
		items: v.array(v.any()),
		overwrite: v.optional(v.boolean()),
	},
	returns: v.object({ imported: v.number(), updated: v.number() }),
	handler: async (ctx: any, args: any) => {
		const actor = await requireAdmin(ctx);
		let imported = 0;
		let updated = 0;

		for (const it of args.items) {
			const conflict = await ctx.db
				.query("quicklinks")
				.withIndex("by_title", (q: any) => q.eq("title", it.title))
				.unique();

			if (conflict) {
				if (args.overwrite) {
					await ctx.db.patch(conflict._id, {
						url: it.url,
						icon: it.icon ?? null,
						displayOrder: it.displayOrder,
						active: it.active,
						updatedBy: actor.clerkUserId,
					});
					updated++;
				}
			} else {
				await ctx.db.insert("quicklinks", {
					title: it.title,
					url: it.url,
					icon: it.icon ?? null,
					displayOrder: it.displayOrder,
					active: it.active,
					createdBy: actor.clerkUserId,
					updatedBy: actor.clerkUserId,
				});
				imported++;
			}
		}

		await recordAuditEvent(ctx, {
			actorId: actor.clerkUserId,
			entity: "quicklinks",
			entityId: "bulk-import",
			action: "import",
			changes: { imported, updated },
		});

		return { imported, updated };
	},
});

