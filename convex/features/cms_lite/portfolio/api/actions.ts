import { action } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";

export const exportPortfolio = action({
	args: {
		locale: v.optional(v.string()),
		status: v.optional(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx: any, args: any) => {
		await requireAdmin(ctx);
		let items: any[] = await ctx.db.query("portfolioItems").collect();
		if (args.locale) items = items.filter((i: any) => i.locale === args.locale);
		if (args.status) items = items.filter((i: any) => i.status === args.status);

		// Attach images
		const results: any[] = [];
		for (const item of items) {
			const images = await ctx.db
				.query("portfolioImages")
				.withIndex("by_portfolio_order", (q: any) => q.eq("portfolioId", item._id))
				.order("asc")
				.collect();

			results.push({
				item: {
					id: item._id,
					slug: item.slug,
					locale: item.locale,
					title: item.title,
					description: item.description ?? null,
					tags: item.tags,
					status: item.status,
				},
				images: images.map((img: any) => ({
					id: img._id,
					imageUrl: img.imageUrl,
					altText: img.altText ?? null,
					displayOrder: img.displayOrder,
				})),
			});
		}

		return results;
	},
});

export const importPortfolio = action({
	args: {
		items: v.array(v.any()),
		overwrite: v.optional(v.boolean()),
	},
	returns: v.object({ imported: v.number(), updated: v.number() }),
	handler: async (ctx: any, args: any) => {
		const actor = await requireAdmin(ctx);
		let imported = 0;
		let updated = 0;

		for (const entry of args.items) {
			const payload = entry.item;
			const conflict = await ctx.db
				.query("portfolioItems")
				.withIndex("by_slug_locale", (q: any) => q.eq("slug", payload.slug).eq("locale", payload.locale))
				.unique();

			if (conflict) {
				if (args.overwrite) {
					await ctx.db.patch(conflict._id, {
						title: payload.title,
						description: payload.description ?? null,
						tags: payload.tags ?? [],
						status: payload.status,
						updatedBy: actor.clerkUserId,
					});
					// remove and re-insert images
					const existingImages = await ctx.db
						.query("portfolioImages")
						.withIndex("by_portfolio", (q: any) => q.eq("portfolioId", conflict._id))
						.collect();
					for (const img of existingImages) await ctx.db.delete(img._id);
					for (const img of entry.images || []) {
						await ctx.db.insert("portfolioImages", {
							portfolioId: conflict._id,
							imageUrl: img.imageUrl,
							altText: img.altText ?? null,
							displayOrder: img.displayOrder ?? 0,
						});
					}
					updated++;
				}
			} else {
				const id = await ctx.db.insert("portfolioItems", {
					slug: payload.slug,
					locale: payload.locale,
					title: payload.title,
					description: payload.description ?? null,
					tags: payload.tags ?? [],
					status: payload.status,
					createdBy: actor.clerkUserId,
					updatedBy: actor.clerkUserId,
				});

				for (const img of entry.images || []) {
					await ctx.db.insert("portfolioImages", {
						portfolioId: id,
						imageUrl: img.imageUrl,
						altText: img.altText ?? null,
						displayOrder: img.displayOrder ?? 0,
					});
				}
				imported++;
			}
		}

		await recordAuditEvent(ctx, {
			actorId: actor.clerkUserId,
			entity: "portfolio",
			entityId: "bulk-import",
			action: "import",
			changes: { imported, updated },
		});

		return { imported, updated };
	},
});

