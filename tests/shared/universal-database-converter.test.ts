/**
 * Universal Database Converter Tests
 * Tests for bidirectional conversion between V1 and Universal Database formats
 */

import { describe, it, expect } from "vitest";
import {
  toUniversal,
  fromUniversal,
  validateUniversalDatabase as converterValidate,
  createMinimalDatabase,
} from "../../convex/lib/converters/databaseConverter";
import type {
  V1DbTable,
  V1DbField,
  V1DbView,
  V1DbRow,
} from "../../convex/lib/converters/databaseConverter";

// Mock Convex IDs
const mockIds = {
  workspace: "workspace_123" as any,
  user: "user_123" as any,
  table: "table_123" as any,
  field1: "field_1" as any,
  field2: "field_2" as any,
  view1: "view_1" as any,
  row1: "row_1" as any,
};

describe("Database Converter", () => {
  describe("toUniversal", () => {
    it("should convert V1 database to Universal format", () => {
      const table: V1DbTable = {
        _id: mockIds.table,
        workspaceId: mockIds.workspace,
        name: "Tasks",
        description: "Task management",
        icon: "📋",
        createdById: mockIds.user,
        updatedById: mockIds.user,
        isTemplate: false,
        settings: {
          showProperties: true,
          wrapCells: false,
          showCalculations: true,
        },
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      const fields: V1DbField[] = [
        {
          _id: mockIds.field1,
          tableId: mockIds.table,
          name: "Task Name",
          type: "text",
          isRequired: true,
          isPrimary: true,
          position: 0,
        },
        {
          _id: mockIds.field2,
          tableId: mockIds.table,
          name: "Status",
          type: "select",
          options: {
            selectOptions: [
              { id: "1", name: "To Do", color: "gray" },
              { id: "2", name: "Done", color: "green" },
            ],
          },
          isRequired: false,
          position: 1,
        },
      ];

      const views: V1DbView[] = [
        {
          _id: mockIds.view1,
          tableId: mockIds.table,
          name: "All Tasks",
          type: "table",
          settings: {
            filters: [],
            sorts: [],
            visibleFields: [mockIds.field1, mockIds.field2],
          },
          createdById: mockIds.user,
          isDefault: true,
          position: 0,
        },
      ];

      const result = toUniversal(table, fields, views);

      expect(result.schemaVersion).toBe("2.0");
      expect(result.db.id).toBe(mockIds.table);
      expect(result.db.name).toBe("Tasks");
      expect(result.db.description).toBe("Task management");
      expect(result.db.icon).toBe("📋");
      expect(result.db.properties).toHaveLength(2);
      expect(result.db.views).toHaveLength(1);
      expect(result.db.rows).toHaveLength(0);
    });

    it("should convert V1 field types to Universal property types", () => {
      const table: V1DbTable = {
        _id: mockIds.table,
        workspaceId: mockIds.workspace,
        name: "Test",
        createdById: mockIds.user,
        updatedById: mockIds.user,
        isTemplate: false,
        settings: {
          showProperties: true,
          wrapCells: false,
          showCalculations: true,
        },
      };

      const fields: V1DbField[] = [
        { _id: "f1" as any, tableId: mockIds.table, name: "Text", type: "text", isRequired: false, isPrimary: true, position: 0 },
        { _id: "f2" as any, tableId: mockIds.table, name: "Number", type: "number", isRequired: false, position: 1 },
        { _id: "f3" as any, tableId: mockIds.table, name: "Select", type: "select", isRequired: false, position: 2 },
        { _id: "f4" as any, tableId: mockIds.table, name: "Multi", type: "multiSelect", isRequired: false, position: 3 },
        { _id: "f5" as any, tableId: mockIds.table, name: "Date", type: "date", isRequired: false, position: 4 },
        { _id: "f6" as any, tableId: mockIds.table, name: "Person", type: "person", isRequired: false, position: 5 },
        { _id: "f7" as any, tableId: mockIds.table, name: "Files", type: "files", isRequired: false, position: 6 },
        { _id: "f8" as any, tableId: mockIds.table, name: "Check", type: "checkbox", isRequired: false, position: 7 },
      ];

      const views: V1DbView[] = [
        {
          _id: mockIds.view1,
          tableId: mockIds.table,
          name: "Default",
          type: "table",
          settings: { filters: [], sorts: [], visibleFields: [] },
          createdById: mockIds.user,
          isDefault: true,
        },
      ];

      const result = toUniversal(table, fields, views);

      expect(result.db.properties[0].type).toBe("title");
      expect(result.db.properties[1].type).toBe("number");
      expect(result.db.properties[2].type).toBe("select");
      expect(result.db.properties[3].type).toBe("multi_select");
      expect(result.db.properties[4].type).toBe("date");
      expect(result.db.properties[5].type).toBe("people");
      expect(result.db.properties[6].type).toBe("files");
      expect(result.db.properties[7].type).toBe("checkbox");
    });

    it("should convert V1 view types to Universal layouts", () => {
      const table: V1DbTable = {
        _id: mockIds.table,
        workspaceId: mockIds.workspace,
        name: "Test",
        createdById: mockIds.user,
        updatedById: mockIds.user,
        isTemplate: false,
        settings: {
          showProperties: true,
          wrapCells: false,
          showCalculations: true,
        },
      };

      const fields: V1DbField[] = [
        { _id: mockIds.field1, tableId: mockIds.table, name: "Name", type: "text", isRequired: false, isPrimary: true, position: 0 },
      ];

      const views: V1DbView[] = [
        {
          _id: "v1" as any,
          tableId: mockIds.table,
          name: "Table",
          type: "table",
          settings: { filters: [], sorts: [], visibleFields: [] },
          createdById: mockIds.user,
          isDefault: true,
        },
        {
          _id: "v2" as any,
          tableId: mockIds.table,
          name: "Board",
          type: "board",
          settings: { filters: [], sorts: [], visibleFields: [] },
          createdById: mockIds.user,
          isDefault: false,
        },
        {
          _id: "v3" as any,
          tableId: mockIds.table,
          name: "Calendar",
          type: "calendar",
          settings: { filters: [], sorts: [], visibleFields: [] },
          createdById: mockIds.user,
          isDefault: false,
        },
      ];

      const result = toUniversal(table, fields, views);

      expect(result.db.views[0].layout).toBe("table");
      expect(result.db.views[1].layout).toBe("board");
      expect(result.db.views[2].layout).toBe("calendar");
    });

    it("should convert V1 rows with data mapping", () => {
      const table: V1DbTable = {
        _id: mockIds.table,
        workspaceId: mockIds.workspace,
        name: "Test",
        createdById: mockIds.user,
        updatedById: mockIds.user,
        isTemplate: false,
        settings: {
          showProperties: true,
          wrapCells: false,
          showCalculations: true,
        },
      };

      const fields: V1DbField[] = [
        { _id: mockIds.field1, tableId: mockIds.table, name: "Name", type: "text", isRequired: false, isPrimary: true, position: 0 },
        { _id: mockIds.field2, tableId: mockIds.table, name: "Status", type: "select", isRequired: false, position: 1 },
      ];

      const views: V1DbView[] = [
        {
          _id: mockIds.view1,
          tableId: mockIds.table,
          name: "Default",
          type: "table",
          settings: { filters: [], sorts: [], visibleFields: [] },
          createdById: mockIds.user,
          isDefault: true,
        },
      ];

      const rows: V1DbRow[] = [
        {
          _id: mockIds.row1,
          tableId: mockIds.table,
          workspaceId: mockIds.workspace,
          data: {
            [mockIds.field1]: "Task 1",
            [mockIds.field2]: "To Do",
          },
          createdById: mockIds.user,
          updatedById: mockIds.user,
          position: 0,
          createdAt: 1234567890,
          updatedAt: 1234567890,
        },
      ];

      const result = toUniversal(table, fields, views, rows);

      expect(result.db.rows).toHaveLength(1);
      expect(result.db.rows[0].id).toBe(mockIds.row1);
      expect(result.db.rows[0].properties.name).toBe("Task 1");
      expect(result.db.rows[0].properties.status).toBe("To Do");
    });
  });

  describe("fromUniversal", () => {
    it("should convert Universal database to V1 format", () => {
      const universal = {
        schemaVersion: "2.0" as const,
        db: {
          id: "db_1",
          name: "Tasks",
          description: "Task management",
          icon: "📋",
          properties: [
            {
              key: "name",
              name: "Task Name",
              type: "title",
              isRequired: true,
              isPrimary: true,
              position: 0,
            },
            {
              key: "status",
              name: "Status",
              type: "select",
              options: {
                choices: ["To Do", "Done"],
              },
              position: 1,
            },
          ],
          views: [
            {
              name: "All Tasks",
              layout: "table",
              isDefault: true,
              visibleProps: ["name", "status"],
              filters: [],
              sorts: [],
            },
          ],
          rows: [
            {
              id: "row_1",
              properties: {
                name: "Task 1",
                status: "To Do",
              },
              position: 0,
            },
          ],
          settings: {
            showProperties: true,
            wrapCells: false,
            showCalculations: true,
          },
        },
      };

      const result = fromUniversal(universal, mockIds.workspace, mockIds.user);

      expect(result.table.name).toBe("Tasks");
      expect(result.table.description).toBe("Task management");
      expect(result.table.icon).toBe("📋");
      expect(result.fields).toHaveLength(2);
      expect(result.views).toHaveLength(1);
      expect(result.rows).toHaveLength(1);
    });

    it("should convert Universal property types to V1 field types", () => {
      const universal = {
        schemaVersion: "2.0" as const,
        db: {
          id: "db_1",
          name: "Test",
          properties: [
            { key: "title", name: "Title", type: "title", isPrimary: true, position: 0 },
            { key: "text", name: "Text", type: "rich_text", position: 1 },
            { key: "num", name: "Number", type: "number", position: 2 },
            { key: "sel", name: "Select", type: "select", position: 3 },
            { key: "multi", name: "Multi", type: "multi_select", position: 4 },
            { key: "date", name: "Date", type: "date", position: 5 },
            { key: "people", name: "People", type: "people", position: 6 },
          ],
          views: [
            {
              name: "Default",
              layout: "table",
              isDefault: true,
            },
          ],
          rows: [],
        },
      };

      const result = fromUniversal(universal, mockIds.workspace, mockIds.user);

      expect(result.fields[0].type).toBe("text");
      expect(result.fields[1].type).toBe("text");
      expect(result.fields[2].type).toBe("number");
      expect(result.fields[3].type).toBe("select");
      expect(result.fields[4].type).toBe("multiSelect");
      expect(result.fields[5].type).toBe("date");
      expect(result.fields[6].type).toBe("person");
    });

    it("should convert Universal layouts to V1 view types", () => {
      const universal = {
        schemaVersion: "2.0" as const,
        db: {
          id: "db_1",
          name: "Test",
          properties: [
            { key: "name", name: "Name", type: "title", isPrimary: true, position: 0 },
          ],
          views: [
            { name: "Table", layout: "table", isDefault: true },
            { name: "Board", layout: "board", groupBy: "status" },
            { name: "List", layout: "list" },
            { name: "Timeline", layout: "timeline", options: { start: "date" } },
            { name: "Calendar", layout: "calendar", options: { dateProp: "date" } },
          ],
          rows: [],
        },
      };

      const result = fromUniversal(universal, mockIds.workspace, mockIds.user);

      expect(result.views[0].type).toBe("table");
      expect(result.views[1].type).toBe("board");
      expect(result.views[2].type).toBe("list");
      expect(result.views[3].type).toBe("timeline");
      expect(result.views[4].type).toBe("calendar");
    });

    it("should handle new view layouts with fallback", () => {
      const universal = {
        schemaVersion: "2.0" as const,
        db: {
          id: "db_1",
          name: "Test",
          properties: [
            { key: "name", name: "Name", type: "title", isPrimary: true, position: 0 },
          ],
          views: [
            { name: "Gallery", layout: "gallery", isDefault: true },
            { name: "Map", layout: "map", options: { placeProp: "location" } },
            { name: "Chart", layout: "chart", options: { chart: { type: "bar", x: "status", y: { agg: "count" } } } },
            { name: "Feed", layout: "feed", options: { card: { title: "name" } } },
            { name: "Form", layout: "form", options: { form: { title: "New", fields: [] } } },
          ],
          rows: [],
        },
      };

      const result = fromUniversal(universal, mockIds.workspace, mockIds.user);

      // New layouts should fallback to compatible V1 types
      expect(result.views[0].type).toBe("gallery");
      expect(result.views[1].type).toBe("table");
      expect(result.views[2].type).toBe("table");
      expect(result.views[3].type).toBe("list");
      expect(result.views[4].type).toBe("table");
    });
  });

  describe("validateUniversalDatabase", () => {
    it("should validate a well-formed database", () => {
      const universal = {
        schemaVersion: "2.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [
            { key: "name", name: "Name", type: "title", isPrimary: true, position: 0 },
          ],
          views: [
            { name: "All", layout: "table", isDefault: true },
          ],
          rows: [],
        },
      };

      const result = converterValidate(universal);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid schema version", () => {
      const universal = {
        schemaVersion: "1.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [],
          views: [],
          rows: [],
        },
      };

      const result = converterValidate(universal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid schema version. Expected 2.0");
    });

    it("should reject database without primary property", () => {
      const universal = {
        schemaVersion: "2.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [
            { key: "name", name: "Name", type: "title", position: 0 },
          ],
          views: [
            { name: "All", layout: "table", isDefault: true },
          ],
          rows: [],
        },
      };

      const result = converterValidate(universal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Database must have at least one primary property");
    });

    it("should reject database without default view", () => {
      const universal = {
        schemaVersion: "2.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [
            { key: "name", name: "Name", type: "title", isPrimary: true, position: 0 },
          ],
          views: [
            { name: "All", layout: "table" },
          ],
          rows: [],
        },
      };

      const result = converterValidate(universal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Database must have at least one default view");
    });
  });

  describe("createMinimalDatabase", () => {
    it("should create a valid minimal database", () => {
      const db = createMinimalDatabase("My Database", mockIds.workspace, mockIds.user);

      expect(db.schemaVersion).toBe("2.0");
      expect(db.db.name).toBe("My Database");
      expect(db.db.properties).toHaveLength(1);
      expect(db.db.properties[0].type).toBe("title");
      expect(db.db.properties[0].isPrimary).toBe(true);
      expect(db.db.views).toHaveLength(1);
      expect(db.db.views[0].isDefault).toBe(true);
      expect(db.db.rows).toHaveLength(0);
    });

    it("should pass validation", () => {
      const db = createMinimalDatabase("Test", mockIds.workspace, mockIds.user);
      const result = converterValidate(db);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Bidirectional conversion", () => {
    it("should maintain data integrity through round-trip conversion", () => {
      // Create V1 database
      const v1Table: V1DbTable = {
        _id: mockIds.table,
        workspaceId: mockIds.workspace,
        name: "Tasks",
        description: "Task management",
        icon: "📋",
        createdById: mockIds.user,
        updatedById: mockIds.user,
        isTemplate: false,
        settings: {
          showProperties: true,
          wrapCells: false,
          showCalculations: true,
        },
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      const v1Fields: V1DbField[] = [
        {
          _id: mockIds.field1,
          tableId: mockIds.table,
          name: "Task Name",
          type: "text",
          isRequired: true,
          isPrimary: true,
          position: 0,
        },
      ];

      const v1Views: V1DbView[] = [
        {
          _id: mockIds.view1,
          tableId: mockIds.table,
          name: "All Tasks",
          type: "table",
          settings: {
            filters: [],
            sorts: [],
            visibleFields: [mockIds.field1],
          },
          createdById: mockIds.user,
          isDefault: true,
          position: 0,
        },
      ];

      // Convert to Universal
      const universal = toUniversal(v1Table, v1Fields, v1Views);

      // Convert back to V1
      const v1Again = fromUniversal(universal, mockIds.workspace, mockIds.user);

      // Verify data integrity
      expect(v1Again.table.name).toBe(v1Table.name);
      expect(v1Again.table.description).toBe(v1Table.description);
      expect(v1Again.table.icon).toBe(v1Table.icon);
      expect(v1Again.fields).toHaveLength(1);
      expect(v1Again.fields[0].name).toBe(v1Fields[0].name);
      expect(v1Again.fields[0].isPrimary).toBe(v1Fields[0].isPrimary);
      expect(v1Again.views).toHaveLength(1);
      expect(v1Again.views[0].name).toBe(v1Views[0].name);
      expect(v1Again.views[0].isDefault).toBe(v1Views[0].isDefault);
    });
  });
});
