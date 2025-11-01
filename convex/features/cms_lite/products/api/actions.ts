import { action } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";

export const exportProducts = action({
	args: {
		status: v.optional(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx: any, args: any) => {
		await requireAdmin(ctx);
		let products: any[] = await ctx.db.query("products").collect();
		if (args.status) products = products.filter((p: any) => p.status === args.status);
		return products.map((p: any) => ({
			id: p._id,
			slug: p.slug,
			titleId: p.titleId,
			titleEn: p.titleEn,
			titleAr: p.titleAr,
			descId: p.descId ?? null,
			descEn: p.descEn ?? null,
			descAr: p.descAr ?? null,
			price: p.price,
			currency: p.currency,
			paymentLink: p.paymentLink ?? null,
			coverImage: p.coverImage ?? null,
			status: p.status,
			metaTitle: p.metaTitle ?? null,
			metaDescription: p.metaDescription ?? null,
			metaKeywords: p.metaKeywords ?? null,
		}));
	},
});

export const importProducts = action({
	args: {
		products: v.array(v.any()),
		overwrite: v.optional(v.boolean()),
	},
	returns: v.object({ imported: v.number(), updated: v.number() }),
	handler: async (ctx: any, args: any) => {
		const actor = await requireAdmin(ctx);
		let imported = 0;
		let updated = 0;

		for (const p of args.products) {
			const conflict = await ctx.db
				.query("products")
				.withIndex("by_slug", (q: any) => q.eq("slug", p.slug))
				.unique();

			if (conflict) {
				if (args.overwrite) {
					await ctx.db.patch(conflict._id, {
						titleId: p.titleId,
						titleEn: p.titleEn,
						titleAr: p.titleAr,
						descId: p.descId ?? null,
						descEn: p.descEn ?? null,
						descAr: p.descAr ?? null,
						price: p.price,
						currency: p.currency,
						paymentLink: p.paymentLink ?? null,
						coverImage: p.coverImage ?? null,
						status: p.status,
						metaTitle: p.metaTitle ?? null,
						metaDescription: p.metaDescription ?? null,
						metaKeywords: p.metaKeywords ?? null,
						updatedBy: actor.clerkUserId,
					});
					updated++;
				}
			} else {
				await ctx.db.insert("products", {
					slug: p.slug,
					titleId: p.titleId,
					titleEn: p.titleEn,
					titleAr: p.titleAr,
					descId: p.descId ?? null,
					descEn: p.descEn ?? null,
					descAr: p.descAr ?? null,
					price: p.price,
					currency: p.currency,
					paymentLink: p.paymentLink ?? null,
					coverImage: p.coverImage ?? null,
					status: p.status,
					metaTitle: p.metaTitle ?? null,
					metaDescription: p.metaDescription ?? null,
					metaKeywords: p.metaKeywords ?? null,
					createdBy: actor.clerkUserId,
					updatedBy: actor.clerkUserId,
				});
				imported++;
			}
		}

		await recordAuditEvent(ctx, {
			actorId: actor.clerkUserId,
			entity: "product",
			entityId: "bulk-import",
			action: "import",
			changes: { imported, updated },
		});

		return { imported, updated };
	},
});

