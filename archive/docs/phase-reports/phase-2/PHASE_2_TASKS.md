# Phase 2: Backend Mutations & Queries - Task Instructions

**Phase:** Phase 2 (Week 3-4)  
**Focus:** Convex backend implementation for Universal Database  
**Duration:** 2 weeks  
**Prerequisites:** Phase 1 Complete ✅

---

## Overview

Phase 2 implements the Convex backend layer for Universal Database v2.0. This includes CRUD mutations and queries that work with the `universalDatabases` table created in Phase 1.

**Key Requirements:**
- ✅ Use mutation template from Week 0 (`convex/templates/mutation_template.ts.example`)
- ✅ Enforce RBAC with `requirePermission()`
- ✅ Log all operations with `logAudit()`
- ✅ Validate with Zod schemas from Phase 1
- ✅ Support both V1 and Universal formats (conversion layer)
- ✅ Maintain workspace isolation
- ✅ Write comprehensive tests (20+ per task)

---

## Task 2.1: Create Universal Database Mutation

**File:** `convex/features/database/mutations/createUniversal.ts`  
**Lines:** ~200  
**Tests:** 20+  
**Priority:** HIGH

### Requirements

Create a Convex mutation that creates a new Universal Database in a workspace.

### Function Signature

```typescript
/**
 * Create a new Universal Database
 * 
 * @param ctx - Convex mutation context
 * @param args - Creation arguments
 * @returns The created database ID
 */
export const createUniversal = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    universalSpec: v.any(), // Universal Database JSON
    version: v.optional(v.string()), // Default: "2.0"
  },
  handler: async (ctx, args) => {
    // Implementation here
  },
});
```

### Implementation Steps

1. **Permission Check**
   ```typescript
   await requirePermission(ctx, args.workspaceId, "database:create");
   ```

2. **Input Validation**
   - Validate `universalSpec` against `UniversalDatabaseSchema` from Phase 1
   - Ensure at least 1 property exists
   - Ensure at least 1 view exists
   - Validate unique property keys
   - Check for duplicate database names in workspace

3. **Database Creation**
   - Insert into `universalDatabases` table
   - Set default version to "2.0" if not provided
   - Add audit fields (createdById, createdAt, updatedById, updatedAt)
   - Return the created database `_id`

4. **Audit Logging**
   ```typescript
   await logAudit(ctx, {
     action: "database.create",
     workspaceId: args.workspaceId,
     resourceType: "universal_database",
     resourceId: databaseId,
     metadata: {
       name: args.name,
       propertyCount: universalSpec.properties.length,
       viewCount: universalSpec.views.length,
     },
   });
   ```

5. **Error Handling**
   - Validation errors → 400 with detailed message
   - Permission errors → 403 with clear message
   - Workspace not found → 404
   - Duplicate name → 409 conflict

### Testing Requirements

**Unit Tests (20+):**
1. ✅ Creates database with valid spec
2. ✅ Sets default version to "2.0"
3. ✅ Adds audit fields correctly
4. ✅ Returns database ID
5. ✅ Validates universalSpec with Zod
6. ✅ Rejects invalid property types
7. ✅ Rejects invalid view layouts
8. ✅ Rejects duplicate property keys
9. ✅ Rejects empty properties array
10. ✅ Rejects empty views array
11. ✅ Enforces workspace permission check
12. ✅ Logs audit event
13. ✅ Rejects duplicate database names
14. ✅ Handles non-existent workspace
15. ✅ Validates required fields (name, workspaceId)
16. ✅ Handles missing view IDs
17. ✅ Validates filter operators
18. ✅ Validates sort directions
19. ✅ Creates database with minimal spec
20. ✅ Creates database with full spec (all 21 property types)

---

## Task 2.2: Update Universal Database Mutation

**File:** `convex/features/database/mutations/updateUniversal.ts`  
**Lines:** ~250  
**Tests:** 25+  
**Priority:** HIGH

### Requirements

Create a Convex mutation that updates an existing Universal Database.

### Function Signature

```typescript
/**
 * Update an existing Universal Database
 * 
 * @param ctx - Convex mutation context
 * @param args - Update arguments
 * @returns The updated database object
 */
export const updateUniversal = mutation({
  args: {
    databaseId: v.id("universalDatabases"),
    name: v.optional(v.string()),
    universalSpec: v.optional(v.any()),
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implementation here
  },
});
```

### Implementation Steps

1. **Fetch Existing Database**
   - Get database by ID
   - Return 404 if not found

2. **Permission Check**
   ```typescript
   await requirePermission(ctx, database.workspaceId, "database:update");
   ```

3. **Input Validation**
   - If `universalSpec` provided, validate against `UniversalDatabaseSchema`
   - Validate property key uniqueness
   - Ensure at least 1 property remains
   - Ensure at least 1 view remains
   - Check for duplicate names if renaming

4. **Merge Updates**
   - Merge new fields with existing database
   - Preserve fields not provided in args
   - Update `updatedById` and `updatedAt`

5. **Database Update**
   - Update in `universalDatabases` table
   - Return updated database object

6. **Audit Logging**
   ```typescript
   await logAudit(ctx, {
     action: "database.update",
     workspaceId: database.workspaceId,
     resourceType: "universal_database",
     resourceId: args.databaseId,
     metadata: {
       changedFields: Object.keys(args),
       previousName: database.name,
       newName: args.name || database.name,
     },
   });
   ```

7. **Error Handling**
   - Database not found → 404
   - Validation errors → 400
   - Permission errors → 403
   - Duplicate name → 409

### Testing Requirements

**Unit Tests (25+):**
1. ✅ Updates database name
2. ✅ Updates universalSpec
3. ✅ Updates version
4. ✅ Updates multiple fields at once
5. ✅ Preserves unchanged fields
6. ✅ Updates updatedAt timestamp
7. ✅ Updates updatedById
8. ✅ Returns updated database object
9. ✅ Validates new universalSpec
10. ✅ Rejects invalid property types in update
11. ✅ Rejects duplicate property keys in update
12. ✅ Enforces permission check
13. ✅ Logs audit event
14. ✅ Returns 404 for non-existent database
15. ✅ Rejects duplicate name with existing DB
16. ✅ Allows renaming to same name (no-op)
17. ✅ Rejects removing all properties
18. ✅ Rejects removing all views
19. ✅ Handles partial spec updates
20. ✅ Validates filter operators in views
21. ✅ Validates sort configurations
22. ✅ Updates property options correctly
23. ✅ Updates view options correctly
24. ✅ Handles version migration scenarios
25. ✅ Prevents unauthorized workspace access

---

## Task 2.3: Query Universal Database

**File:** `convex/features/database/queries/getUniversal.ts`  
**Lines:** ~150  
**Tests:** 15+  
**Priority:** HIGH

### Requirements

Create a Convex query that retrieves a single Universal Database by ID.

### Function Signature

```typescript
/**
 * Get a Universal Database by ID
 * 
 * @param ctx - Convex query context
 * @param args - Query arguments
 * @returns The database object or null
 */
export const getUniversal = query({
  args: {
    databaseId: v.id("universalDatabases"),
  },
  handler: async (ctx, args) => {
    // Implementation here
  },
});
```

### Implementation Steps

1. **Fetch Database**
   - Get database by ID
   - Return null if not found

2. **Permission Check**
   ```typescript
   const hasPermission = await checkPermission(
     ctx, 
     database.workspaceId, 
     "database:read"
   );
   if (!hasPermission) return null; // Hide from unauthorized users
   ```

3. **Return Database**
   - Return complete database object
   - Include all fields (universalSpec, version, audit fields)

4. **Optional: Add Computed Fields**
   - Add `propertyCount` (computed from spec)
   - Add `viewCount` (computed from spec)
   - Add `rowCount` (if tracking rows)

### Testing Requirements

**Unit Tests (15+):**
1. ✅ Returns database by valid ID
2. ✅ Returns null for non-existent ID
3. ✅ Returns null for unauthorized user
4. ✅ Includes all database fields
5. ✅ Includes universalSpec
6. ✅ Includes version
7. ✅ Includes audit fields (createdAt, updatedAt, etc.)
8. ✅ Enforces permission check
9. ✅ Returns database for workspace member
10. ✅ Returns database for workspace admin
11. ✅ Returns database for workspace owner
12. ✅ Handles invalid database ID format
13. ✅ Returns correct property count
14. ✅ Returns correct view count
15. ✅ Works with different workspace contexts

---

## Task 2.4: List Universal Databases Query

**File:** `convex/features/database/queries/listUniversal.ts`  
**Lines:** ~150  
**Tests:** 15+  
**Priority:** HIGH

### Requirements

Create a Convex query that lists all Universal Databases in a workspace.

### Function Signature

```typescript
/**
 * List all Universal Databases in a workspace
 * 
 * @param ctx - Convex query context
 * @param args - Query arguments
 * @returns Array of database objects
 */
export const listUniversal = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()), // Default: 50
    cursor: v.optional(v.string()), // For pagination
  },
  handler: async (ctx, args) => {
    // Implementation here
  },
});
```

### Implementation Steps

1. **Permission Check**
   ```typescript
   await checkPermission(ctx, args.workspaceId, "database:read");
   // If no permission, return empty array
   ```

2. **Query Databases**
   - Use index `by_workspace` for efficient query
   - Filter by `workspaceId`
   - Order by `createdAt` descending (newest first)
   - Apply limit (default 50, max 100)

3. **Pagination Support**
   - If cursor provided, start from that cursor
   - Return `nextCursor` for pagination
   - Return `hasMore` boolean

4. **Return Array**
   - Return array of database objects
   - Include pagination metadata

### Testing Requirements

**Unit Tests (15+):**
1. ✅ Returns databases for valid workspace
2. ✅ Returns empty array for workspace with no databases
3. ✅ Returns empty array for unauthorized user
4. ✅ Enforces permission check
5. ✅ Respects limit parameter
6. ✅ Uses default limit of 50
7. ✅ Orders by createdAt descending
8. ✅ Supports pagination with cursor
9. ✅ Returns nextCursor when more results exist
10. ✅ Returns hasMore: true when more results exist
11. ✅ Returns hasMore: false when no more results
12. ✅ Filters by workspace correctly
13. ✅ Returns only databases from requested workspace
14. ✅ Handles invalid workspace ID
15. ✅ Works with multiple workspaces

---

## General Guidelines

### Code Structure

```typescript
// Example mutation structure
import { mutation } from "../../../_generated/server";
import { v } from "convex/values";
import { requirePermission } from "../../../lib/rbac/permissions";
import { logAudit } from "../../../lib/audit/logger";
import { UniversalDatabaseSchema } from "../../../shared/schemas/universal-database";

export const createUniversal = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    universalSpec: v.any(),
    version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Permission check
    await requirePermission(ctx, args.workspaceId, "database:create");

    // 2. Validation
    const validationResult = UniversalDatabaseSchema.safeParse(args.universalSpec);
    if (!validationResult.success) {
      throw new Error(`Invalid universal spec: ${validationResult.error.message}`);
    }

    // 3. Business logic
    const userId = await getUserId(ctx);
    const databaseId = await ctx.db.insert("universalDatabases", {
      workspaceId: args.workspaceId,
      name: args.name,
      universalSpec: args.universalSpec,
      version: args.version || "2.0",
      createdById: userId,
      updatedById: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 4. Audit logging
    await logAudit(ctx, {
      action: "database.create",
      workspaceId: args.workspaceId,
      resourceType: "universal_database",
      resourceId: databaseId,
      metadata: { name: args.name },
    });

    return databaseId;
  },
});
```

### Testing Structure

```typescript
// tests/features/database/universal-mutations.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createUniversal } from "../../../convex/features/database/mutations/createUniversal";
import { minimalUniversalDatabase } from "../../fixtures/universal-database";

describe("createUniversal", () => {
  beforeEach(() => {
    // Setup test workspace and user
  });

  it("should create database with valid spec", async () => {
    const result = await createUniversal(ctx, {
      workspaceId: testWorkspaceId,
      name: "Test Database",
      universalSpec: minimalUniversalDatabase,
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("string"); // Returns ID
  });

  it("should validate universalSpec with Zod", async () => {
    await expect(
      createUniversal(ctx, {
        workspaceId: testWorkspaceId,
        name: "Invalid DB",
        universalSpec: { invalid: "spec" },
      })
    ).rejects.toThrow("Invalid universal spec");
  });

  // More tests...
});
```

---

## Definition of Done (DoD)

Each task must meet these requirements:

### Code Complete ✅
- [ ] Mutation/query implemented
- [ ] Follows mutation template pattern
- [ ] RBAC permission checks enforced
- [ ] Audit logging implemented
- [ ] Zod validation integrated
- [ ] Error handling comprehensive
- [ ] JSDoc documentation complete

### Tests Written ✅
- [ ] Unit tests written (20+ per task)
- [ ] All test cases passing
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Permission checks tested
- [ ] Audit logging verified

### Tests Passing ✅
- [ ] 100% tests passing
- [ ] 85%+ code coverage
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors

### Documentation ✅
- [ ] JSDoc on all exported functions
- [ ] Inline comments for complex logic
- [ ] Error messages are clear
- [ ] Usage examples provided

### Code Review ✅
- [ ] Self-reviewed for quality
- [ ] Follows project conventions
- [ ] No hardcoded values
- [ ] Proper workspace isolation
- [ ] Security best practices

---

## Next Steps After Phase 2

Once Phase 2 is complete:
1. Update `docs/99_CURRENT_PROGRESS.md`
2. Update `docs/UNIVERSAL_DATABASE_TODO.md`
3. Create `docs/PHASE_2_SUMMARY.md`
4. Prepare for Phase 3 (Frontend Components)

---

**Prepared by:** Agent 2  
**Date:** 2025-01-06  
**Phase 1 Status:** ✅ Complete  
**Phase 2 Status:** ⏸️ Ready to Start
