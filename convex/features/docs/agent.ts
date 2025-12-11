import { api } from "../../_generated/api";
import { FeatureAgent } from "../ai/lib/types";
import { z } from "zod";

export const agent: FeatureAgent = {
    tools: {
        create: {
            description: "Create a new document. Title is required.",
            type: "mutation",
            handler: api.features.docs.documents.createDocument,
            args: z.object({
                title: z.string().describe("Title of the document"),
                content: z.string().optional().describe("Markdown content of the document"),
                isPublic: z.boolean().default(false),
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        search: {
            description: "Search for documents by title or content.",
            type: "query",
            handler: api.features.docs.documents.searchDocuments,
            args: z.object({
                query: z.string().describe("Search query text"),
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        list: {
            description: "List all documents in the workspace.",
            type: "query",
            handler: api.features.docs.documents.getWorkspaceDocuments,
            args: z.object({
                workspaceId: z.string().describe("ID of the workspace"),
            })
        },
        get: {
            description: "Get a specific document by ID.",
            type: "query",
            handler: api.features.docs.documents.getDocument,
            args: z.object({
                id: z.string().describe("ID of the document"),
            })
        },
        update: {
            description: "Update an existing document.",
            type: "mutation",
            handler: api.features.docs.documents.updateDocument,
            args: z.object({
                id: z.string().describe("ID of the document"),
                title: z.string().optional(),
                content: z.string().optional(),
                isPublic: z.boolean().optional(),
            })
        },
        delete: {
            description: "Delete a document.",
            type: "mutation",
            handler: api.features.docs.documents.deleteDocument,
            args: z.object({
                id: z.string().describe("ID of the document"),
            })
        }
    }
};
