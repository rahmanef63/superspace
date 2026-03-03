import { action } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";

// Export current settings document
export const exportSettings = action({
	args: {},
	returns: v.any(),
	handler: async (ctx: any) => {
		await requireAdmin(ctx);
		const [settings] = await ctx.db.query("settings").take(1);
		return settings ?? null;
	},
});

// Import settings (overwrite current)
export const importSettings = action({
	args: {
		settings: v.any(),
	},
	returns: v.null(),
	handler: async (ctx: any, args: any) => {
		const actor = await requireAdmin(ctx);
		const [existing] = await ctx.db.query("settings").take(1);

		if (existing) {
			await ctx.db.patch(existing._id, args.settings);
		} else {
			await ctx.db.insert("settings", args.settings);
		}

		// record audit via settings mutation already exists; here we just return
		return null;
	},
});

