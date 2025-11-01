import { mutation } from "../../_generated";
import { v } from "convex/values";
import { requireAdmin } from "../../../lib/rbac";
import { recordAuditEvent } from "../../../lib/audit";
import { settingsObject } from "./queries";
import type { MutationCtx } from "../../_generated";

const settingsArgs = {
  brandName: v.string(),
  defaultLocale: v.string(),
  heroImage: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  instagram: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  primaryColor: v.optional(v.string()),
  secondaryColor: v.optional(v.string()),
};

function buildOptionalFields(args: Record<string, string | null | undefined>) {
  const result: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export const upsertSettings = mutation({
  args: settingsArgs,
  returns: settingsObject,
  handler: async (
    ctx: MutationCtx,
    args: {
      brandName: string;
      defaultLocale: string;
      heroImage?: string | null;
      phone?: string | null;
      email?: string | null;
      instagram?: string | null;
      whatsapp?: string | null;
      logoUrl?: string | null;
      primaryColor?: string | null;
      secondaryColor?: string | null;
    },
  ) => {
    const actor = await requireAdmin(ctx);

    const [existing] = await ctx.db.query("settings").take(1);
    const baseFields = {
      brandName: args.brandName,
      defaultLocale: args.defaultLocale,
    };
    const optionalFields = buildOptionalFields({
      heroImage: args.heroImage,
      phone: args.phone,
      email: args.email,
      instagram: args.instagram,
      whatsapp: args.whatsapp,
      logoUrl: args.logoUrl,
      primaryColor: args.primaryColor,
      secondaryColor: args.secondaryColor,
    });

    const writePayload = {
      ...baseFields,
      ...optionalFields,
    };

    const settingsId = existing
      ? existing._id
      : await ctx.db.insert("settings", writePayload);

    if (existing) {
      await ctx.db.patch(existing._id, writePayload);
    }

    const updated = await ctx.db.get(settingsId);
    if (!updated) {
      throw new Error("Failed to load settings after update");
    }

    await recordAuditEvent(ctx, {
      actorId: actor.clerkUserId,
      entity: "settings",
      entityId: settingsId,
      action: existing ? "update" : "create",
      changes: { ...args },
    });

    return updated;
  },
});


