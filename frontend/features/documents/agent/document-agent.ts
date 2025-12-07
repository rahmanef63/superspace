/**
 * Document Agent
 * 
 * A sub-agent specialized in document management.
 * Provides CRUD tools for documents in a workspace.
 */

import type { SubAgent, SubAgentTool, SubAgentContext, ToolResult } from "@/frontend/features/ai/agents/types";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// Tool Handlers
// ============================================================================

const createDocumentHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const docId = await ctx.convex.mutation(api.features.docs.documents.create, {
            title: params.title,
            content: params.content || "",
            isPublic: params.isPublic ?? false,
            workspaceId: ctx.workspaceId,
        });

        return {
            success: true,
            data: { documentId: docId },
            message: `Created document "${params.title}" successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create document",
        };
    }
};

const searchDocumentsHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const results = await ctx.convex.query(api.features.docs.documents.searchDocuments, {
            workspaceId: ctx.workspaceId,
            query: params.query,
        });

        const limitedResults = params.limit ? results.slice(0, params.limit) : results;

        return {
            success: true,
            data: limitedResults.map((doc: any) => ({
                id: doc._id,
                title: doc.title,
                isPublic: doc.isPublic,
                lastModified: doc.lastModified,
                author: doc.author?.name,
            })),
            message: `Found ${limitedResults.length} document(s) matching "${params.query}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to search documents",
        };
    }
};

const listDocumentsHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.workspaceId) {
        return { success: false, error: "No workspace selected" };
    }
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const results = await ctx.convex.query(api.features.docs.documents.getWorkspaceDocuments, {
            workspaceId: ctx.workspaceId,
        });

        const limitedResults = params.limit ? results.slice(0, params.limit) : results.slice(0, 20);

        return {
            success: true,
            data: limitedResults.map((doc: any) => ({
                id: doc._id,
                title: doc.title,
                isPublic: doc.isPublic,
                lastModified: doc.lastModified,
                author: doc.author?.name,
            })),
            message: `Found ${limitedResults.length} document(s) in workspace`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to list documents",
        };
    }
};

const getDocumentHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        const doc = await ctx.convex.query(api.features.docs.documents.get, {
            id: params.documentId as Id<"documents">,
        });

        if (!doc) {
            return { success: false, error: "Document not found" };
        }

        return {
            success: true,
            data: {
                id: doc._id,
                title: doc.title,
                content: doc.content,
                isPublic: doc.isPublic,
                lastModified: doc.lastModified,
            },
            message: `Retrieved document "${doc.title}"`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get document",
        };
    }
};

const updateDocumentHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        await ctx.convex.mutation(api.features.docs.documents.update, {
            id: params.documentId as Id<"documents">,
            title: params.title,
            content: params.content,
            isPublic: params.isPublic,
        });

        return {
            success: true,
            data: { documentId: params.documentId },
            message: `Updated document successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update document",
        };
    }
};

const deleteDocumentHandler = async (
    params: any,
    ctx: SubAgentContext
): Promise<ToolResult> => {
    if (!ctx.convex) {
        return { success: false, error: "Database client not available" };
    }

    try {
        await ctx.convex.mutation(api.features.docs.documents.deleteDocument, {
            id: params.documentId as Id<"documents">,
        });

        return {
            success: true,
            data: { documentId: params.documentId },
            message: `Deleted document successfully`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete document",
        };
    }
};

// ============================================================================
// Tool Definitions
// ============================================================================

const documentTools: SubAgentTool[] = [
    {
        name: "createDocument",
        description: "Create a new document in the current workspace",
        parameters: {
            title: {
                type: "string",
                description: "Title of the document",
                required: true,
            },
            content: {
                type: "string",
                description: "The full body content of the document. Generate rich markdown content if the user requests a specific topic or format.",
                required: false,
            },
            isPublic: {
                type: "boolean",
                description: "Whether the document is publicly visible (default: false)",
                required: false,
            },
        },
        handler: createDocumentHandler,
    },
    {
        name: "searchDocuments",
        description: "Search for documents by title in the current workspace",
        parameters: {
            query: {
                type: "string",
                description: "Search query to match against document titles",
                required: true,
            },
            limit: {
                type: "number",
                description: "Maximum number of results to return (default: 10)",
                required: false,
            },
        },
        handler: searchDocumentsHandler,
    },
    {
        name: "listDocuments",
        description: "List all documents in the current workspace",
        parameters: {
            limit: {
                type: "number",
                description: "Maximum number of documents to return (default: 20)",
                required: false,
            },
        },
        handler: listDocumentsHandler,
    },
    {
        name: "getDocument",
        description: "Get a specific document by ID, including its content",
        parameters: {
            documentId: {
                type: "string",
                description: "The ID of the document to retrieve",
                required: true,
            },
        },
        handler: getDocumentHandler,
    },
    {
        name: "updateDocument",
        description: "Update an existing document's title, content, or visibility",
        parameters: {
            documentId: {
                type: "string",
                description: "The ID of the document to update",
                required: true,
            },
            title: {
                type: "string",
                description: "New title for the document",
                required: false,
            },
            content: {
                type: "string",
                description: "New content for the document",
                required: false,
            },
            isPublic: {
                type: "boolean",
                description: "Whether the document should be publicly visible",
                required: false,
            },
        },
        handler: updateDocumentHandler,
    },
    {
        name: "deleteDocument",
        description: "Delete a document permanently",
        parameters: {
            documentId: {
                type: "string",
                description: "The ID of the document to delete",
                required: true,
            },
        },
        handler: deleteDocumentHandler,
    },
];

// ============================================================================
// Keywords for Query Routing
// ============================================================================

const DOCUMENT_KEYWORDS = [
    "document",
    "doc",
    "docs",
    "file",
    "create document",
    "new document",
    "make document",
    "write",
    "save",
    "note",
    "notes",
    "list documents",
    "find document",
    "search document",
    "show documents",
    "get document",
    "open document",
    "read document",
    "edit document",
    "update document",
    "delete document",
    "remove document",
];

// Indonesian keywords
const DOCUMENT_KEYWORDS_ID = [
    "dokumen",
    "buat dokumen",
    "buat file",
    "tulis",
    "simpan",
    "catatan",
    "cari dokumen",
    "hapus dokumen",
    "edit dokumen",
    "daftar dokumen",
];

const ALL_KEYWORDS = [...DOCUMENT_KEYWORDS, ...DOCUMENT_KEYWORDS_ID];

// ============================================================================
// Agent Definition
// ============================================================================

export const documentAgent: SubAgent = {
    id: "document-agent",
    name: "Document Agent",
    description: "manages documents - create, search, read, update, and delete documents in your workspace",
    featureId: "documents",
    icon: "FileText",
    tools: documentTools,

    canHandle: (query: string, _ctx: SubAgentContext): number => {
        const lowerQuery = query.toLowerCase();

        // Check for exact matches first (higher confidence)
        for (const keyword of ALL_KEYWORDS) {
            if (lowerQuery.includes(keyword)) {
                // Action keywords get higher confidence
                if (
                    keyword.includes("create") ||
                    keyword.includes("buat") ||
                    keyword.includes("delete") ||
                    keyword.includes("hapus") ||
                    keyword.includes("update") ||
                    keyword.includes("edit")
                ) {
                    return 0.9;
                }
                return 0.75;
            }
        }

        // Fuzzy match - check for partial matches
        const fuzzyKeywords = ["doc", "file", "note", "write"];
        for (const keyword of fuzzyKeywords) {
            if (lowerQuery.includes(keyword)) {
                return 0.5;
            }
        }

        return 0;
    },

    getContext: async (ctx: SubAgentContext): Promise<string> => {
        if (!ctx.workspaceId || !ctx.convex) {
            return "No workspace context available.";
        }

        try {
            const recentDocs = await ctx.convex.query(api.features.docs.documents.getWorkspaceDocuments, {
                workspaceId: ctx.workspaceId,
            });

            const limitedDocs = recentDocs.slice(0, 10);

            if (limitedDocs.length === 0) {
                return "No documents in this workspace yet.";
            }

            const docList = limitedDocs
                .map((doc: any) => `- "${doc.title}" (ID: ${doc._id}, ${doc.isPublic ? "public" : "private"})`)
                .join("\n");

            return `Recent documents in this workspace:\n${docList}`;
        } catch (error) {
            console.error("[DocumentAgent] Failed to get context:", error);
            return "Unable to load document context.";
        }
    },

    systemPrompt: `You are a document management assistant. You help users create, find, read, update, and delete documents.

CRITICAL INSTRUCTIONS FOR CREATING DOCUMENTS:
- **Title Generation**: If the user does not provide an explicit title, you MUST generate a short, descriptive title based on their request. Do NOT use their full prompt as the title.
- **Content Generation**: If the user asks for a specific type of content (e.g., "meal plan", "blog post", "meeting agenda", "bucket list"), you MUST generate rich, well-formatted Markdown content for them.
  - Use headers (#, ##), bullet points (-), broad categories, and bold text to verify the document looks professional.
  - Do NOT create empty documents unless explicitly asked.
  - Do NOT just copy the user's prompt into the content. EXPAND on their request creatively and helpfully.

When searching:
- Use keywords from the user's query
- Present results clearly with titles and IDs

When updating or deleting:
- Confirm the document ID if ambiguous
- Warn before destructive operations`,
};

export default documentAgent;
