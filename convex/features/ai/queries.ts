import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated/dataModel";

/**
 * Get AI settings for a workspace
 */
export const getSettings = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiSettings")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .unique();
  },
});

/**
 * Search knowledge base using semantic search
 */
export const searchKnowledgeBase = query({
  args: {
    workspaceId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // TODO: Implement vector search using embeddings
    // For now, return basic text search results
    const docs = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("status", "active"))
      .collect();

    // Basic text search (replace with vector search)
    const results = docs
      .filter(doc => 
        doc.title.toLowerCase().includes(args.query.toLowerCase()) ||
        doc.content.toLowerCase().includes(args.query.toLowerCase())
      )
      .slice(0, args.limit || 3);

    return results;
  },
});

/**
 * Get a specific chat session
 */
export const getChatSession = query({
  args: {
    sessionId: v.id("aiChatSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Chat session not found");
    return session;
  },
});

/**
 * List user's chat sessions
 */
export const listChatSessions = query({
  args: {
    workspaceId: v.optional(v.string()),
    userId: v.string(),
    status: v.optional(v.string()),
    global: v.optional(v.boolean()), // true = global sessions, false/undefined = workspace sessions
  },
  handler: async (ctx, args) => {
    let sessions: Doc<"aiChatSessions">[];
    
    if (args.global) {
      // Global mode: get sessions where isGlobal is true
      sessions = await ctx.db
        .query("aiChatSessions")
        .withIndex("by_global", (q: any) =>
          q.eq("isGlobal", true).eq("userId", args.userId)
        )
        .order("desc")
        .collect();
    } else if (args.workspaceId) {
      // Workspace mode: get sessions for specific workspace
      sessions = await ctx.db
        .query("aiChatSessions")
        .withIndex("by_workspace_user", (q: any) =>
          q.eq("workspaceId", args.workspaceId).eq("userId", args.userId)
        )
        .order("desc")
        .collect();
    } else {
      // Fallback: get all user sessions
      sessions = await ctx.db
        .query("aiChatSessions")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }

    if (args.status) {
      sessions = sessions.filter((s) => s.status === args.status);
    }

    return sessions;
  },
});

/**
 * List global chat sessions for a user (private/personal sessions)
 */
export const listGlobalChatSessions = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sessions = await ctx.db
      .query("aiChatSessions")
      .withIndex("by_global", (q: any) =>
        q.eq("isGlobal", true).eq("userId", args.userId)
      )
      .order("desc")
      .collect();

    if (args.status) {
      sessions = sessions.filter((s) => s.status === args.status);
    }

    return sessions;
  },
});

/**
 * Get knowledge base document
 */
export const getKbDocument = query({
  args: {
    workspaceId: v.string(),
    sourceType: v.string(),
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_source", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("sourceType", args.sourceType)
         .eq("sourceId", args.sourceId)
      )
      .unique();
  },
});

/**
 * Get similar documents from knowledge base
 */
export const getSimilarDocuments = query({
  args: {
    workspaceId: v.string(),
    sourceType: v.string(),
    content: v.string(),
    excludeId: v.id("knowledgeBaseDocuments"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // TODO: Implement proper similarity search using embeddings
    // For now, return random docs of same type
    const docs = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_source", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .eq("sourceType", args.sourceType)
      )
      .collect();

    const activeDocs = docs.filter(
      (doc) => doc._id !== args.excludeId && doc.status === "active",
    );

    // Add random similarity scores (replace with actual similarity calculation)
    const results = activeDocs.map(doc => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        similarity: Math.random(),
      },
    }));

    return results
      .sort((a, b) => (b.metadata?.similarity || 0) - (a.metadata?.similarity || 0))
      .slice(0, args.limit);
  },
});

/**
 * Get AI usage statistics
 */
export const getUsageStats = query({
  args: {
    workspaceId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("aiUsageStats")
      .withIndex("by_workspace_date", (q: any) =>
        q.eq("workspaceId", args.workspaceId)
         .gte("date", args.startDate)
         .lte("date", args.endDate)
      );

    if (args.provider) {
      q = q.filter((q: any) => q.eq("provider", args.provider));
    }

    return await q.collect();
  },
});

/**
 * Get knowledge documents by source types for AI context
 * Returns documents from selected knowledge sources (wiki, posts, portfolio, etc.)
 */
export const getKnowledgeBySourceTypes = query({
  args: {
    workspaceId: v.string(),
    sourceTypes: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allDocs: Doc<"knowledgeBaseDocuments">[] = [];
    const limitPerType = Math.ceil((args.limit || 10) / args.sourceTypes.length);

    for (const sourceType of args.sourceTypes) {
      const docs = await ctx.db
        .query("knowledgeBaseDocuments")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => 
          q.and(
            q.eq(q.field("sourceType"), sourceType),
            q.eq(q.field("status"), "active")
          )
        )
        .take(limitPerType);
      
      allDocs.push(...docs);
    }

    return allDocs.slice(0, args.limit || 10);
  },
});

/**
 * Get document counts by source type for a workspace
 */
export const getKnowledgeDocumentCounts = query({
  args: {
    workspaceId: v.string(),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("knowledgeBaseDocuments")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const counts: Record<string, number> = {};
    for (const doc of docs) {
      counts[doc.sourceType] = (counts[doc.sourceType] || 0) + 1;
    }

    return counts;
  },
});

/**
 * Get available knowledge sources from actual workspace data
 * Fetches counts from real feature tables (posts, portfolio, services, products, etc.)
 */
export const getAvailableKnowledgeSources = query({
  args: {
    workspaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sources: {
      id: string;
      name: string;
      description: string;
      documentCount: number;
      isAvailable: boolean;
    }[] = [];

    // Wiki / Knowledge Base Documents
    try {
      const wikiDocs = args.workspaceId 
        ? await ctx.db
            .query("knowledgeBaseDocuments")
            .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect()
        : [];
      sources.push({
        id: "wiki",
        name: "Wiki / Knowledge Base",
        description: "Internal documentation and custom knowledge",
        documentCount: wikiDocs.length,
        isAvailable: true,
      });
    } catch {
      sources.push({
        id: "wiki",
        name: "Wiki / Knowledge Base",
        description: "Internal documentation and custom knowledge",
        documentCount: 0,
        isAvailable: true,
      });
    }

    // Posts
    try {
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_status", (q: any) => q.eq("status", "published"))
        .collect();
      sources.push({
        id: "posts",
        name: "Blog Posts",
        description: "Published articles and blog content",
        documentCount: posts.length,
        isAvailable: posts.length > 0,
      });
    } catch {
      sources.push({
        id: "posts",
        name: "Blog Posts",
        description: "Published articles and blog content",
        documentCount: 0,
        isAvailable: false,
      });
    }

    // Portfolio
    try {
      const portfolio = await ctx.db
        .query("portfolioItems")
        .withIndex("by_status", (q: any) => q.eq("status", "published"))
        .collect();
      sources.push({
        id: "portfolio",
        name: "Portfolio",
        description: "Portfolio items and case studies",
        documentCount: portfolio.length,
        isAvailable: portfolio.length > 0,
      });
    } catch {
      sources.push({
        id: "portfolio",
        name: "Portfolio",
        description: "Portfolio items and case studies",
        documentCount: 0,
        isAvailable: false,
      });
    }

    // Services
    try {
      const services = await ctx.db
        .query("services")
        .withIndex("by_active_order", (q: any) => q.eq("active", true))
        .collect();
      sources.push({
        id: "services",
        name: "Services",
        description: "Service offerings and descriptions",
        documentCount: services.length,
        isAvailable: services.length > 0,
      });
    } catch {
      sources.push({
        id: "services",
        name: "Services",
        description: "Service offerings and descriptions",
        documentCount: 0,
        isAvailable: false,
      });
    }

    // Products
    try {
      const products = await ctx.db
        .query("products")
        .withIndex("by_status", (q: any) => q.eq("status", "active"))
        .collect();
      sources.push({
        id: "products",
        name: "Products",
        description: "Product catalog and details",
        documentCount: products.length,
        isAvailable: products.length > 0,
      });
    } catch {
      sources.push({
        id: "products",
        name: "Products",
        description: "Product catalog and details",
        documentCount: 0,
        isAvailable: false,
      });
    }

    // CMS Pages
    try {
      const pages = await ctx.db
        .query("cms_lite_pages")
        .collect();
      const publishedPages = pages.filter((p: any) => p.status === "published");
      sources.push({
        id: "pages",
        name: "Website Pages",
        description: "Published website pages",
        documentCount: publishedPages.length,
        isAvailable: publishedPages.length > 0,
      });
    } catch {
      sources.push({
        id: "pages",
        name: "Website Pages",
        description: "Published website pages",
        documentCount: 0,
        isAvailable: false,
      });
    }

    return sources;
  },
});

/**
 * Get actual content from workspace features for AI context
 */
export const getFeatureContent = query({
  args: {
    sourceTypes: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const content: {
      sourceType: string;
      title: string;
      content: string;
      url?: string;
    }[] = [];
    
    const limitPerType = Math.ceil((args.limit || 20) / args.sourceTypes.length);

    for (const sourceType of args.sourceTypes) {
      try {
        switch (sourceType) {
          case "posts": {
            const posts = await ctx.db
              .query("posts")
              .withIndex("by_status", (q: any) => q.eq("status", "published"))
              .take(limitPerType);
            for (const post of posts) {
              content.push({
                sourceType: "posts",
                title: post.title,
                content: `${post.excerpt || ""}\n\n${post.body}`.trim(),
                url: `/blog/${post.slug}`,
              });
            }
            break;
          }
          case "portfolio": {
            const items = await ctx.db
              .query("portfolioItems")
              .withIndex("by_status", (q: any) => q.eq("status", "published"))
              .take(limitPerType);
            for (const item of items) {
              content.push({
                sourceType: "portfolio",
                title: item.title,
                content: item.description || "",
                url: `/portfolio/${item.slug}`,
              });
            }
            break;
          }
          case "services": {
            const services = await ctx.db
              .query("services")
              .withIndex("by_active_order", (q: any) => q.eq("active", true))
              .take(limitPerType);
            for (const service of services) {
              content.push({
                sourceType: "services",
                title: service.labelEn,
                content: `Service: ${service.labelEn} (${service.labelId})`,
              });
            }
            break;
          }
          case "products": {
            const products = await ctx.db
              .query("products")
              .withIndex("by_status", (q: any) => q.eq("status", "active"))
              .take(limitPerType);
            for (const product of products) {
              content.push({
                sourceType: "products",
                title: product.titleEn,
                content: `${product.descEn || ""}\nPrice: ${product.price} ${product.currency}`.trim(),
                url: `/products/${product.slug}`,
              });
            }
            break;
          }
          case "pages": {
            const pages = await ctx.db
              .query("cms_lite_pages")
              .take(limitPerType * 2);
            const publishedPages = pages.filter((p: any) => p.status === "published").slice(0, limitPerType);
            for (const page of publishedPages) {
              content.push({
                sourceType: "pages",
                title: (page as any).title || (page as any).slug || "Page",
                content: (page as any).content || (page as any).body || "",
                url: `/${(page as any).slug}`,
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${sourceType}:`, error);
      }
    }

    return content;
  },
});
