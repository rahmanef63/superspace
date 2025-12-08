/**
 * Export/Import Configuration for Tasks Feature
 */

import type { FeatureExportConfig } from "@/frontend/shared/foundation/utils/export/data-export-types"
import { v4 as uuidv4 } from "uuid"

// ============================================================================
// Export Properties Configuration
// ============================================================================

const exportProperties = [
  {
    key: "_id",
    label: "Task ID",
    type: "string" as const,
    required: false,
    description: "Unique identifier (auto-generated if empty)",
  },
  {
    key: "title",
    label: "Title",
    type: "string" as const,
    required: true,
    description: "Task title",
  },
  {
    key: "description",
    label: "Description",
    type: "string" as const,
    required: false,
    description: "Detailed task description",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    required: true,
    options: ["todo", "in-progress", "review", "done"],
    description: "Current task status",
  },
  {
    key: "priority",
    label: "Priority",
    type: "select" as const,
    required: false,
    options: ["low", "medium", "high", "urgent"],
    description: "Priority level",
  },
  {
    key: "assigneeId",
    label: "Assignee ID",
    type: "string" as const,
    required: false,
    description: "User ID of assignee",
  },
  {
    key: "assigneeName",
    label: "Assignee Name",
    type: "string" as const,
    required: false,
    description: "Name of assignee",
  },
  {
    key: "projectId",
    label: "Project ID",
    type: "string" as const,
    required: true,
    description: "Associated project",
  },
  {
    key: "projectName",
    label: "Project Name",
    type: "string" as const,
    required: false,
    description: "Project name for reference",
  },
  {
    key: "dueDate",
    label: "Due Date",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd",
    description: "Task due date",
  },
  {
    key: "estimatedHours",
    label: "Estimated Hours",
    type: "number" as const,
    required: false,
    description: "Time estimate in hours",
  },
  {
    key: "actualHours",
    label: "Actual Hours",
    type: "number" as const,
    required: false,
    description: "Actual time spent in hours",
  },
  {
    key: "tags",
    label: "Tags",
    type: "multiselect" as const,
    required: false,
    options: ["bug", "feature", "enhancement", "documentation", "research", "urgent", "review"],
    description: "Task tags",
  },
  {
    key: "createdBy",
    label: "Created By",
    type: "string" as const,
    required: false,
    description: "User ID who created the task",
  },
  {
    key: "createdAt",
    label: "Created At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Creation timestamp",
  },
  {
    key: "updatedAt",
    label: "Updated At",
    type: "date" as const,
    required: false,
    format: "yyyy-MM-dd HH:mm:ss",
    description: "Last update timestamp",
  },
  {
    key: "workspaceId",
    label: "Workspace ID",
    type: "string" as const,
    required: true,
    description: "Workspace identifier",
  },
]

// ============================================================================
// Export/Import Configuration
// ============================================================================

export const exportConfig: FeatureExportConfig = {
  featureId: "tasks",
  featureName: "Tasks",

  exportProperties: async () => exportProperties,

  // Export data function
  exportData: async (request) => {
    // TODO: Replace with actual Convex query
    // const tasks = await ctx.db.query("tasks")
    //   .withIndex("by_workspace", q => q.eq("workspaceId", request.workspaceId))
    //   .collect()

    // Mock data for demonstration
    const mockTasks = [
      {
        _id: uuidv4(),
        title: "Setup project repository",
        description: "Create git repository and initial project structure",
        status: "done",
        priority: "high",
        assigneeId: "user-1",
        assigneeName: "John Doe",
        projectId: "proj-1",
        projectName: "Website Redesign",
        dueDate: "2024-01-15",
        estimatedHours: 8,
        actualHours: 6,
        tags: ["setup", "infrastructure"],
        createdBy: "user-1",
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
        workspaceId: "ws-1",
      },
      {
        _id: uuidv4(),
        title: "Design user authentication flow",
        description: "Create wireframes and mockups for login/signup flow",
        status: "in-progress",
        priority: "high",
        assigneeId: "user-2",
        assigneeName: "Jane Smith",
        projectId: "proj-1",
        projectName: "Website Redesign",
        dueDate: "2024-01-20",
        estimatedHours: 16,
        actualHours: 10,
        tags: ["design", "authentication"],
        createdBy: "user-2",
        createdAt: "2024-01-11T09:00:00Z",
        updatedAt: "2024-01-15T16:45:00Z",
        workspaceId: "ws-1",
      },
      {
        _id: uuidv4(),
        title: "Implement API endpoints",
        description: "Create RESTful API for user management",
        status: "todo",
        priority: "medium",
        assigneeId: "user-3",
        assigneeName: "Bob Johnson",
        projectId: "proj-1",
        projectName: "Website Redesign",
        dueDate: "2024-01-25",
        estimatedHours: 24,
        actualHours: 0,
        tags: ["backend", "api"],
        createdBy: "user-1",
        createdAt: "2024-01-12T10:30:00Z",
        updatedAt: "2024-01-12T10:30:00Z",
        workspaceId: "ws-1",
      },
    ]

    // Filter based on request
    let filteredTasks = mockTasks

    if (request.dataType === "selected" && request.selectedIds) {
      filteredTasks = mockTasks.filter(task => request.selectedIds!.includes(task._id))
    }

    // Apply filters
    if (request.filters) {
      Object.entries(request.filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          filteredTasks = filteredTasks.filter(task => task[field as keyof typeof task] === value)
        }
      })
    }

    // Apply sorting
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
        if (!item.title || !item.status || !item.projectId || !item.workspaceId) {
          results.failed++
          results.errors.push({
            row: data.indexOf(item) + 1,
            message: "Missing required fields: title, status, projectId, or workspaceId",
            type: "missing" as const,
          })
          continue
        }

        // Validate status value
        if (!exportProperties.find(p => p.key === "status")?.options?.includes(item.status)) {
          results.failed++
          results.errors.push({
            row: data.indexOf(item) + 1,
            message: `Invalid status: ${item.status}. Must be one of: ${exportProperties.find(p => p.key === "status")?.options?.join(", ")}`,
            type: "validation" as const,
          })
          continue
        }

        // Check if task already exists
        if (item._id) {
          // Update existing task
          // await ctx.db.patch(item._id, {
          //   ...item,
          //   updatedAt: Date.now(),
          // })
          results.updated++
        } else {
          // Create new task
          // await ctx.db.insert("tasks", {
          //   ...item,
          //   _id: uuidv4(),
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
      name: "Tasks JSON Template",
      description: "Template for importing tasks in JSON format",
      sampleData: [
        {
          title: "Complete project documentation",
          description: "Write comprehensive documentation for the project",
          status: "todo",
          priority: "medium",
          assigneeName: "John Doe",
          projectName: "Your Project Name",
          dueDate: "2024-12-31",
          estimatedHours: 8,
          tags: "documentation",
          workspaceId: "your-workspace-id",
        },
        {
          title: "Review pull requests",
          description: "Review and approve pending pull requests",
          status: "in-progress",
          priority: "high",
          assigneeName: "Jane Smith",
          projectName: "Your Project Name",
          dueDate: "2024-12-20",
          estimatedHours: 4,
          tags: "review,code",
          workspaceId: "your-workspace-id",
        },
      ],
    },
    csv: {
      name: "Tasks CSV Template",
      description: "Template for importing tasks in CSV format",
      sampleData: [
        {
          title: "Setup development environment",
          description: "Install and configure development tools",
          status: "todo",
          priority: "high",
          assigneeName: "Developer",
          projectName: "Your Project Name",
          dueDate: "2024-12-25",
          estimatedHours: 2,
          tags: "setup",
          workspaceId: "your-workspace-id",
        },
      ],
    },
  },
}

// Export for registration
export default exportConfig
