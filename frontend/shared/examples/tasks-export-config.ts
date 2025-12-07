/**
 * Example Export Configuration for Tasks Feature
 * This file demonstrates how to configure export/import for a feature
 */

import type { FeatureExportConfig } from "@/frontend/shared/foundation/utils/export/data-export-types"
import { v4 as uuidv4 } from "uuid"

export const tasksExportConfig: FeatureExportConfig = {
  featureId: "tasks",
  featureName: "Tasks",

  // Define export properties
  exportProperties: async () => [
    {
      key: "id",
      label: "Task ID",
      type: "string",
      required: false,
    },
    {
      key: "title",
      label: "Title",
      type: "string",
      required: true,
    },
    {
      key: "description",
      label: "Description",
      type: "string",
      required: false,
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      options: ["todo", "in-progress", "review", "done"],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: ["low", "medium", "high", "urgent"],
    },
    {
      key: "assigneeId",
      label: "Assignee ID",
      type: "string",
      required: false,
    },
    {
      key: "assigneeName",
      label: "Assignee Name",
      type: "string",
      required: false,
    },
    {
      key: "dueDate",
      label: "Due Date",
      type: "date",
      required: false,
      format: "yyyy-MM-dd",
    },
    {
      key: "estimatedHours",
      label: "Estimated Hours",
      type: "number",
      required: false,
    },
    {
      key: "actualHours",
      label: "Actual Hours",
      type: "number",
      required: false,
    },
    {
      key: "tags",
      label: "Tags",
      type: "multiselect",
      required: false,
      options: ["bug", "feature", "enhancement", "documentation", "research"],
    },
    {
      key: "projectId",
      label: "Project ID",
      type: "string",
      required: true,
    },
    {
      key: "createdBy",
      label: "Created By",
      type: "string",
      required: false,
    },
    {
      key: "createdAt",
      label: "Created At",
      type: "date",
      required: false,
    },
    {
      key: "updatedAt",
      label: "Updated At",
      type: "date",
      required: false,
    },
  ],

  // Export data function
  exportData: async (request) => {
    // This would typically call your Convex queries
    // For example:
    // const tasks = await ctx.db.query("tasks")
    //   .filter(q => q.eq(q.field("projectId"), request.projectId))
    //   .collect()

    // Mock data for demonstration
    const mockTasks = [
      {
        id: uuidv4(),
        title: "Setup project repository",
        description: "Create git repository and initial project structure",
        status: "done",
        priority: "high",
        assigneeId: "user-1",
        assigneeName: "John Doe",
        dueDate: "2024-01-15",
        estimatedHours: 8,
        actualHours: 6,
        tags: ["setup", "infrastructure"],
        projectId: "proj-1",
        createdBy: "user-1",
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
      },
      {
        id: uuidv4(),
        title: "Design user authentication",
        description: "Create wireframes and mockups for login/signup flow",
        status: "in-progress",
        priority: "high",
        assigneeId: "user-2",
        assigneeName: "Jane Smith",
        dueDate: "2024-01-20",
        estimatedHours: 16,
        actualHours: 10,
        tags: ["design", "authentication"],
        projectId: "proj-1",
        createdBy: "user-2",
        createdAt: "2024-01-11T09:00:00Z",
        updatedAt: "2024-01-15T16:45:00Z",
      },
      {
        id: uuidv4(),
        title: "Implement API endpoints",
        description: "Create RESTful API for user management",
        status: "todo",
        priority: "medium",
        assigneeId: "user-3",
        assigneeName: "Bob Johnson",
        dueDate: "2024-01-25",
        estimatedHours: 24,
        actualHours: 0,
        tags: ["backend", "api"],
        projectId: "proj-1",
        createdBy: "user-1",
        createdAt: "2024-01-12T10:30:00Z",
        updatedAt: "2024-01-12T10:30:00Z",
      },
    ]

    // Filter based on request
    let filteredTasks = mockTasks

    if (request.dataType === "selected" && request.selectedIds) {
      filteredTasks = mockTasks.filter(task => request.selectedIds!.includes(task.id))
    }

    if (request.sortBy) {
      filteredTasks.sort((a, b) => {
        const aValue = a[request.sortBy as keyof typeof a]
        const bValue = b[request.sortBy as keyof typeof b]

        if (request.sortOrder === "desc") {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filteredTasks
  },

  // Import data function
  importData: async (request): Promise<any> => {
    // Parse the imported data
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
        if (!item.title || !item.status || !item.priority || !item.projectId) {
          results.failed++
          results.errors.push({
            row: data.indexOf(item) + 1,
            message: "Missing required fields: title, status, priority, or projectId",
            type: "validation",
          })
          continue
        }

        // Check if task already exists (by ID)
        if (item.id) {
          // Update existing task
          // await ctx.db.patch(item.id, {
          //   ...item,
          //   updatedAt: Date.now(),
          // })
          results.updated++
        } else {
          // Create new task
          // await ctx.db.insert("tasks", {
          //   ...item,
          //   id: uuidv4(),
          //   createdAt: Date.now(),
          //   updatedAt: Date.now(),
          // })
          results.imported++
        }
      } catch (error) {
        results.failed++
        results.errors.push({
          row: data.indexOf(item) + 1,
          message: error instanceof Error ? error.message : "Unknown error",
          type: "validation",
        })
      }
    }

    return {
      success: results.failed === 0,
      ...results,
    }
  },

  // Templates for different formats
  templates: {
    json: {
      name: "Tasks JSON Template",
      description: "Template for importing tasks in JSON format",
      sampleData: [
        {
          title: "Example Task",
          description: "This is an example task description",
          status: "todo",
          priority: "medium",
          assigneeName: "John Doe",
          dueDate: "2024-12-31",
          estimatedHours: 8,
          tags: ["example"],
          projectId: "your-project-id",
        },
      ],
    },
    csv: {
      name: "Tasks CSV Template",
      description: "Template for importing tasks in CSV format",
      sampleData: [
        {
          title: "Example Task",
          description: "This is an example task description",
          status: "todo",
          priority: "medium",
          assigneeName: "John Doe",
          dueDate: "2024-12-31",
          estimatedHours: 8,
          tags: "example",
          projectId: "your-project-id",
        },
      ],
    },
  },
}

// Export for registration
export default tasksExportConfig