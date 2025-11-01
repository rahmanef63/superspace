import { action } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";

// Export posts (admin only)
export const exportPosts = action({
	args: {
		status: v.optional(v.string()),
		locale: v.optional(v.string()),
	},
	returns: v.array(v.any()),
	handler: async (ctx: any, args: any) => {
		await requireAdmin(ctx);

		let posts: any[] = await ctx.db.query("posts").collect();

		if (args.status) {
			posts = posts.filter((p: any) => p.status === args.status);
		}
		if (args.locale) {
			posts = posts.filter((p: any) => p.locale === args.locale);
		}

		// Serialize minimal fields
		return posts.map((p: any) => ({
			id: p._id,
			slug: p.slug,
			locale: p.locale,
			title: p.title,
			excerpt: p.excerpt ?? null,
			body: p.body,
			coverImage: p.coverImage ?? null,
			status: p.status,
			publishedAt: p.publishedAt ?? null,
			metaTitle: p.metaTitle ?? null,
			metaDescription: p.metaDescription ?? null,
			metaKeywords: p.metaKeywords ?? null,
			scheduledPublishAt: p.scheduledPublishAt ?? null,
		}));
	},
});

// Import posts (admin only). If overwrite=true, update existing posts with same slug+locale.
export const importPosts = action({
	args: {
		posts: v.array(v.any()),
		overwrite: v.optional(v.boolean()),
	},
	returns: v.object({ imported: v.number(), updated: v.number() }),
	handler: async (ctx: any, args: any) => {
		const actor = await requireAdmin(ctx);

		let imported = 0;
		let updated = 0;

		for (const p of args.posts) {
			const conflict = await ctx.db
				.query("posts")
				.withIndex("by_slug_locale", (q: any) => q.eq("slug", p.slug).eq("locale", p.locale))
				.unique();

			if (conflict) {
				if (args.overwrite) {
					await ctx.db.patch(conflict._id, {
						title: p.title,
						excerpt: p.excerpt ?? null,
						body: p.body,
						coverImage: p.coverImage ?? null,
						status: p.status,
						publishedAt: p.publishedAt ?? null,
						metaTitle: p.metaTitle ?? null,
						metaDescription: p.metaDescription ?? null,
						metaKeywords: p.metaKeywords ?? null,
						scheduledPublishAt: p.scheduledPublishAt ?? null,
						updatedBy: actor.clerkUserId,
					});

					await ctx.db.insert("postRevisions", {
						postId: conflict._id,
						slug: p.slug,
						locale: p.locale,
						title: p.title,
						excerpt: p.excerpt ?? null,
						body: p.body,
						coverImage: p.coverImage ?? null,
						status: p.status,
						publishedAt: p.publishedAt ?? null,
						metaTitle: p.metaTitle ?? null,
						metaDescription: p.metaDescription ?? null,
						metaKeywords: p.metaKeywords ?? null,
						createdBy: actor.clerkUserId,
						revisionNote: "Imported update",
					});

					updated++;
				}
			} else {
				const id = await ctx.db.insert("posts", {
					slug: p.slug,
					locale: p.locale,
					title: p.title,
					excerpt: p.excerpt ?? null,
					body: p.body,
					coverImage: p.coverImage ?? null,
					status: p.status,
					publishedAt: p.publishedAt ?? null,
					metaTitle: p.metaTitle ?? null,
					metaDescription: p.metaDescription ?? null,
					metaKeywords: p.metaKeywords ?? null,
					scheduledPublishAt: p.scheduledPublishAt ?? null,
					createdBy: actor.clerkUserId,
					updatedBy: actor.clerkUserId,
				});

				await ctx.db.insert("postRevisions", {
					postId: id,
					slug: p.slug,
					locale: p.locale,
					title: p.title,
					excerpt: p.excerpt ?? null,
					body: p.body,
					coverImage: p.coverImage ?? null,
					status: p.status,
					publishedAt: p.publishedAt ?? null,
					metaTitle: p.metaTitle ?? null,
					metaDescription: p.metaDescription ?? null,
					metaKeywords: p.metaKeywords ?? null,
					createdBy: actor.clerkUserId,
					revisionNote: "Imported",
				});

				imported++;
			}
		}

		await recordAuditEvent(ctx, {
			actorId: actor.clerkUserId,
			entity: "post",
			entityId: "bulk-import",
			action: "import",
			changes: { imported, updated },
		});

		return { imported, updated };
	},
});

