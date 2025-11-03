/**
 * Property Options Types Tests
 *
 * Unit tests for property option type definitions.
 * Tests validate type safety, structure, and edge cases.
 *
 * @module tests/shared/property-options
 */

import { describe, it, expect } from "vitest";
import type {
  NumberOptions,
  SelectOptions,
  SelectChoice,
  StatusOptions,
  StatusGroup,
  StatusChoice,
  DateOptions,
  PeopleOptions,
  FilesOptions,
  RelationOptions,
  RollupOptions,
  ButtonOptions,
  PlaceOptions,
  FormulaOptions,
  PropertyOptions,
} from "@/frontend/shared/foundation/types/property-options";

describe("Property Options Types", () => {
  describe("NumberOptions", () => {
    it("should accept valid number options with all fields", () => {
      const options: NumberOptions = {
        format: "number",
        decimals: 2,
        min: 0,
        max: 100,
      };
      expect(options).toBeDefined();
      expect(options.format).toBe("number");
      expect(options.decimals).toBe(2);
    });

    it("should accept currency format with currency code", () => {
      const options: NumberOptions = {
        format: "currency",
        currency: "USD",
        decimals: 2,
      };
      expect(options).toBeDefined();
      expect(options.currency).toBe("USD");
    });

    it("should accept percent format", () => {
      const options: NumberOptions = {
        format: "percent",
        decimals: 1,
      };
      expect(options).toBeDefined();
      expect(options.format).toBe("percent");
    });

    it("should accept minimal configuration", () => {
      const options: NumberOptions = {
        format: "number",
      };
      expect(options).toBeDefined();
    });
  });

  describe("SelectOptions", () => {
    it("should accept valid select options with choices", () => {
      const choice: SelectChoice = {
        id: "choice-1",
        name: "Choice 1",
        color: "#ff0000",
        icon: "🔥",
      };
      const options: SelectOptions = {
        choices: [choice],
        allowCreate: true,
      };
      expect(options).toBeDefined();
      expect(options.choices).toHaveLength(1);
      expect(options.allowCreate).toBe(true);
    });

    it("should accept choices without optional fields", () => {
      const choice: SelectChoice = {
        name: "Simple Choice",
      };
      const options: SelectOptions = {
        choices: [choice],
      };
      expect(options).toBeDefined();
      expect(options.choices[0].name).toBe("Simple Choice");
    });

    it("should accept multiple choices", () => {
      const options: SelectOptions = {
        choices: [
          { name: "Option 1", color: "#blue" },
          { name: "Option 2", color: "#red" },
          { name: "Option 3", color: "#green" },
        ],
      };
      expect(options.choices).toHaveLength(3);
    });
  });

  describe("StatusOptions", () => {
    it("should accept valid status options with groups and choices", () => {
      const group: StatusGroup = {
        id: "in-progress",
        name: "In Progress",
        color: "#yellow",
      };
      const choice: StatusChoice = {
        id: "status-wip",
        name: "Work in Progress",
        color: "#ffaa00",
        groupId: "in-progress",
      };
      const options: StatusOptions = {
        groups: [group],
        choices: [choice],
        defaultStatusId: "status-wip",
      };
      expect(options).toBeDefined();
      expect(options.groups).toHaveLength(1);
      expect(options.choices).toHaveLength(1);
      expect(options.defaultStatusId).toBe("status-wip");
    });

    it("should accept status with multiple groups", () => {
      const options: StatusOptions = {
        groups: [
          { id: "todo", name: "To Do" },
          { id: "doing", name: "Doing" },
          { id: "done", name: "Done" },
        ],
        choices: [
          { id: "new", name: "New", groupId: "todo" },
          { id: "completed", name: "Completed", groupId: "done" },
        ],
      };
      expect(options.groups).toHaveLength(3);
      expect(options.choices).toHaveLength(2);
    });
  });

  describe("DateOptions", () => {
    it("should accept valid date options with all fields", () => {
      const options: DateOptions = {
        format: "month_day_year",
        includeTime: true,
        timeFormat: "12h",
        supportRange: false,
        defaultToday: true,
      };
      expect(options).toBeDefined();
      expect(options.format).toBe("month_day_year");
      expect(options.includeTime).toBe(true);
      expect(options.timeFormat).toBe("12h");
    });

    it("should accept relative date format", () => {
      const options: DateOptions = {
        format: "relative",
      };
      expect(options).toBeDefined();
      expect(options.format).toBe("relative");
    });

    it("should accept 24h time format", () => {
      const options: DateOptions = {
        format: "full",
        includeTime: true,
        timeFormat: "24h",
      };
      expect(options.timeFormat).toBe("24h");
    });
  });

  describe("PeopleOptions", () => {
    it("should accept valid people options", () => {
      const options: PeopleOptions = {
        allowMultiple: true,
        restrictToRoles: ["admin", "editor"],
        showAvatars: true,
        notifyOnAssign: true,
      };
      expect(options).toBeDefined();
      expect(options.allowMultiple).toBe(true);
      expect(options.restrictToRoles).toHaveLength(2);
    });

    it("should accept single user configuration", () => {
      const options: PeopleOptions = {
        allowMultiple: false,
        showAvatars: true,
      };
      expect(options.allowMultiple).toBe(false);
    });

    it("should accept minimal configuration", () => {
      const options: PeopleOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe("FilesOptions", () => {
    it("should accept valid files options", () => {
      const options: FilesOptions = {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/png", "image/jpeg", "application/pdf"],
        maxFiles: 5,
        showThumbnails: true,
      };
      expect(options).toBeDefined();
      expect(options.maxSize).toBe(10 * 1024 * 1024);
      expect(options.allowedTypes).toHaveLength(3);
      expect(options.maxFiles).toBe(5);
    });

    it("should accept unlimited file size", () => {
      const options: FilesOptions = {
        allowedTypes: ["image/*"],
      };
      expect(options).toBeDefined();
      expect(options.maxSize).toBeUndefined();
    });
  });

  describe("RelationOptions", () => {
    it("should accept valid relation options", () => {
      const options: RelationOptions = {
        targetDatabaseId: "db_projects",
        displayProperty: "title",
        allowMultiple: true,
        bidirectional: true,
        reversePropertyKey: "tasks",
      };
      expect(options).toBeDefined();
      expect(options.targetDatabaseId).toBe("db_projects");
      expect(options.bidirectional).toBe(true);
    });

    it("should accept minimal relation configuration", () => {
      const options: RelationOptions = {
        targetDatabaseId: "db_users",
      };
      expect(options).toBeDefined();
      expect(options.targetDatabaseId).toBe("db_users");
    });

    it("should accept single relation", () => {
      const options: RelationOptions = {
        targetDatabaseId: "db_parent",
        allowMultiple: false,
      };
      expect(options.allowMultiple).toBe(false);
    });
  });

  describe("RollupOptions", () => {
    it("should accept valid rollup options", () => {
      const options: RollupOptions = {
        relationPropertyKey: "tasks",
        targetPropertyKey: "progress",
        function: "average",
        asPercent: true,
      };
      expect(options).toBeDefined();
      expect(options.function).toBe("average");
      expect(options.asPercent).toBe(true);
    });

    it("should accept count aggregation", () => {
      const options: RollupOptions = {
        relationPropertyKey: "items",
        targetPropertyKey: "id",
        function: "count",
      };
      expect(options.function).toBe("count");
    });

    it("should accept all aggregation functions", () => {
      const functions = ["count", "sum", "average", "min", "max", "range", "unique", "show_original"] as const;
      functions.forEach((fn) => {
        const options: RollupOptions = {
          relationPropertyKey: "rel",
          targetPropertyKey: "prop",
          function: fn,
        };
        expect(options.function).toBe(fn);
      });
    });
  });

  describe("ButtonOptions", () => {
    it("should accept valid button options", () => {
      const options: ButtonOptions = {
        label: "Submit Form",
        action: "create",
        message: "Form submitted successfully!",
        color: "#0066ff",
        icon: "✓",
      };
      expect(options).toBeDefined();
      expect(options.label).toBe("Submit Form");
      expect(options.action).toBe("create");
    });

    it("should accept redirect action with URL", () => {
      const options: ButtonOptions = {
        label: "Go to Dashboard",
        action: "redirect",
        redirect: "/dashboard",
      };
      expect(options.action).toBe("redirect");
      expect(options.redirect).toBe("/dashboard");
    });

    it("should accept update action", () => {
      const options: ButtonOptions = {
        label: "Update",
        action: "update",
      };
      expect(options.action).toBe("update");
    });
  });

  describe("PlaceOptions", () => {
    it("should accept valid place options", () => {
      const options: PlaceOptions = {
        defaultZoom: 12,
        showFullAddress: true,
        provider: "google",
      };
      expect(options).toBeDefined();
      expect(options.defaultZoom).toBe(12);
      expect(options.provider).toBe("google");
    });

    it("should accept different map providers", () => {
      const providers = ["google", "openstreetmap", "mapbox"] as const;
      providers.forEach((provider) => {
        const options: PlaceOptions = {
          provider,
        };
        expect(options.provider).toBe(provider);
      });
    });

    it("should accept minimal configuration", () => {
      const options: PlaceOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe("FormulaOptions", () => {
    it("should accept valid formula options", () => {
      const options: FormulaOptions = {
        expression: "prop('price') * prop('quantity')",
        returnType: "number",
        numberFormat: {
          format: "currency",
          currency: "USD",
          decimals: 2,
        },
      };
      expect(options).toBeDefined();
      expect(options.returnType).toBe("number");
      expect(options.numberFormat).toBeDefined();
    });

    it("should accept text return type", () => {
      const options: FormulaOptions = {
        expression: "concat(prop('firstName'), ' ', prop('lastName'))",
        returnType: "text",
      };
      expect(options.returnType).toBe("text");
    });

    it("should accept boolean return type", () => {
      const options: FormulaOptions = {
        expression: "prop('completed') === true",
        returnType: "boolean",
      };
      expect(options.returnType).toBe("boolean");
    });

    it("should accept date return type with format", () => {
      const options: FormulaOptions = {
        expression: "addDays(prop('startDate'), 7)",
        returnType: "date",
        dateFormat: {
          format: "month_day_year",
          includeTime: false,
        },
      };
      expect(options.returnType).toBe("date");
      expect(options.dateFormat).toBeDefined();
    });
  });

  describe("PropertyOptions Union Type", () => {
    it("should accept any valid property option type", () => {
      const numberOptions: PropertyOptions = { format: "number" } as NumberOptions;
      const selectOptions: PropertyOptions = { choices: [] } as SelectOptions;
      const dateOptions: PropertyOptions = { format: "relative" } as DateOptions;

      expect(numberOptions).toBeDefined();
      expect(selectOptions).toBeDefined();
      expect(dateOptions).toBeDefined();
    });

    it("should accept generic record for extensibility", () => {
      const customOptions: PropertyOptions = {
        customField: "value",
        anotherField: 123,
      };
      expect(customOptions).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty select choices array", () => {
      const options: SelectOptions = {
        choices: [],
      };
      expect(options.choices).toHaveLength(0);
    });

    it("should handle zero decimals in number options", () => {
      const options: NumberOptions = {
        format: "number",
        decimals: 0,
      };
      expect(options.decimals).toBe(0);
    });

    it("should handle negative min/max values", () => {
      const options: NumberOptions = {
        format: "number",
        min: -100,
        max: -10,
      };
      expect(options.min).toBe(-100);
      expect(options.max).toBe(-10);
    });

    it("should handle very large file sizes", () => {
      const options: FilesOptions = {
        maxSize: 1024 * 1024 * 1024, // 1GB
      };
      expect(options.maxSize).toBe(1024 * 1024 * 1024);
    });

    it("should handle complex formula expressions", () => {
      const options: FormulaOptions = {
        expression: "if(prop('status') === 'done', prop('completedDate'), prop('dueDate'))",
        returnType: "date",
      };
      expect(options.expression).toContain("if(");
    });

    it("should handle status without groups", () => {
      const options: StatusOptions = {
        groups: [],
        choices: [
          { id: "status-1", name: "Status 1" },
        ],
      };
      expect(options.groups).toHaveLength(0);
      expect(options.choices).toHaveLength(1);
    });

    it("should handle multiple currency types", () => {
      const currencies = ["USD", "EUR", "IDR", "SGD", "GBP", "JPY", "CNY"] as const;
      currencies.forEach((currency) => {
        const options: NumberOptions = {
          format: "currency",
          currency,
        };
        expect(options.currency).toBe(currency);
      });
    });
  });
});
