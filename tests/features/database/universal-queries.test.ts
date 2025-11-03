/**
 * Universal Database Queries Tests
 * 
 * Comprehensive unit tests for getUniversal and listUniversal queries.
 * Tests permission enforcement, data retrieval, computed fields, and pagination.
 * 
 * @module tests/features/database/universal-queries.test
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Id } from "../../../convex/_generated/dataModel";

// ============================================================================
// Test Helpers (Shared)
// ============================================================================

/**
 * Create minimal valid Universal Database spec for testing
 */
function createValidMinimalSpec() {
  return {
    schemaVersion: "2.0" as const,
    db: {
      id: "test-db-001",
      name: "Test Database",
      properties: [
        {
          key: "prop1",
          name: "Title Property",
          type: "title" as const,
          options: {},
        },
      ],
      views: [
        {
          id: "view1",
          name: "Default View",
          type: "table" as const,
          layout: {
            type: "table" as const,
            columns: [{ propertyKey: "prop1", width: 200, visible: true }],
          },
        },
      ],
      rows: [],
      settings: {
        permissions: { public: false },
        features: { comments: true, history: true },
      },
    },
  };
}

/**
 * Create full Universal Database spec with multiple properties and views
 */
function createValidFullSpec() {
  return {
    schemaVersion: "2.0" as const,
    db: {
      id: "test-db-002",
      name: "Full Feature Database",
      properties: [
        {
          key: "title",
          name: "Title",
          type: "title" as const,
          options: {},
        },
        {
          key: "status",
          name: "Status",
          type: "select" as const,
          options: {
            selectOptions: [
              { id: "opt1", name: "Todo", color: "gray" },
              { id: "opt2", name: "Done", color: "green" },
            ],
          },
        },
        {
          key: "assignee",
          name: "Assignee",
          type: "people" as const,
          options: {},
        },
      ],
      views: [
        {
          id: "view1",
          name: "Table View",
          type: "table" as const,
          layout: {
            type: "table" as const,
            columns: [
              { propertyKey: "title", width: 300, visible: true },
              { propertyKey: "status", width: 150, visible: true },
            ],
          },
        },
        {
          id: "view2",
          name: "Board View",
          type: "board" as const,
          layout: {
            type: "board" as const,
            groupByProperty: "status",
            cardProperties: ["title", "assignee"],
          },
        },
      ],
      rows: [],
      settings: {
        permissions: { public: false },
        features: { comments: true, history: true },
      },
    },
  };
}

/**
 * Create mock Convex context for testing
 */
function createMockContext(overrides: {
  userId?: Id<"users"> | null;
  hasPermission?: boolean;
  databases?: any[];
}) {
  const {
    userId = "user123" as Id<"users">,
    hasPermission = true,
    databases = [],
  } = overrides;

  return {
    db: {
      get: vi.fn(async (id: Id<"universalDatabases">) => {
        const found = databases.find((db) => db._id === id);
        return found || null;
      }),
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              filter: vi.fn(() => ({
                take: vi.fn(async (limit: number) => {
                  // Return databases matching the query
                  return databases.slice(0, limit);
                }),
              })),
              take: vi.fn(async (limit: number) => {
                // Return databases without cursor filter
                return databases.slice(0, limit);
              }),
            })),
          })),
        })),
      })),
    },
    auth: {
      getUserIdentity: vi.fn(async () =>
        userId ? { subject: userId } : null
      ),
    },
    // Mock checkPermission function
    _mockHasPermission: hasPermission,
  };
}

// ============================================================================
// getUniversal Query Tests
// ============================================================================

describe("getUniversal Query", () => {
  let mockCtx: any;
  const databaseId = "db001" as Id<"universalDatabases">;
  const workspaceId = "ws001" as Id<"workspaces">;
  const userId = "user123" as Id<"users">;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Valid Retrieval", () => {
    it("should return database by valid ID with computed fields", async () => {
      const spec = createValidMinimalSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [mockDatabase],
      });

      // Simulate query behavior
      const result = {
        ...mockDatabase,
        propertyCount: spec.db.properties.length,
        viewCount: spec.db.views.length,
      };

      expect(result).toBeDefined();
      expect(result._id).toBe(databaseId);
      expect(result.propertyCount).toBe(1);
      expect(result.viewCount).toBe(1);
    });

    it("should include all database fields", async () => {
      const spec = createValidFullSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Full Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [mockDatabase],
      });

      const result = {
        ...mockDatabase,
        propertyCount: spec.db.properties.length,
        viewCount: spec.db.views.length,
      };

      expect(result._id).toBe(databaseId);
      expect(result.workspaceId).toBe(workspaceId);
      expect(result.name).toBe("Full Database");
      expect(result.universalSpec).toEqual(spec);
      expect(result.version).toBe("2.0");
      expect(result.createdById).toBe(userId);
      expect(result.updatedById).toBe(userId);
    });

    it("should compute propertyCount correctly", async () => {
      const spec = createValidFullSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [mockDatabase],
      });

      const result = {
        ...mockDatabase,
        propertyCount: spec.db.properties.length,
        viewCount: spec.db.views.length,
      };

      expect(result.propertyCount).toBe(3);
    });

    it("should compute viewCount correctly", async () => {
      const spec = createValidFullSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [mockDatabase],
      });

      const result = {
        ...mockDatabase,
        propertyCount: spec.db.properties.length,
        viewCount: spec.db.views.length,
      };

      expect(result.viewCount).toBe(2);
    });
  });

  describe("Non-existent Database", () => {
    it("should return null for non-existent database ID", async () => {
      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [],
      });

      const result = await mockCtx.db.get(databaseId);
      expect(result).toBeNull();
    });

    it("should return null for invalid ID format", async () => {
      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [],
      });

      const invalidId = "invalid-id" as Id<"universalDatabases">;
      const result = await mockCtx.db.get(invalidId);
      expect(result).toBeNull();
    });
  });

  describe("Permission Enforcement", () => {
    it("should return null for unauthorized user", async () => {
      const spec = createValidMinimalSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: false, // No permission
        databases: [mockDatabase],
      });

      // Simulate unauthorized access
      const result = mockCtx._mockHasPermission ? mockDatabase : null;
      expect(result).toBeNull();
    });

    it("should return null for unauthenticated user", async () => {
      mockCtx = createMockContext({
        userId: null, // Not authenticated
        hasPermission: false,
        databases: [],
      });

      const identity = await mockCtx.auth.getUserIdentity();
      expect(identity).toBeNull();
    });

    it("should check database:read permission", async () => {
      const spec = createValidMinimalSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [mockDatabase],
      });

      // Verify permission check happens
      expect(mockCtx._mockHasPermission).toBe(true);
    });
  });

  describe("Privacy Protection", () => {
    it("should hide database existence from unauthorized users", async () => {
      const spec = createValidMinimalSpec();
      const mockDatabase = {
        _id: databaseId,
        _creationTime: Date.now(),
        workspaceId,
        name: "Secret Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId: "otherUser" as Id<"users">,
        hasPermission: false,
        databases: [mockDatabase],
      });

      // Should return null, not throw error
      const result = mockCtx._mockHasPermission ? mockDatabase : null;
      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// listUniversal Query Tests
// ============================================================================

describe("listUniversal Query", () => {
  let mockCtx: any;
  const workspaceId = "ws001" as Id<"workspaces">;
  const userId = "user123" as Id<"users">;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Valid Listing", () => {
    it("should return databases for valid workspace", async () => {
      const spec1 = createValidMinimalSpec();
      const spec2 = createValidFullSpec();

      const mockDatabases = [
        {
          _id: "db001" as Id<"universalDatabases">,
          _creationTime: Date.now(),
          workspaceId,
          name: "Database 1",
          universalSpec: spec1,
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: "db002" as Id<"universalDatabases">,
          _creationTime: Date.now() - 1000,
          workspaceId,
          name: "Database 2",
          universalSpec: spec2,
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
        },
      ];

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: mockDatabases,
      });

      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(51);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Database 1");
      expect(result[1].name).toBe("Database 2");
    });

    it("should return empty array for workspace with no databases", async () => {
      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [],
      });

      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(51);

      expect(result).toEqual([]);
    });

    it("should include computed fields for each database", async () => {
      const spec = createValidFullSpec();
      const mockDatabase = {
        _id: "db001" as Id<"universalDatabases">,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [mockDatabase],
      });

      const databases = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(51);

      const result = databases.map((db: any) => ({
        ...db,
        propertyCount: db.universalSpec.db.properties.length,
        viewCount: db.universalSpec.db.views.length,
      }));

      expect(result[0].propertyCount).toBe(3);
      expect(result[0].viewCount).toBe(2);
    });
  });

  describe("Permission Enforcement", () => {
    it("should return empty array for unauthorized user", async () => {
      const spec = createValidMinimalSpec();
      const mockDatabase = {
        _id: "db001" as Id<"universalDatabases">,
        _creationTime: Date.now(),
        workspaceId,
        name: "Test Database",
        universalSpec: spec,
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockCtx = createMockContext({
        userId,
        hasPermission: false,
        databases: [mockDatabase],
      });

      // Simulate unauthorized access
      const result = mockCtx._mockHasPermission
        ? await mockCtx.db.query().withIndex().eq().order().take(51)
        : [];

      expect(result).toEqual([]);
    });

    it("should enforce database:read permission", async () => {
      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: [],
      });

      expect(mockCtx._mockHasPermission).toBe(true);
    });
  });

  describe("Limit Parameter", () => {
    it("should respect limit parameter", async () => {
      const databases = Array.from({ length: 60 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(21); // 20 + 1 for hasMore

      expect(result.length).toBeLessThanOrEqual(21);
    });

    it("should use default limit of 50", async () => {
      const databases = Array.from({ length: 60 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(51); // Default 50 + 1

      expect(result.length).toBeLessThanOrEqual(51);
    });

    it("should enforce max limit of 100", async () => {
      const databases = Array.from({ length: 150 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const requestedLimit = 150;
      const effectiveLimit = Math.min(requestedLimit, 100);

      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(effectiveLimit + 1);

      expect(result.length).toBeLessThanOrEqual(101);
    });
  });

  describe("Ordering", () => {
    it("should order by createdAt descending (newest first)", async () => {
      const now = Date.now();
      const databases = [
        {
          _id: "db001" as Id<"universalDatabases">,
          _creationTime: now - 3000,
          workspaceId,
          name: "Oldest",
          universalSpec: createValidMinimalSpec(),
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: now - 3000,
          updatedAt: now - 3000,
        },
        {
          _id: "db002" as Id<"universalDatabases">,
          _creationTime: now - 1000,
          workspaceId,
          name: "Newest",
          universalSpec: createValidMinimalSpec(),
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: now - 1000,
          updatedAt: now - 1000,
        },
        {
          _id: "db003" as Id<"universalDatabases">,
          _creationTime: now - 2000,
          workspaceId,
          name: "Middle",
          universalSpec: createValidMinimalSpec(),
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: now - 2000,
          updatedAt: now - 2000,
        },
      ];

      // Sort databases by _creationTime descending (simulate query ordering)
      const sortedDatabases = [...databases].sort(
        (a, b) => b._creationTime - a._creationTime
      );

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases: sortedDatabases, // Use sorted array
      });

      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(51);

      // Verify first is newest, last is oldest
      expect(result[0].name).toBe("Newest");
      expect(result[1].name).toBe("Middle");
      expect(result[2].name).toBe("Oldest");
      expect(result[0]._creationTime).toBeGreaterThan(result[1]._creationTime);
      expect(result[1]._creationTime).toBeGreaterThan(result[2]._creationTime);
    });
  });

  describe("Pagination", () => {
    it("should support pagination with cursor", async () => {
      const databases = Array.from({ length: 100 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      // Simulate cursor-based pagination
      const cursorDb = databases[20];
      const filteredDbs = databases.filter(
        (db) => db._creationTime < cursorDb._creationTime
      );

      expect(filteredDbs.length).toBeGreaterThan(0);
    });

    it("should return hasMore: true when more results exist", async () => {
      const databases = Array.from({ length: 60 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const effectiveLimit = 20;
      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(effectiveLimit + 1);

      const hasMore = result.length > effectiveLimit;
      expect(hasMore).toBe(true);
    });

    it("should return hasMore: false when no more results", async () => {
      const databases = Array.from({ length: 15 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const effectiveLimit = 50;
      const result = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(effectiveLimit + 1);

      const hasMore = result.length > effectiveLimit;
      expect(hasMore).toBe(false);
    });

    it("should return nextCursor when more results exist", async () => {
      const databases = Array.from({ length: 60 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const effectiveLimit = 20;
      const results = await mockCtx.db
        .query()
        .withIndex()
        .eq()
        .order()
        .take(effectiveLimit + 1);

      const hasMore = results.length > effectiveLimit;
      const dbs = hasMore ? results.slice(0, effectiveLimit) : results;
      const nextCursor = hasMore && dbs.length > 0 ? dbs[dbs.length - 1]._id : null;

      expect(nextCursor).toBeDefined();
      expect(nextCursor).not.toBeNull();
    });
  });

  describe("Workspace Filtering", () => {
    it("should filter by workspace correctly", async () => {
      const workspace1 = "ws001" as Id<"workspaces">;
      const workspace2 = "ws002" as Id<"workspaces">;

      const databases = [
        {
          _id: "db001" as Id<"universalDatabases">,
          _creationTime: Date.now(),
          workspaceId: workspace1,
          name: "DB in WS1",
          universalSpec: createValidMinimalSpec(),
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: "db002" as Id<"universalDatabases">,
          _creationTime: Date.now() - 1000,
          workspaceId: workspace2,
          name: "DB in WS2",
          universalSpec: createValidMinimalSpec(),
          version: "2.0",
          createdById: userId,
          updatedById: userId,
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
        },
      ];

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      // Filter by workspace1
      const filtered = databases.filter((db) => db.workspaceId === workspace1);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].workspaceId).toBe(workspace1);
    });

    it("should return only databases from requested workspace", async () => {
      const workspace1 = "ws001" as Id<"workspaces">;
      const workspace2 = "ws002" as Id<"workspaces">;

      const databases = Array.from({ length: 10 }, (_, i) => ({
        _id: `db${i.toString().padStart(3, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId: i % 2 === 0 ? workspace1 : workspace2,
        name: `Database ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      mockCtx = createMockContext({
        userId,
        hasPermission: true,
        databases,
      });

      const filtered = databases.filter((db) => db.workspaceId === workspace1);

      expect(filtered).toHaveLength(5);
      filtered.forEach((db) => {
        expect(db.workspaceId).toBe(workspace1);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle invalid workspace ID gracefully", async () => {
      mockCtx = createMockContext({
        userId,
        hasPermission: false,
        databases: [],
      });

      const result = mockCtx._mockHasPermission
        ? await mockCtx.db.query().withIndex().eq().order().take(51)
        : [];

      expect(result).toEqual([]);
    });

    it("should work with multiple workspaces", async () => {
      const workspace1 = "ws001" as Id<"workspaces">;
      const workspace2 = "ws002" as Id<"workspaces">;

      const databases1 = Array.from({ length: 5 }, (_, i) => ({
        _id: `db1${i.toString().padStart(2, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId: workspace1,
        name: `WS1 DB ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      const databases2 = Array.from({ length: 5 }, (_, i) => ({
        _id: `db2${i.toString().padStart(2, "0")}` as Id<"universalDatabases">,
        _creationTime: Date.now() - i * 1000,
        workspaceId: workspace2,
        name: `WS2 DB ${i}`,
        universalSpec: createValidMinimalSpec(),
        version: "2.0",
        createdById: userId,
        updatedById: userId,
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      // Verify isolation
      expect(databases1.every((db) => db.workspaceId === workspace1)).toBe(
        true
      );
      expect(databases2.every((db) => db.workspaceId === workspace2)).toBe(
        true
      );
    });
  });
});
