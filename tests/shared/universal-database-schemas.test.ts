/**
 * Universal Database Schemas Tests
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from "vitest";
import {
  PropertyTypeSchema,
  ViewLayoutSchema,
  FilterOperatorSchema,
  PropertySchema,
  ViewSchema,
  RowSchema,
  DatabaseSpecSchema,
  UniversalDatabaseSchema,
  validateUniversalDatabase,
  validateProperty,
  validateView,
  validateRow,
} from "@/frontend/shared/foundation/schemas/universal-database";

describe("Universal Database Schema Validation", () => {
  describe("PropertyTypeSchema", () => {
    it("should validate all 21 property types", () => {
      const types = [
        "title", "rich_text", "number", "select", "multi_select",
        "date", "people", "files", "checkbox", "url", "email",
        "relation", "rollup", "formula", "status", "phone",
        "button", "unique_id", "place",
        "created_time", "created_by", "last_edited_time", "last_edited_by"
      ];

      types.forEach(type => {
        const result = PropertyTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid property types", () => {
      const result = PropertyTypeSchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("ViewLayoutSchema", () => {
    it("should validate all 10 view layouts", () => {
      const layouts = [
        "table", "board", "list", "timeline", "calendar",
        "gallery", "map", "chart", "feed", "form"
      ];

      layouts.forEach(layout => {
        const result = ViewLayoutSchema.safeParse(layout);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid view layouts", () => {
      const result = ViewLayoutSchema.safeParse("kanban");
      expect(result.success).toBe(false);
    });
  });

  describe("FilterOperatorSchema", () => {
    it("should validate all filter operators", () => {
      const operators = [
        "equals", "not_equals", "contains", "not_contains",
        "starts_with", "ends_with", "is_empty", "is_not_empty",
        "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal",
        "before", "after", "on_or_before", "on_or_after",
        "is_checked", "is_not_checked"
      ];

      operators.forEach(operator => {
        const result = FilterOperatorSchema.safeParse(operator);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("PropertySchema", () => {
    it("should validate a valid property", () => {
      const property = {
        key: "name",
        name: "Name",
        type: "title",
        isRequired: true,
        isPrimary: true,
        position: 0,
      };

      const result = validateProperty(property);
      expect(result.success).toBe(true);
    });

    it("should validate property with options", () => {
      const property = {
        key: "status",
        name: "Status",
        type: "select",
        options: {
          choices: ["To Do", "In Progress", "Done"]
        },
        position: 1,
      };

      const result = validateProperty(property);
      expect(result.success).toBe(true);
    });

    it("should reject property without key", () => {
      const property = {
        name: "Name",
        type: "title",
      };

      const result = validateProperty(property);
      expect(result.success).toBe(false);
    });

    it("should reject property without name", () => {
      const property = {
        key: "name",
        type: "title",
      };

      const result = validateProperty(property);
      expect(result.success).toBe(false);
    });

    it("should reject property with invalid type", () => {
      const property = {
        key: "name",
        name: "Name",
        type: "invalid",
      };

      const result = validateProperty(property);
      expect(result.success).toBe(false);
    });
  });

  describe("ViewSchema", () => {
    it("should validate a valid table view", () => {
      const view = {
        name: "All Items",
        layout: "table",
        visibleProps: ["name", "status"],
        filters: [],
        sorts: [],
        isDefault: true,
        position: 0,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });

    it("should validate a board view with groupBy", () => {
      const view = {
        name: "Board by Status",
        layout: "board",
        groupBy: "status",
        options: {
          showEmptyGroups: true,
        },
        position: 1,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });

    // Note: Strict layout-specific validation removed for Phase 1
    // Board views should have groupBy but validation is lenient
    it("should validate board view without strict groupBy check", () => {
      const view = {
        name: "Board",
        layout: "board",
        position: 0,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });

    it("should validate timeline view with start", () => {
      const view = {
        name: "Timeline",
        layout: "timeline",
        options: {
          start: "startDate",
          end: "endDate",
        },
        position: 2,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });

    // Note: Strict layout-specific validation removed for Phase 1
    // Timeline views should have start but validation is lenient
    it("should validate timeline view without strict start check", () => {
      const view = {
        name: "Timeline",
        layout: "timeline",
        position: 0,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });

    it("should validate calendar view with dateProp", () => {
      const view = {
        name: "Calendar",
        layout: "calendar",
        options: {
          dateProp: "date",
        },
        position: 3,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });

    // Note: Strict layout-specific validation removed for Phase 1
    // Calendar views should have dateProp but validation is lenient
    it("should validate calendar view without strict dateProp check", () => {
      const view = {
        name: "Calendar",
        layout: "calendar",
        position: 0,
      };

      const result = validateView(view);
      expect(result.success).toBe(true);
    });
  });

  describe("RowSchema", () => {
    it("should validate a valid row", () => {
      const row = {
        id: "row_1",
        properties: {
          name: "Task 1",
          status: "To Do",
        },
        position: 0,
        createdBy: "user_1",
        createdTime: Date.now(),
      };

      const result = validateRow(row);
      expect(result.success).toBe(true);
    });

    it("should reject row without id", () => {
      const row = {
        properties: {
          name: "Task 1",
        },
      };

      const result = validateRow(row);
      expect(result.success).toBe(false);
    });

    it("should validate row with empty properties", () => {
      const row = {
        id: "row_1",
        properties: {},
      };

      const result = validateRow(row);
      expect(result.success).toBe(true);
    });
  });

  describe("DatabaseSpecSchema", () => {
    it("should validate a complete database spec", () => {
      const dbSpec = {
        id: "db_1",
        name: "Tasks",
        properties: [
          {
            key: "name",
            name: "Name",
            type: "title",
            isPrimary: true,
            position: 0,
          },
        ],
        views: [
          {
            name: "All Items",
            layout: "table",
            isDefault: true,
            position: 0,
          },
        ],
        rows: [],
        settings: {
          showProperties: true,
        },
      };

      const result = DatabaseSpecSchema.safeParse(dbSpec);
      expect(result.success).toBe(true);
    });

    it("should reject database without primary property", () => {
      const dbSpec = {
        id: "db_1",
        name: "Tasks",
        properties: [
          {
            key: "name",
            name: "Name",
            type: "title",
            position: 0,
          },
        ],
        views: [
          {
            name: "All Items",
            layout: "table",
            isDefault: true,
            position: 0,
          },
        ],
        rows: [],
      };

      const result = DatabaseSpecSchema.safeParse(dbSpec);
      expect(result.success).toBe(false);
    });

    it("should reject database with multiple primary properties", () => {
      const dbSpec = {
        id: "db_1",
        name: "Tasks",
        properties: [
          {
            key: "name",
            name: "Name",
            type: "title",
            isPrimary: true,
            position: 0,
          },
          {
            key: "title",
            name: "Title",
            type: "title",
            isPrimary: true,
            position: 1,
          },
        ],
        views: [
          {
            name: "All Items",
            layout: "table",
            isDefault: true,
            position: 0,
          },
        ],
        rows: [],
      };

      const result = DatabaseSpecSchema.safeParse(dbSpec);
      expect(result.success).toBe(false);
    });

    it("should reject database without default view", () => {
      const dbSpec = {
        id: "db_1",
        name: "Tasks",
        properties: [
          {
            key: "name",
            name: "Name",
            type: "title",
            isPrimary: true,
            position: 0,
          },
        ],
        views: [
          {
            name: "All Items",
            layout: "table",
            position: 0,
          },
        ],
        rows: [],
      };

      const result = DatabaseSpecSchema.safeParse(dbSpec);
      expect(result.success).toBe(false);
    });

    it("should reject database with multiple default views", () => {
      const dbSpec = {
        id: "db_1",
        name: "Tasks",
        properties: [
          {
            key: "name",
            name: "Name",
            type: "title",
            isPrimary: true,
            position: 0,
          },
        ],
        views: [
          {
            name: "View 1",
            layout: "table",
            isDefault: true,
            position: 0,
          },
          {
            name: "View 2",
            layout: "board",
            groupBy: "status",
            isDefault: true,
            position: 1,
          },
        ],
        rows: [],
      };

      const result = DatabaseSpecSchema.safeParse(dbSpec);
      expect(result.success).toBe(false);
    });
  });

  describe("UniversalDatabaseSchema", () => {
    it("should validate a complete Universal Database", () => {
      const universalDb = {
        schemaVersion: "2.0",
        db: {
          id: "db_1",
          name: "Tasks",
          description: "Task management",
          properties: [
            {
              key: "name",
              name: "Task Name",
              type: "title",
              isPrimary: true,
              isRequired: true,
              position: 0,
            },
            {
              key: "status",
              name: "Status",
              type: "select",
              options: {
                choices: ["To Do", "In Progress", "Done"],
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
              position: 0,
            },
            {
              name: "Board",
              layout: "board",
              groupBy: "status",
              position: 1,
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

      const result = validateUniversalDatabase(universalDb);
      expect(result.success).toBe(true);
    });

    it("should reject database with wrong schema version", () => {
      const universalDb = {
        schemaVersion: "1.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [],
          views: [],
          rows: [],
        },
      };

      const result = validateUniversalDatabase(universalDb);
      expect(result.success).toBe(false);
    });

    it("should reject database without db field", () => {
      const universalDb = {
        schemaVersion: "2.0",
      };

      const result = validateUniversalDatabase(universalDb);
      expect(result.success).toBe(false);
    });
  });

  describe("validateUniversalDatabase helper", () => {
    it("should return success for valid database", () => {
      const universalDb = {
        schemaVersion: "2.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [
            {
              key: "name",
              name: "Name",
              type: "title",
              isPrimary: true,
              position: 0,
            },
          ],
          views: [
            {
              name: "All Items",
              layout: "table",
              isDefault: true,
              position: 0,
            },
          ],
          rows: [],
        },
      };

      const result = validateUniversalDatabase(universalDb);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });

    it("should return errors for invalid database", () => {
      const universalDb = {
        schemaVersion: "2.0",
        db: {
          id: "db_1",
          name: "Tasks",
          properties: [],
          views: [],
          rows: [],
        },
      };

      const result = validateUniversalDatabase(universalDb);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
