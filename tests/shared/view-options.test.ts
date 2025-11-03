/**
 * View Options Types Tests
 *
 * Unit tests for view option type definitions.
 * Tests validate type safety, structure, and edge cases.
 *
 * @module tests/shared/view-options
 */

import { describe, it, expect } from "vitest";
import type {
  TableOptions,
  BoardOptions,
  ListOptions,
  TimelineOptions,
  CalendarOptions,
  GalleryOptions,
  GalleryCard,
  MapOptions,
  MapMarker,
  ChartOptions,
  FeedOptions,
  FeedCard,
  FormOptions,
  FormField,
  FormSection,
  ViewOptions,
} from "@/frontend/shared/foundation/types/view-options";

describe("View Options Types", () => {
  describe("TableOptions", () => {
    it("should accept valid table options with all fields", () => {
      const options: TableOptions = {
        showRowNumbers: true,
        rowHeight: "compact",
        wrapCells: false,
        showCalculations: true,
        columnWidths: { name: 200, status: 120 },
        frozenColumns: 1,
      };
      expect(options).toBeDefined();
      expect(options.showRowNumbers).toBe(true);
      expect(options.rowHeight).toBe("compact");
    });

    it("should accept default row height", () => {
      const options: TableOptions = {
        rowHeight: "default",
      };
      expect(options).toBeDefined();
      expect(options.rowHeight).toBe("default");
    });

    it("should accept tall row height", () => {
      const options: TableOptions = {
        rowHeight: "tall",
      };
      expect(options).toBeDefined();
      expect(options.rowHeight).toBe("tall");
    });

    it("should accept minimal configuration", () => {
      const options: TableOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe("BoardOptions", () => {
    it("should accept valid board options with all fields", () => {
      const options: BoardOptions = {
        cardCoverProperty: "thumbnail",
        cardPreviewProperties: ["assignee", "dueDate"],
        showEmptyGroups: true,
        groupByProperty: "status",
        subGroupByProperty: "priority",
      };
      expect(options).toBeDefined();
      expect(options.groupByProperty).toBe("status");
      expect(options.cardPreviewProperties).toHaveLength(2);
    });

    it("should accept minimal configuration", () => {
      const options: BoardOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe("ListOptions", () => {
    it("should accept valid list options", () => {
      const options: ListOptions = {
        showIcon: true,
        previewProperties: ["status", "assignee", "dueDate"],
        compact: false,
        groupByProperty: "category",
      };
      expect(options).toBeDefined();
      expect(options.showIcon).toBe(true);
      expect(options.previewProperties).toHaveLength(3);
    });

    it("should accept minimal configuration", () => {
      const options: ListOptions = {};
      expect(options).toBeDefined();
    });
  });

  describe("TimelineOptions", () => {
    it("should accept valid timeline options with required startDateProperty", () => {
      const options: TimelineOptions = {
        startDateProperty: "startDate",
        endDateProperty: "endDate",
        zoom: "month",
        showWeekends: true,
      };
      expect(options).toBeDefined();
      expect(options.startDateProperty).toBe("startDate");
      expect(options.zoom).toBe("month");
    });

    it("should accept timeline without end date", () => {
      const options: TimelineOptions = {
        startDateProperty: "createdAt",
      };
      expect(options).toBeDefined();
      expect(options.endDateProperty).toBeUndefined();
    });
  });

  describe("CalendarOptions", () => {
    it("should accept valid calendar options with required dateProperty", () => {
      const options: CalendarOptions = {
        dateProperty: "dueDate",
        defaultView: "month",
        firstDayOfWeek: 0,
        showWeekNumbers: true,
      };
      expect(options).toBeDefined();
      expect(options.dateProperty).toBe("dueDate");
      expect(options.defaultView).toBe("month");
    });

    it("should accept week default view", () => {
      const options: CalendarOptions = {
        dateProperty: "date",
        defaultView: "week",
      };
      expect(options).toBeDefined();
      expect(options.defaultView).toBe("week");
    });
  });

  describe("GalleryOptions", () => {
    it("should accept valid gallery options with required card", () => {
      const card: GalleryCard = {
        coverProperty: "image",
        coverFit: "cover",
        coverAspectRatio: "16:9",
        properties: ["title", "description"],
      };
      const options: GalleryOptions = {
        card,
        cardsPerRow: 3,
        cardSize: "medium",
      };
      expect(options).toBeDefined();
      expect(options.card.coverProperty).toBe("image");
      expect(options.cardSize).toBe("medium");
    });

    it("should accept minimal gallery with empty card", () => {
      const options: GalleryOptions = {
        card: {},
      };
      expect(options).toBeDefined();
    });
  });

  describe("MapOptions", () => {
    it("should accept valid map options with required fields", () => {
      const marker: MapMarker = {
        titleProperty: "name",
        colorProperty: "status",
        showPopup: true,
      };
      const options: MapOptions = {
        locationProperty: "address",
        marker,
        defaultCenter: { lat: 40.7128, lng: -74.0060 },
        defaultZoom: 12,
        clusterMarkers: true,
      };
      expect(options).toBeDefined();
      expect(options.locationProperty).toBe("address");
      expect(options.defaultZoom).toBe(12);
    });

    it("should accept minimal map with empty marker", () => {
      const options: MapOptions = {
        locationProperty: "location",
        marker: {},
      };
      expect(options).toBeDefined();
    });
  });

  describe("ChartOptions", () => {
    it("should accept valid bar chart options with required fields", () => {
      const options: ChartOptions = {
        type: "bar",
        xAxisProperty: "month",
        yAxisProperty: "sales",
        aggregation: "sum",
        showLegend: true,
      };
      expect(options).toBeDefined();
      expect(options.type).toBe("bar");
      expect(options.aggregation).toBe("sum");
    });

    it("should accept line chart", () => {
      const options: ChartOptions = {
        type: "line",
        xAxisProperty: "date",
        yAxisProperty: "value",
      };
      expect(options).toBeDefined();
      expect(options.type).toBe("line");
    });

    it("should accept pie chart", () => {
      const options: ChartOptions = {
        type: "pie",
        xAxisProperty: "category",
        yAxisProperty: "count",
      };
      expect(options).toBeDefined();
      expect(options.type).toBe("pie");
    });
  });

  describe("FeedOptions", () => {
    it("should accept valid feed options with required fields", () => {
      const card: FeedCard = {
        showAvatar: true,
        avatarProperty: "author",
        titleProperty: "title",
        contentProperty: "body",
        dateProperty: "createdAt",
      };
      const options: FeedOptions = {
        card,
        sortByProperty: "createdAt",
        sortDirection: "descending",
      };
      expect(options).toBeDefined();
      expect(options.sortByProperty).toBe("createdAt");
      expect(options.sortDirection).toBe("descending");
    });

    it("should accept ascending sort", () => {
      const options: FeedOptions = {
        card: {},
        sortByProperty: "updatedAt",
        sortDirection: "ascending",
      };
      expect(options).toBeDefined();
      expect(options.sortDirection).toBe("ascending");
    });
  });

  describe("FormOptions", () => {
    it("should accept valid form options with all fields", () => {
      const field: FormField = {
        propertyKey: "email",
        label: "Email Address",
        required: true,
      };
      const section: FormSection = {
        title: "Contact Info",
        fields: [field],
      };
      const options: FormOptions = {
        title: "Contact Form",
        description: "Fill out the form below",
        submitButtonText: "Submit",
        sections: [section],
      };
      expect(options).toBeDefined();
      expect(options.title).toBe("Contact Form");
      expect(options.sections).toHaveLength(1);
    });

    it("should accept minimal form configuration", () => {
      const options: FormOptions = {
        title: "Simple Form",
        sections: [],
      };
      expect(options).toBeDefined();
    });
  });

  describe("ViewOptions Union", () => {
    it("should accept any valid view option type", () => {
      const tableOpt: ViewOptions = { showRowNumbers: true };
      const boardOpt: ViewOptions = { groupByProperty: "status" };
      const listOpt: ViewOptions = { showIcon: true };

      expect(tableOpt).toBeDefined();
      expect(boardOpt).toBeDefined();
      expect(listOpt).toBeDefined();
    });

    it("should accept generic record for extensibility", () => {
      const customOpt: ViewOptions = { customSetting: "value" };
      expect(customOpt).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero frozen columns", () => {
      const options: TableOptions = {
        frozenColumns: 0,
      };
      expect(options).toBeDefined();
      expect(options.frozenColumns).toBe(0);
    });

    it("should handle empty preview properties", () => {
      const options: ListOptions = {
        previewProperties: [],
      };
      expect(options).toBeDefined();
      expect(options.previewProperties).toHaveLength(0);
    });

    it("should handle chart with count aggregation", () => {
      const options: ChartOptions = {
        type: "bar",
        xAxisProperty: "status",
        yAxisProperty: "count",
        aggregation: "count",
      };
      expect(options).toBeDefined();
      expect(options.aggregation).toBe("count");
    });

    it("should handle gallery with large cards per row", () => {
      const options: GalleryOptions = {
        card: {},
        cardsPerRow: 10,
      };
      expect(options).toBeDefined();
      expect(options.cardsPerRow).toBe(10);
    });

    it("should handle map with high zoom level", () => {
      const options: MapOptions = {
        locationProperty: "place",
        marker: {},
        defaultZoom: 20,
      };
      expect(options).toBeDefined();
      expect(options.defaultZoom).toBe(20);
    });
  });
});
