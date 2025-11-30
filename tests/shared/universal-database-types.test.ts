/**
 * Universal Database Types Tests
 * Tests for type guards and type utilities
 */

import { describe, it, expect } from "vitest";
import {
  isPropertyType,
  isViewLayout,
  isFilterOperator,
  PropertyTypeCategories,
  ViewLayoutCategories,
} from "@/frontend/shared/foundation/types/universal-database";

describe("Universal Database Type Guards", () => {
  describe("isPropertyType", () => {
    it("should validate core property types", () => {
      expect(isPropertyType("title")).toBe(true);
      expect(isPropertyType("text")).toBe(true);
      expect(isPropertyType("number")).toBe(true);
      expect(isPropertyType("select")).toBe(true);
      expect(isPropertyType("multi_select")).toBe(true);
      expect(isPropertyType("date")).toBe(true);
      expect(isPropertyType("people")).toBe(true);
      expect(isPropertyType("files")).toBe(true);
      expect(isPropertyType("checkbox")).toBe(true);
      expect(isPropertyType("url")).toBe(true);
      expect(isPropertyType("email")).toBe(true);
      expect(isPropertyType("relation")).toBe(true);
      expect(isPropertyType("rollup")).toBe(true);
      expect(isPropertyType("formula")).toBe(true);
    });

    it("should validate extended property types", () => {
      expect(isPropertyType("status")).toBe(true);
      expect(isPropertyType("phone")).toBe(true);
      expect(isPropertyType("button")).toBe(true);
      expect(isPropertyType("unique_id")).toBe(true);
      expect(isPropertyType("place")).toBe(true);
    });

    it("should validate auto property types", () => {
      expect(isPropertyType("created_time")).toBe(true);
      expect(isPropertyType("created_by")).toBe(true);
      expect(isPropertyType("last_edited_time")).toBe(true);
      expect(isPropertyType("last_edited_by")).toBe(true);
    });

    it("should reject invalid property types", () => {
      expect(isPropertyType("invalid")).toBe(false);
      expect(isPropertyType("")).toBe(false);
      expect(isPropertyType("rich_text")).toBe(false); // V1 type, not Universal (uses "text")
    });
  });

  describe("isViewLayout", () => {
    it("should validate existing view layouts", () => {
      expect(isViewLayout("table")).toBe(true);
      expect(isViewLayout("board")).toBe(true);
      expect(isViewLayout("list")).toBe(true);
      expect(isViewLayout("timeline")).toBe(true);
      expect(isViewLayout("calendar")).toBe(true);
    });

    it("should validate new view layouts", () => {
      expect(isViewLayout("gallery")).toBe(true);
      expect(isViewLayout("map")).toBe(true);
      expect(isViewLayout("chart")).toBe(true);
      expect(isViewLayout("feed")).toBe(true);
      expect(isViewLayout("form")).toBe(true);
    });

    it("should reject invalid view layouts", () => {
      expect(isViewLayout("invalid")).toBe(false);
      expect(isViewLayout("")).toBe(false);
      expect(isViewLayout("kanban")).toBe(false);
    });
  });

  describe("isFilterOperator", () => {
    it("should validate equality operators", () => {
      expect(isFilterOperator("equals")).toBe(true);
      expect(isFilterOperator("not_equals")).toBe(true);
    });

    it("should validate text operators", () => {
      expect(isFilterOperator("contains")).toBe(true);
      expect(isFilterOperator("not_contains")).toBe(true);
      expect(isFilterOperator("starts_with")).toBe(true);
      expect(isFilterOperator("ends_with")).toBe(true);
    });

    it("should validate empty operators", () => {
      expect(isFilterOperator("is_empty")).toBe(true);
      expect(isFilterOperator("is_not_empty")).toBe(true);
    });

    it("should validate numeric operators", () => {
      expect(isFilterOperator("greater_than")).toBe(true);
      expect(isFilterOperator("less_than")).toBe(true);
      expect(isFilterOperator("greater_than_or_equal")).toBe(true);
      expect(isFilterOperator("less_than_or_equal")).toBe(true);
    });

    it("should validate date operators", () => {
      expect(isFilterOperator("before")).toBe(true);
      expect(isFilterOperator("after")).toBe(true);
      expect(isFilterOperator("on_or_before")).toBe(true);
      expect(isFilterOperator("on_or_after")).toBe(true);
    });

    it("should validate checkbox operators", () => {
      expect(isFilterOperator("is_checked")).toBe(true);
      expect(isFilterOperator("is_not_checked")).toBe(true);
    });

    it("should reject invalid operators", () => {
      expect(isFilterOperator("invalid")).toBe(false);
      expect(isFilterOperator("")).toBe(false);
    });
  });

  describe("PropertyTypeCategories", () => {
    it("should have correct core property count", () => {
      expect(PropertyTypeCategories.core).toHaveLength(14);
    });

    it("should have correct extended property count", () => {
      expect(PropertyTypeCategories.extended).toHaveLength(5);
    });

    it("should have correct auto property count", () => {
      expect(PropertyTypeCategories.auto).toHaveLength(4);
    });

    it("should have total of 23 property types", () => {
      const total =
        PropertyTypeCategories.core.length +
        PropertyTypeCategories.extended.length +
        PropertyTypeCategories.auto.length;
      // Note: Spec says 21 but actually lists 23 (14 core + 5 extended + 4 auto)
      expect(total).toBe(23);
    });
  });

  describe("ViewLayoutCategories", () => {
    it("should have correct existing view count", () => {
      expect(ViewLayoutCategories.existing).toHaveLength(5);
    });

    it("should have correct new view count", () => {
      expect(ViewLayoutCategories.new).toHaveLength(5);
    });

    it("should have total of 10 view layouts", () => {
      const total = ViewLayoutCategories.existing.length + ViewLayoutCategories.new.length;
      expect(total).toBe(10);
    });
  });
});
