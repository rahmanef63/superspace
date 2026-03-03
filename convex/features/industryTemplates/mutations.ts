import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Industry Templates Mutations
 * Write operations for template management and installation
 */

// Industry category validator
const industryCategory = v.union(
  v.literal("restaurant"),
  v.literal("retail"),
  v.literal("healthcare"),
  v.literal("education"),
  v.literal("professional_services"),
  v.literal("manufacturing"),
  v.literal("hospitality"),
  v.literal("real_estate"),
  v.literal("fitness"),
  v.literal("salon_spa"),
  v.literal("automotive"),
  v.literal("construction"),
  v.literal("nonprofit"),
  v.literal("technology"),
  v.literal("creative_agency"),
  v.literal("logistics"),
  v.literal("custom")
);

// Feature module validator
const featureModule = v.union(
  v.literal("pos"),
  v.literal("inventory"),
  v.literal("crm"),
  v.literal("marketing"),
  v.literal("hr"),
  v.literal("accounting"),
  v.literal("projects"),
  v.literal("support"),
  v.literal("bi"),
  v.literal("forms"),
  v.literal("workflows"),
  v.literal("docs"),
  v.literal("chat"),
  v.literal("calendar"),
  v.literal("bookings"),
  v.literal("cms"),
  v.literal("analytics"),
  v.literal("integrations")
);

// Create a new template (admin or custom user template)
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: industryCategory,
    subcategory: v.optional(v.string()),
    features: v.array(featureModule),
    featureConfigs: v.optional(v.any()),
    defaultRoles: v.array(v.object({
      name: v.string(),
      description: v.string(),
      permissions: v.array(v.string()),
      isDefault: v.optional(v.boolean()),
    })),
    sampleData: v.optional(v.object({
      products: v.optional(v.number()),
      customers: v.optional(v.number()),
      documents: v.optional(v.number()),
      workflows: v.optional(v.number()),
    })),
    dashboardWidgets: v.optional(v.array(v.any())),
    recommendedIntegrations: v.optional(v.array(v.string())),
    branding: v.optional(v.object({
      primaryColor: v.optional(v.string()),
      logo: v.optional(v.string()),
      favicon: v.optional(v.string()),
    })),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("organization")),
    userId: v.id("users"),
    tags: v.array(v.string()),
    isPremium: v.optional(v.boolean()),
    price: v.optional(v.number()),
    previewImages: v.optional(v.array(v.string())),
    demoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("industryTemplates", {
      name: args.name,
      description: args.description,
      category: args.category,
      subcategory: args.subcategory,
      features: args.features,
      featureConfigs: args.featureConfigs,
      defaultRoles: args.defaultRoles,
      sampleData: args.sampleData,
      dashboardWidgets: args.dashboardWidgets,
      recommendedIntegrations: args.recommendedIntegrations,
      branding: args.branding,
      visibility: args.visibility,
      createdBy: args.userId,
      version: "1.0.0",
      isOfficial: false, // Only system can create official templates
      usageCount: 0,
      tags: args.tags,
      isPremium: args.isPremium ?? false,
      price: args.price,
      previewImages: args.previewImages,
      demoUrl: args.demoUrl,
    });

    return templateId;
  },
});

// Update an existing template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(industryCategory),
      subcategory: v.optional(v.string()),
      features: v.optional(v.array(featureModule)),
      featureConfigs: v.optional(v.any()),
      defaultRoles: v.optional(v.array(v.object({
        name: v.string(),
        description: v.string(),
        permissions: v.array(v.string()),
        isDefault: v.optional(v.boolean()),
      }))),
      sampleData: v.optional(v.any()),
      dashboardWidgets: v.optional(v.array(v.any())),
      recommendedIntegrations: v.optional(v.array(v.string())),
      branding: v.optional(v.any()),
      visibility: v.optional(v.union(v.literal("public"), v.literal("private"), v.literal("organization"))),
      tags: v.optional(v.array(v.string())),
      isPremium: v.optional(v.boolean()),
      price: v.optional(v.number()),
      previewImages: v.optional(v.array(v.string())),
      demoUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only creator or admin can update
    if (template.createdBy !== args.userId && !template.isOfficial) {
      throw new Error("Unauthorized to update this template");
    }

    // Increment version
    const versionParts = template.version.split(".");
    const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`;

    await ctx.db.patch(args.templateId, {
      ...args.updates,
      version: newVersion,
    });

    return args.templateId;
  },
});

// Delete a template
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only creator can delete (not official templates)
    if (template.createdBy !== args.userId) {
      throw new Error("Unauthorized to delete this template");
    }

    if (template.isOfficial) {
      throw new Error("Cannot delete official templates");
    }

    // Delete related records
    const reviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    const guides = await ctx.db
      .query("industryGuides")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    for (const guide of guides) {
      await ctx.db.delete(guide._id);
    }

    const customizations = await ctx.db
      .query("templateCustomizations")
      .withIndex("by_original_template", (q) => q.eq("originalTemplateId", args.templateId))
      .collect();

    for (const customization of customizations) {
      await ctx.db.delete(customization._id);
    }

    await ctx.db.delete(args.templateId);
    return true;
  },
});

// Install a template to a workspace
export const installTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    workspaceId: v.id("workspaces"),
    options: v.object({
      includeSampleData: v.boolean(),
      selectedFeatures: v.array(featureModule),
      customizations: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Create installation record
    const installationId = await ctx.db.insert("templateInstallations", {
      templateId: args.templateId,
      workspaceId: args.workspaceId,
      installedBy: userId,
      installedAt: Date.now(),
      options: args.options,
      status: "installing",
      progress: {
        currentStep: "Initializing",
        totalSteps: args.options.selectedFeatures.length + 3, // features + roles + widgets + sample data
        completedSteps: 0,
      },
    });

    // Increment usage count
    await ctx.db.patch(args.templateId, {
      usageCount: template.usageCount + 1,
    });

    // The actual installation would be done in steps/background
    // For now, mark as completed
    await ctx.db.patch(installationId, {
      status: "completed",
      completedAt: Date.now(),
      progress: {
        currentStep: "Complete",
        totalSteps: args.options.selectedFeatures.length + 3,
        completedSteps: args.options.selectedFeatures.length + 3,
      },
    });

    return installationId;
  },
});

// Update installation progress
export const updateInstallationProgress = mutation({
  args: {
    installationId: v.id("templateInstallations"),
    currentStep: v.string(),
    completedSteps: v.number(),
  },
  handler: async (ctx, args) => {
    const installation = await ctx.db.get(args.installationId);
    if (!installation || !installation.progress) {
      throw new Error("Installation not found");
    }

    await ctx.db.patch(args.installationId, {
      progress: {
        ...installation.progress,
        currentStep: args.currentStep,
        completedSteps: args.completedSteps,
      },
    });

    return true;
  },
});

// Complete installation
export const completeInstallation = mutation({
  args: {
    installationId: v.id("templateInstallations"),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.installationId, {
      status: args.success ? "completed" : "failed",
      completedAt: Date.now(),
      error: args.error,
    });

    return true;
  },
});

// Rollback installation
export const rollbackInstallation = mutation({
  args: {
    installationId: v.id("templateInstallations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const installation = await ctx.db.get(args.installationId);
    if (!installation) {
      throw new Error("Installation not found");
    }

    // Only the installer can rollback
    if (installation.installedBy !== args.userId) {
      throw new Error("Unauthorized to rollback this installation");
    }

    // Mark as rolled back
    await ctx.db.patch(args.installationId, {
      status: "rolled_back",
    });

    return true;
  },
});

// Create a review for a template
export const createReview = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    rating: v.number(),
    title: v.optional(v.string()),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this template
    const existingReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const existingReview = existingReviews.find((r) => r.templateId === args.templateId);
    if (existingReview) {
      throw new Error("You have already reviewed this template");
    }

    const reviewId = await ctx.db.insert("templateReviews", {
      templateId: args.templateId,
      userId: args.userId,
      workspaceId: args.workspaceId,
      rating: args.rating,
      title: args.title,
      review: args.review,
      helpfulCount: 0,
      createdAt: Date.now(),
    });

    // Update template's average rating
    const allReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
      .collect();

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(args.templateId, {
      rating: Math.round(averageRating * 10) / 10,
    });

    return reviewId;
  },
});

// Update a review
export const updateReview = mutation({
  args: {
    reviewId: v.id("templateReviews"),
    userId: v.id("users"),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingReview = await ctx.db.get(args.reviewId);
    if (!existingReview) {
      throw new Error("Review not found");
    }

    if (existingReview.userId !== args.userId) {
      throw new Error("Unauthorized to update this review");
    }

    if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    await ctx.db.patch(args.reviewId, {
      ...(args.rating !== undefined && { rating: args.rating }),
      ...(args.title !== undefined && { title: args.title }),
      ...(args.review !== undefined && { review: args.review }),
      updatedAt: Date.now(),
    });

    // Update template's average rating if rating changed
    if (args.rating !== undefined) {
      const allReviews = await ctx.db
        .query("templateReviews")
        .withIndex("by_template", (q) => q.eq("templateId", existingReview.templateId))
        .collect();

      const averageRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await ctx.db.patch(existingReview.templateId, {
        rating: Math.round(averageRating * 10) / 10,
      });
    }

    return args.reviewId;
  },
});

// Delete a review
export const deleteReview = mutation({
  args: {
    reviewId: v.id("templateReviews"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== args.userId) {
      throw new Error("Unauthorized to delete this review");
    }

    const templateId = review.templateId;
    await ctx.db.delete(args.reviewId);

    // Update template's average rating
    const allReviews = await ctx.db
      .query("templateReviews")
      .withIndex("by_template", (q) => q.eq("templateId", templateId))
      .collect();

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : undefined;

    await ctx.db.patch(templateId, {
      rating: averageRating ? Math.round(averageRating * 10) / 10 : undefined,
    });

    return true;
  },
});

// Mark a review as helpful
export const markReviewHelpful = mutation({
  args: {
    reviewId: v.id("templateReviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.patch(args.reviewId, {
      helpfulCount: review.helpfulCount + 1,
    });

    return true;
  },
});

// Save a template customization
export const saveCustomization = mutation({
  args: {
    originalTemplateId: v.id("industryTemplates"),
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    featureOverrides: v.optional(v.any()),
    roleOverrides: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      permissions: v.array(v.string()),
      isDefault: v.optional(v.boolean()),
    }))),
    widgetOverrides: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const customizationId = await ctx.db.insert("templateCustomizations", {
      originalTemplateId: args.originalTemplateId,
      userId: args.userId,
      name: args.name,
      description: args.description,
      featureOverrides: args.featureOverrides,
      roleOverrides: args.roleOverrides,
      widgetOverrides: args.widgetOverrides,
      createdAt: Date.now(),
    });

    return customizationId;
  },
});

// Update a customization
export const updateCustomization = mutation({
  args: {
    customizationId: v.id("templateCustomizations"),
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      featureOverrides: v.optional(v.any()),
      roleOverrides: v.optional(v.array(v.object({
        name: v.string(),
        description: v.string(),
        permissions: v.array(v.string()),
        isDefault: v.optional(v.boolean()),
      }))),
      widgetOverrides: v.optional(v.array(v.any())),
    }),
  },
  handler: async (ctx, args) => {
    const customization = await ctx.db.get(args.customizationId);
    if (!customization) {
      throw new Error("Customization not found");
    }

    if (customization.userId !== args.userId) {
      throw new Error("Unauthorized to update this customization");
    }

    await ctx.db.patch(args.customizationId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return args.customizationId;
  },
});

// Delete a customization
export const deleteCustomization = mutation({
  args: {
    customizationId: v.id("templateCustomizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const customization = await ctx.db.get(args.customizationId);
    if (!customization) {
      throw new Error("Customization not found");
    }

    if (customization.userId !== args.userId) {
      throw new Error("Unauthorized to delete this customization");
    }

    await ctx.db.delete(args.customizationId);
    return true;
  },
});

// Create a guide for a template
export const createGuide = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    order: v.number(),
    type: v.union(
      v.literal("getting_started"),
      v.literal("feature_guide"),
      v.literal("best_practices"),
      v.literal("faq"),
      v.literal("video_tutorial")
    ),
    videoUrl: v.optional(v.string()),
    videoDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only template creator can add guides
    if (template.createdBy !== args.userId && !template.isOfficial) {
      throw new Error("Unauthorized to add guides to this template");
    }

    const guideId = await ctx.db.insert("industryGuides", {
      templateId: args.templateId,
      title: args.title,
      content: args.content,
      order: args.order,
      type: args.type,
      videoUrl: args.videoUrl,
      videoDuration: args.videoDuration,
      createdAt: Date.now(),
    });

    return guideId;
  },
});

// Update a guide
export const updateGuide = mutation({
  args: {
    guideId: v.id("industryGuides"),
    userId: v.id("users"),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      order: v.optional(v.number()),
      type: v.optional(v.union(
        v.literal("getting_started"),
        v.literal("feature_guide"),
        v.literal("best_practices"),
        v.literal("faq"),
        v.literal("video_tutorial")
      )),
      videoUrl: v.optional(v.string()),
      videoDuration: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide) {
      throw new Error("Guide not found");
    }

    const template = await ctx.db.get(guide.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only template creator can update guides
    if (template.createdBy !== args.userId && !template.isOfficial) {
      throw new Error("Unauthorized to update this guide");
    }

    await ctx.db.patch(args.guideId, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return args.guideId;
  },
});

// Delete a guide
export const deleteGuide = mutation({
  args: {
    guideId: v.id("industryGuides"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const guide = await ctx.db.get(args.guideId);
    if (!guide) {
      throw new Error("Guide not found");
    }

    const template = await ctx.db.get(guide.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Only template creator can delete guides
    if (template.createdBy !== args.userId && !template.isOfficial) {
      throw new Error("Unauthorized to delete this guide");
    }

    await ctx.db.delete(args.guideId);
    return true;
  },
});

// Clone a template to create a new one
export const cloneTemplate = mutation({
  args: {
    templateId: v.id("industryTemplates"),
    userId: v.id("users"),
    name: v.string(),
    visibility: v.union(v.literal("public"), v.literal("private"), v.literal("organization")),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.templateId);
    if (!original) {
      throw new Error("Template not found");
    }

    const newTemplateId = await ctx.db.insert("industryTemplates", {
      name: args.name,
      description: original.description,
      category: original.category,
      subcategory: original.subcategory,
      features: original.features,
      featureConfigs: original.featureConfigs,
      defaultRoles: original.defaultRoles,
      sampleData: original.sampleData,
      dashboardWidgets: original.dashboardWidgets,
      recommendedIntegrations: original.recommendedIntegrations,
      branding: undefined, // Don't copy branding
      visibility: args.visibility,
      createdBy: args.userId,
      version: "1.0.0",
      isOfficial: false,
      usageCount: 0,
      tags: [...original.tags, "cloned"],
      isPremium: false,
      previewImages: undefined,
      demoUrl: undefined,
    });

    return newTemplateId;
  },
});
