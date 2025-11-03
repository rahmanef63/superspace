/**
 * Universal Database Test Fixtures
 * 
 * Sample data for testing Universal Database types and converters
 */

import type { Id } from "../../convex/_generated/dataModel";

/**
 * Sample UniversalDatabase fixture
 * Based on docs/UNIVERSAL_DATABASE_SPEC.md
 */
export const sampleUniversalDatabase = {
  schemaVersion: "2.0" as const,
  db: {
    // Identity
    id: "db_sample_001",
    name: "Project Tasks",
    description: "Task management for our project",
    icon: "📋",
    coverUrl: "https://example.com/cover.jpg",

    // Workspace context
    workspaceId: "workspace_123" as Id<"workspaces">,

    // Properties (columns/fields)
    properties: [
      {
        key: "title",
        name: "Task Name",
        type: "title" as const,
        isPrimary: true,
        position: 0,
        description: "The name of the task",
      },
      {
        key: "status",
        name: "Status",
        type: "status" as const,
        position: 1,
        options: {
          groups: [
            {
              id: "todo",
              name: "To Do",
              color: "gray",
              options: [
                { id: "not_started", name: "Not Started", color: "gray" },
              ],
            },
            {
              id: "in_progress",
              name: "In Progress",
              color: "blue",
              options: [
                { id: "working", name: "Working", color: "blue" },
              ],
            },
            {
              id: "done",
              name: "Done",
              color: "green",
              options: [
                { id: "completed", name: "Completed", color: "green" },
              ],
            },
          ],
        },
      },
      {
        key: "assignee",
        name: "Assigned To",
        type: "people" as const,
        position: 2,
      },
      {
        key: "due_date",
        name: "Due Date",
        type: "date" as const,
        position: 3,
      },
      {
        key: "priority",
        name: "Priority",
        type: "select" as const,
        position: 4,
        options: {
          options: [
            { id: "high", name: "High", color: "red" },
            { id: "medium", name: "Medium", color: "yellow" },
            { id: "low", name: "Low", color: "green" },
          ],
        },
      },
    ],

    // Views (layouts)
    views: [
      {
        id: "view_table",
        name: "All Tasks",
        layout: "table" as const,
        isDefault: true,
        position: 0,
        visibleProps: ["title", "status", "assignee", "due_date", "priority"],
        filters: [],
        sorts: [
          {
            property: "due_date",
            direction: "asc" as const,
          },
        ],
      },
      {
        id: "view_board",
        name: "Kanban Board",
        layout: "board" as const,
        position: 1,
        groupBy: "status",
        visibleProps: ["title", "assignee", "due_date"],
        filters: [],
        sorts: [],
      },
      {
        id: "view_calendar",
        name: "Calendar",
        layout: "calendar" as const,
        position: 2,
        visibleProps: ["title", "assignee", "priority"],
        options: {
          dateProperty: "due_date",
        },
      },
    ],

    // Rows (records)
    rows: [
      {
        id: "row_001",
        properties: {
          title: "Setup development environment",
          status: "completed",
          assignee: ["user_001"],
          due_date: { start: "2025-11-01" },
          priority: "high",
        },
        position: 0,
        createdAt: 1698796800000,
        updatedAt: 1698883200000,
      },
      {
        id: "row_002",
        properties: {
          title: "Create universal types",
          status: "working",
          assignee: ["user_001", "user_002"],
          due_date: { start: "2025-11-10" },
          priority: "high",
        },
        position: 1,
        createdAt: 1698883200000,
        updatedAt: 1698969600000,
      },
      {
        id: "row_003",
        properties: {
          title: "Write tests",
          status: "not_started",
          assignee: ["user_002"],
          due_date: { start: "2025-11-15" },
          priority: "medium",
        },
        position: 2,
        createdAt: 1698969600000,
      },
    ],

    // Metadata
    createdBy: "user_001",
    createdTime: 1698796800000,
    lastEditedBy: "user_001",
    lastEditedTime: 1698969600000,

    // Settings
    settings: {
      showProperties: true,
      wrapCells: false,
      showCalculations: true,
      isPublic: false,
      isTemplate: false,
    },
  },
};

/**
 * Minimal UniversalDatabase fixture
 * For testing basic functionality
 */
export const minimalUniversalDatabase = {
  schemaVersion: "2.0" as const,
  db: {
    id: "db_minimal",
    name: "Simple List",
    workspaceId: "workspace_123" as Id<"workspaces">,
    properties: [
      {
        key: "title",
        name: "Title",
        type: "title" as const,
        isPrimary: true,
        position: 0,
      },
    ],
    views: [
      {
        id: "view_default",
        name: "Default View",
        layout: "table" as const,
        isDefault: true,
        position: 0,
        visibleProps: ["title"],
      },
    ],
    rows: [],
  },
};

/**
 * Sample property fixtures for testing individual properties
 */
export const sampleProperties = {
  title: {
    key: "title",
    name: "Title",
    type: "title" as const,
    isPrimary: true,
  },
  richText: {
    key: "description",
    name: "Description",
    type: "rich_text" as const,
  },
  number: {
    key: "amount",
    name: "Amount",
    type: "number" as const,
    options: {
      format: "currency" as const,
      currency: "USD",
    },
  },
  select: {
    key: "category",
    name: "Category",
    type: "select" as const,
    options: {
      options: [
        { id: "work", name: "Work", color: "blue" },
        { id: "personal", name: "Personal", color: "green" },
      ],
    },
  },
  date: {
    key: "due_date",
    name: "Due Date",
    type: "date" as const,
    options: {
      dateFormat: "YYYY-MM-DD" as const,
    },
  },
  checkbox: {
    key: "is_complete",
    name: "Complete",
    type: "checkbox" as const,
  },
  url: {
    key: "link",
    name: "Link",
    type: "url" as const,
  },
  email: {
    key: "contact",
    name: "Contact Email",
    type: "email" as const,
  },
  phone: {
    key: "phone",
    name: "Phone Number",
    type: "phone" as const,
  },
  people: {
    key: "assignees",
    name: "Assigned To",
    type: "people" as const,
  },
  files: {
    key: "attachments",
    name: "Attachments",
    type: "files" as const,
  },
};

/**
 * Sample view fixtures for testing different layouts
 */
export const sampleViews = {
  table: {
    id: "view_table",
    name: "Table View",
    layout: "table" as const,
    visibleProps: ["title", "status", "assignee"],
  },
  board: {
    id: "view_board",
    name: "Board View",
    layout: "board" as const,
    groupBy: "status",
    visibleProps: ["title", "assignee"],
  },
  list: {
    id: "view_list",
    name: "List View",
    layout: "list" as const,
    visibleProps: ["title", "status"],
  },
  calendar: {
    id: "view_calendar",
    name: "Calendar View",
    layout: "calendar" as const,
    options: {
      dateProperty: "due_date",
    },
  },
  gallery: {
    id: "view_gallery",
    name: "Gallery View",
    layout: "gallery" as const,
    options: {
      coverProperty: "cover_image",
      fitMode: "cover" as const,
    },
  },
  timeline: {
    id: "view_timeline",
    name: "Timeline View",
    layout: "timeline" as const,
    options: {
      startDateProperty: "start_date",
      endDateProperty: "end_date",
    },
  },
};

/**
 * Sample row fixtures
 */
export const sampleRows = {
  basic: {
    id: "row_001",
    properties: {
      title: "Sample Task",
      status: "in_progress",
    },
  },
  withDates: {
    id: "row_002",
    properties: {
      title: "Task with Dates",
      due_date: { start: "2025-11-15", end: "2025-11-20" },
    },
  },
  withPeople: {
    id: "row_003",
    properties: {
      title: "Team Task",
      assignees: ["user_001", "user_002", "user_003"],
    },
  },
  complete: {
    id: "row_004",
    properties: {
      title: "Complete Task Entry",
      status: "completed",
      assignees: ["user_001"],
      due_date: { start: "2025-11-01" },
      priority: "high",
      is_complete: true,
      tags: ["urgent", "important"],
    },
  },
};

/**
 * Helper function to create a custom database fixture
 */
export function createDatabaseFixture(overrides: Partial<typeof sampleUniversalDatabase.db>) {
  return {
    schemaVersion: "2.0" as const,
    db: {
      ...sampleUniversalDatabase.db,
      ...overrides,
    },
  };
}

/**
 * Helper function to create a property fixture
 */
export function createPropertyFixture(
  key: string,
  type: string,
  overrides: Record<string, any> = {}
) {
  return {
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    type,
    position: 0,
    ...overrides,
  };
}

/**
 * Helper function to create a view fixture
 */
export function createViewFixture(
  id: string,
  layout: string,
  overrides: Record<string, any> = {}
) {
  return {
    id,
    name: `${layout.charAt(0).toUpperCase() + layout.slice(1)} View`,
    layout,
    position: 0,
    visibleProps: ["title"],
    ...overrides,
  };
}
