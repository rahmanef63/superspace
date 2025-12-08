/**
 * Export/Import Configuration for Documents Feature
 */

import type { FeatureExportConfig } from "@/frontend/shared/foundation/utils/export/data-export-types"
import type { DocumentRecord, DocumentCategory } from "../shared/types"
import { getDocumentCategory, getCategoryTag } from "../shared/types"

// ============================================================================
// Export Properties Configuration
// ============================================================================

const exportProperties = [
  {
    key: "_id",
    label: "Document ID",
    type: "string" as const,
    required: false,
    description: "Unique identifier (auto-generated if empty)",
  },
  {
    key: "title",
    label: "Title",
    type: "string" as const,
    required: true,
    description: "Document title",
  },
  {
    key: "content",
    label: "Content",
    type: "string" as const,
    required: false,
    description: "Document content (supports HTML, Markdown, or plain text)",
  },
  {
    key: "isPublic",
    label: "Is Public",
    type: "boolean" as const,
    required: true,
    description: "Whether document is publicly accessible",
  },
  {
    key: "parentId",
    label: "Parent ID",
    type: "string" as const,
    required: false,
    description: "Parent document ID for hierarchical structure",
  },
  {
    key: "workspaceId",
    label: "Workspace ID",
    type: "string" as const,
    required: true,
    description: "Workspace identifier",
  },
  {
    key: "createdBy",
    label: "Created By",
    type: "string" as const,
    required: true,
    description: "User ID who created the document",
  },
  {
    key: "authorName",
    label: "Author Name",
    type: "string" as const,
    required: false,
    description: "Display name of author",
  },
  {
    key: "authorEmail",
    label: "Author Email",
    type: "string" as const,
    required: false,
    description: "Email of author",
  },
  {
    key: "_creationTime",
    label: "Created At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Creation timestamp",
  },
  {
    key: "lastModified",
    label: "Last Modified",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Last modification timestamp",
  },
  {
    key: "lastEditedBy",
    label: "Last Edited By",
    type: "string" as const,
    required: false,
    description: "User ID who last edited the document",
  },
  {
    key: "isPinned",
    label: "Is Pinned",
    type: "boolean" as const,
    required: false,
    description: "Whether document is pinned",
  },
  {
    key: "isStarred",
    label: "Is Starred",
    type: "boolean" as const,
    required: false,
    description: "Whether document is starred",
  },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    required: true,
    options: ["document", "article"],
    description: "Document category (document or article)",
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect" as const,
    required: false,
    options: ["important", "draft", "review", "approved", "archived", "template", "reference"],
    description: "Document tags for organization",
  },
  {
    key: "description",
    label: "Description",
    type: "string" as const,
    required: false,
    description: "Document description or summary",
  },
  {
    key: "version",
    label: "Version",
    type: "number" as const,
    required: false,
    description: "Document version number",
  },
]

// ============================================================================
// Export/Import Configuration
// ============================================================================

export const exportConfig: FeatureExportConfig = {
  featureId: "knowledge/docs",
  featureName: "Documents",

  exportProperties: async () => exportProperties,

  // Export data function
  exportData: async (request) => {
    // TODO: Replace with actual Convex query
    // const documents = await ctx.db.query("documents")
    //   .withIndex("by_workspace", q => q.eq("workspaceId", request.workspaceId))
    //   .collect()

    // Mock data for demonstration
    const mockDocuments: (DocumentRecord & {
      authorName?: string
      authorEmail?: string
      lastEditedBy?: string
    })[] = [
      {
        _id: "doc-1" as any,
        title: "Project Requirements",
        content: "# Project Requirements\n\nThis document outlines the requirements for the new project...",
        isPublic: false,
        parentId: null,
        workspaceId: "ws-1" as any,
        createdBy: "user-1" as any,
        authorName: "John Doe",
        authorEmail: "john@example.com",
        _creationTime: Date.now() - 86400000 * 7, // 7 days ago
        lastModified: Date.now() - 86400000 * 2, // 2 days ago
        lastEditedBy: "user-2" as any,
        isPinned: true,
        isStarred: false,
        tags: ["important", "review"],
        metadata: {
          description: "High-level project requirements and specifications",
          tags: ["important", "review"],
          lastEditedBy: "user-2" as any,
          version: 2,
        },
      },
      {
        _id: "doc-2" as any,
        title: "Meeting Notes - Q4 Planning",
        content: "## Q4 Planning Meeting\n\n### Attendees\n- John Doe\n- Jane Smith\n\n### Agenda\n1. Review Q3 results...",
        isPublic: true,
        parentId: null,
        workspaceId: "ws-1" as any,
        createdBy: "user-2" as any,
        authorName: "Jane Smith",
        authorEmail: "jane@example.com",
        _creationTime: Date.now() - 86400000 * 14, // 14 days ago
        lastModified: Date.now() - 86400000 * 1, // 1 day ago
        isPinned: false,
        isStarred: true,
        tags: ["meeting", "planning"],
        metadata: {
          description: "Notes from Q4 planning meeting",
          tags: ["meeting", "planning"],
          version: 1,
        },
      },
      {
        _id: "doc-3" as any,
        title: "API Documentation",
        content: "# API Documentation\n\n## Authentication\nAll API requests require authentication...",
        isPublic: true,
        parentId: "doc-1" as any,
        workspaceId: "ws-1" as any,
        createdBy: "user-3" as any,
        authorName: "Bob Johnson",
        authorEmail: "bob@example.com",
        _creationTime: Date.now() - 86400000 * 30, // 30 days ago
        lastModified: Date.now() - 86400000 * 5, // 5 days ago
        lastEditedBy: "user-3" as any,
        isPinned: false,
        isStarred: false,
        tags: ["documentation", "reference"],
        metadata: {
          description: "Complete API documentation for developers",
          tags: ["documentation", "reference"],
          lastEditedBy: "user-3" as any,
          version: 5,
        },
      },
      {
        _id: "doc-4" as any,
        title: "Knowledge Base: Getting Started",
        content: "# Getting Started Guide\n\nWelcome to our platform! This guide will help you...",
        isPublic: true,
        parentId: null,
        workspaceId: "ws-1" as any,
        createdBy: "user-1" as any,
        authorName: "John Doe",
        authorEmail: "john@example.com",
        _creationTime: Date.now() - 86400000 * 60, // 60 days ago
        lastModified: Date.now() - 86400000 * 10, // 10 days ago
        isPinned: true,
        isStarred: true,
        tags: ["guide", "knowledge-base", getCategoryTag("article")],
        metadata: {
          description: "Getting started guide for new users",
          tags: ["guide", "knowledge-base", getCategoryTag("article")],
          lastEditedBy: "user-1" as any,
          version: 3,
        },
      },
    ]

    // Transform data for export
    const transformedDocuments = mockDocuments.map(doc => ({
      ...doc,
      category: getDocumentCategory(doc.tags),
      description: doc.metadata?.description,
      tags: doc.tags?.filter(tag => !tag.startsWith("__category:")),
      version: doc.metadata?.version,
      lastEditedBy: doc.metadata?.lastEditedBy,
    }))

    // Filter based on request
    let filteredDocuments = transformedDocuments

    if (request.dataType === "selected" && request.selectedIds) {
      filteredDocuments = transformedDocuments.filter(doc =>
        request.selectedIds!.includes(doc._id)
      )
    }

    // Apply filters
    if (request.filters) {
      Object.entries(request.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          if (field === "category") {
            filteredDocuments = filteredDocuments.filter(doc =>
              getDocumentCategory(doc.tags) === value
            )
          } else if (field === "isPublic") {
            filteredDocuments = filteredDocuments.filter(doc =>
              doc.isPublic === Boolean(value)
            )
          } else {
            filteredDocuments = filteredDocuments.filter(doc =>
              doc[field as keyof typeof doc] === value
            )
          }
        }
      })
    }

    // Apply sorting
    if (request.sortBy) {
      filteredDocuments.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (request.sortBy) {
          case "created":
            aValue = a._creationTime
            bValue = b._creationTime
            break
          case "modified":
            aValue = a.lastModified || a._creationTime
            bValue = b.lastModified || b._creationTime
            break
          case "name":
            aValue = a.title
            bValue = b.title
            break
          default:
            aValue = a[request.sortBy as keyof typeof a]
            bValue = b[request.sortBy as keyof typeof b]
        }

        if (request.sortOrder === "desc") {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filteredDocuments
  },

  // Import data function
  importData: async (request): Promise<any> => {
    const { parseImportFile } = await import("@/frontend/shared/foundation/utils/export/data-import-engine")
    const { data } = await parseImportFile(request.file, request.format)

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as any[],
      warnings: [] as any[],
    }

    for (const item of data) {
      try {
        // Validate required fields
        if (!item.title || item.workspaceId === undefined || item.createdBy === undefined) {
          results.failed++
          results.errors.push({
            row: data.indexOf(item) + 1,
            message: "Missing required fields: title, workspaceId, or createdBy",
            type: "missing" as const,
          })
          continue
        }

        // Validate category
        const validCategories = ["document", "article"]
        if (item.category && !validCategories.includes(item.category)) {
          results.failed++
          results.errors.push({
            row: data.indexOf(item) + 1,
            message: `Invalid category: ${item.category}. Must be one of: ${validCategories.join(", ")}`,
            type: "validation" as const,
          })
          continue
        }

        // Process tags and category
        const tags = item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : []
        if (item.category) {
          tags.push(getCategoryTag(item.category as DocumentCategory))
        }

        // Prepare metadata
        const metadata: any = {
          description: item.description,
          tags: item.tags,
          version: item.version || 1,
          lastEditedBy: item.lastEditedBy,
        }

        // Check if document already exists
        if (item._id) {
          // Update existing document
          // await ctx.db.patch(item._id, {
          //   title: item.title,
          //   content: item.content,
          //   isPublic: Boolean(item.isPublic),
          //   parentId: item.parentId || null,
          //   lastModified: Date.now(),
          //   isPinned: Boolean(item.isPinned),
          //   isStarred: Boolean(item.isStarred),
          //   tags,
          //   metadata,
          // })
          results.updated++
        } else {
          // Create new document
          // await ctx.db.insert("documents", {
          //   title: item.title,
          //   content: item.content || "",
          //   isPublic: Boolean(item.isPublic),
          //   parentId: item.parentId || null,
          //   workspaceId: item.workspaceId,
          //   createdBy: item.createdBy,
          //   _creationTime: item._creationTime ? new Date(item._creationTime).getTime() : Date.now(),
          //   lastModified: item.lastModified ? new Date(item.lastModified).getTime() : undefined,
          //   author: item.authorName ? {
          //     name: item.authorName,
          //     email: item.authorEmail,
          //   } : null,
          //   isPinned: Boolean(item.isPinned),
          //   isStarred: Boolean(item.isStarred),
          //   tags,
          //   metadata,
          // })
          results.imported++
        }
      } catch (error) {
        results.failed++
        results.errors.push({
          row: data.indexOf(item) + 1,
          message: error instanceof Error ? error.message : "Unknown error",
          type: "validation" as const,
        })
      }
    }

    return {
      success: results.failed === 0,
      ...results,
    }
  },

  // Template definitions
  templates: {
    json: {
      name: "Documents JSON Template",
      description: "Template for importing documents in JSON format",
      sampleData: [
        {
          title: "Welcome Document",
          content: "# Welcome\n\nThis is a sample document content.\n\n## Features\n- Supports Markdown\n- Hierarchical structure\n- Tags and categories",
          isPublic: false,
          category: "document",
          tags: ["welcome", "template"],
          description: "Welcome document template",
          workspaceId: "your-workspace-id",
          createdBy: "your-user-id",
          authorName: "Your Name",
          authorEmail: "your@email.com",
          version: 1,
        },
        {
          title: "Knowledge Base Article",
          content: "# Article Title\n\nThis article demonstrates the knowledge base format.\n\n## Sections\nAdd your content here...",
          isPublic: true,
          category: "article",
          tags: ["knowledge-base", "article"],
          description: "Knowledge base article template",
          workspaceId: "your-workspace-id",
          createdBy: "your-user-id",
          authorName: "Your Name",
          authorEmail: "your@email.com",
          isPinned: true,
          version: 1,
        },
      ],
    },
    csv: {
      name: "Documents CSV Template",
      description: "Template for importing documents in CSV format",
      sampleData: [
        {
          title: "Sample Document",
          content: "This is a sample document content. Can include HTML or Markdown.",
          isPublic: "true",
          category: "document",
          tags: "sample",
          description: "A sample document for testing",
          workspaceId: "your-workspace-id",
          createdBy: "your-user-id",
          authorName: "Your Name",
          version: "1",
        },
      ],
    },
  },
}

// Export for registration
export default exportConfig
