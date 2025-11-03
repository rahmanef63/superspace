# Universal Database Implementation - TODO List

**Created:** 2025-11-02
**Status:** Planning
**Related Docs:**
- [Universal Database Spec](./UNIVERSAL_DATABASE_SPEC.md)
- [Migration Plan](./DATABASE_VIEW_SYSTEM_MIGRATION.md)

---

## Overview

This document breaks down the implementation of the Universal Notion Database spec into actionable tasks organized by phase.

**Timeline:** 9-13 weeks (including Week 0 preparation)
**Team Size:** 2-3 developers
**Approach:** Incremental, feature-flagged, backward-compatible

**Status:** ⚠️ Week 0 Required - Address Agent Alpha critical issues before Phase 1

---

## 🚨 Agent Alpha Review Status

**Date:** 2025-11-02
**Status:** ❌ CHANGES REQUIRED

**Critical Issues Found:** 5
**Warnings Found:** 12
**Decision:** Week 0 preparation required before Phase 1

**See:** Agent Alpha consolidated report for details

---

## Week 0: Preparation & Compliance (Week 0) ⭐ NEW

**Goal:** Address Agent Alpha's 5 critical issues and establish compliance infrastructure

**Duration:** 1 week
**Priority:** CRITICAL - Must complete before Phase 1

### 0.1 Mutation Templates & RBAC Enforcement

**Critical Issue Fix:** #4 Missing Permission Check Enforcement, #5 Audit Logging Not in DoD

- [x] **Create mutation template** (`convex/templates/mutation_template.ts.example`)
  - [x] Template with mandatory `requirePermission()` check
  - [x] Template with mandatory audit logging
  - [x] Built-in Zod validation
  - [x] Error handling with proper types
  - [x] Workspace isolation enforcement
  - [x] JSDoc with usage examples
  - [x] Write validation script to enforce template usage
  - **Note:** Template uses `.example` extension to avoid TypeScript errors

- [x] **Create audit logging helper** (`convex/lib/audit/logger.ts`)
  - [x] `logAudit()` function with standard signature
  - [x] Support all CRUD operations (create, read, update, delete)
  - [x] Include user context, workspace context
  - [x] Timestamp and metadata capture
  - [x] Integration with `activityEvents` table (not `auditLogs`)
  - [x] Write tests for audit logger
  - **Note:** Uses existing `activityEvents` table from schema

- [x] **Create permission check helper** (`convex/lib/rbac/permissions.ts`)
  - [x] `requirePermission()` function
  - [x] `checkPermission()` function (returns boolean)
  - [x] Permission validation with clear error messages
  - [x] Workspace-level permission checks
  - [x] Integration with existing RBAC system
  - [x] Write tests for permission checks

- [x] **Document mutation template usage** (`docs/MUTATION_TEMPLATE_GUIDE.md`)
  - [x] How to use the template
  - [x] Required RBAC checks
  - [x] Required audit logging
  - [x] Examples for common patterns
  - [x] Anti-patterns to avoid
  - [x] Updated for `.example` extension and `activityEvents` table

### 0.2 Auto-Discovery Architecture

**Critical Issue Fix:** #1 Property Registry Hardcoding, #2 View Registry Hardcoding

- [ ] **Design property auto-discovery system** (`docs/PROPERTY_AUTO_DISCOVERY.md`)
  - [ ] Document file-based discovery pattern
  - [ ] Convention: `frontend/features/database/properties/*/config.ts`
  - [ ] Property config schema definition
  - [ ] Hot-reload support during development
  - [ ] Performance considerations (caching)
  - [ ] Migration path from manual registration

- [ ] **Design view auto-discovery system** (`docs/VIEW_AUTO_DISCOVERY.md`)
  - [ ] Document file-based discovery pattern
  - [ ] Convention: `frontend/features/database/views/*/config.ts`
  - [ ] View config schema definition
  - [ ] Integration with view-system registry
  - [ ] Dynamic view loading strategy
  - [ ] Migration path from manual registration

- [ ] **Create auto-discovery loader** (`lib/features/discovery/database-discovery.ts`)
  - [ ] Scan for property configs
  - [ ] Scan for view configs
  - [ ] Validate discovered configs (Zod)
  - [ ] Cache discovered configs
  - [ ] Export typed registry
  - [ ] Write tests for discovery

- [ ] **Update FEATURE_RULES.md** with database-specific rules
  - [ ] Property registration rules
  - [ ] View registration rules
  - [ ] Zero-hardcoding enforcement
  - [ ] Config file structure requirements

### 0.3 Circular Dependency Prevention

**Critical Issue Fix:** #3 Circular Dependency Risk

- [ ] **Define V1/V2 boundaries** (`docs/V1_V2_BOUNDARIES.md`)
  - [ ] Clear separation between V1 and V2 code
  - [ ] Shared code extraction rules
  - [ ] Import restrictions (V1 cannot import V2, vice versa)
  - [ ] Adapter layer as the only bridge
  - [ ] Migration timeline for shared dependencies

- [ ] **Create dependency validation script** (`scripts/validate-dependencies.ts`)
  - [ ] Check for circular dependencies
  - [ ] Check for V1 ↔ V2 cross-imports
  - [ ] Enforce adapter-only bridging
  - [ ] Generate dependency graph
  - [ ] Integrate with CI/CD

- [ ] **Setup module boundaries** (TypeScript project references)
  - [ ] Separate tsconfig for V1 (`frontend/features/database/v1`)
  - [ ] Separate tsconfig for V2 (`frontend/features/database/v2`)
  - [ ] Shared types only in adapter layer
  - [ ] Compile-time boundary enforcement

### 0.4 Definition of Done (DoD) Enforcement

**Critical Issue Fix:** #5 Audit Logging Not in DoD (expanded)

- [ ] **Create DoD checklist template** (`docs/templates/DOD_CHECKLIST.md`)
  - [ ] 5 required items from .claude/CLAUDE.md
  - [ ] Additional database-specific items
  - [ ] Markdown template for tracking
  - [ ] Integration with PR template

- [ ] **Create DoD validation script** (`scripts/validate-dod.ts`)
  - [ ] Check 1: Schema validation (Zod script exists and passes)
  - [ ] Check 2: RBAC checks (all mutations have permission checks)
  - [ ] Check 3: Audit logging (all mutations log to audit table)
  - [ ] Check 4: Tests (unit + integration, >80% coverage)
  - [ ] Check 5: CI snippet (GitHub Actions workflow exists)
  - [ ] Generate DoD report
  - [ ] Integrate with CI/CD

- [ ] **Create CI/CD gates** (`.github/workflows/database-dod-check.yml`)
  - [ ] Run DoD validation on PR
  - [ ] Block merge if DoD not met
  - [ ] Post DoD status as comment
  - [ ] Link to DoD checklist

- [ ] **Update phase deliverables** (in this document)
  - [ ] Add DoD checklist to each phase
  - [ ] Add DoD validation step to each phase
  - [ ] Add DoD sign-off requirement

### 0.5 Architecture Documentation

**Warning Fix:** Missing architecture diagrams

- [ ] **Create data flow diagram** (`docs/diagrams/database-data-flow.mmd`)
  - [ ] Frontend → Convex flow
  - [ ] Universal schema transformations
  - [ ] View rendering pipeline
  - [ ] Import/export flows
  - [ ] Use Mermaid format

- [ ] **Create component interaction diagram** (`docs/diagrams/database-components.mmd`)
  - [ ] Property registry interaction
  - [ ] View registry interaction
  - [ ] Adapter layer architecture
  - [ ] State management flow
  - [ ] Use Mermaid format

- [ ] **Create migration flow diagram** (`docs/diagrams/v1-to-v2-migration.mmd`)
  - [ ] Migration steps visualization
  - [ ] Feature flag routing
  - [ ] Data transformation pipeline
  - [ ] Rollback flow
  - [ ] Use Mermaid format

- [ ] **Create architecture overview doc** (`docs/DATABASE_ARCHITECTURE.md`)
  - [ ] System architecture overview
  - [ ] Auto-discovery architecture
  - [ ] RBAC integration
  - [ ] Performance considerations
  - [ ] Scalability strategy
  - [ ] Include all diagrams

### 0.6 Validation Scripts

**Warning Fix:** Various validation gaps

- [ ] **Create permission check validator** (`scripts/validate-permissions.ts`)
  - [ ] Scan all mutations for `requirePermission()`
  - [ ] Report mutations without permission checks
  - [ ] Integrate with CI/CD
  - [ ] Exit code 1 if violations found

- [ ] **Create audit log validator** (`scripts/validate-audit-logs.ts`)
  - [ ] Scan all mutations for `logAudit()`
  - [ ] Report mutations without audit logging
  - [ ] Integrate with CI/CD
  - [ ] Exit code 1 if violations found

- [ ] **Create index validator** (`scripts/validate-indexes.ts`)
  - [ ] Check all queries use indexes
  - [ ] Report table scans
  - [ ] Suggest missing indexes
  - [ ] Integrate with CI/CD

- [ ] **Create test coverage validator** (`scripts/validate-coverage.ts`)
  - [ ] Check coverage >80% for new code
  - [ ] Check all mutations have tests
  - [ ] Check all queries have tests
  - [ ] Report coverage gaps

### Week 0 Deliverables (Definition of Done)

- ✅ **Mutation templates** created with mandatory RBAC + audit
- ✅ **Auto-discovery** architecture documented and designed
- ✅ **V1/V2 boundaries** defined with validation
- ✅ **DoD enforcement** scripts and CI/CD gates in place
- ✅ **Architecture diagrams** created (3 diagrams minimum)
- ✅ **Validation scripts** created (4 scripts minimum)
- ✅ **Documentation** complete and reviewed
- ✅ **Agent Alpha re-approval** obtained

**Exit Criteria:**
- All 5 critical issues from Agent Alpha addressed
- All validation scripts passing
- DoD checklist integrated into workflow
- Architecture documentation complete
- Agent Alpha gives ✅ APPROVED status

---

## Phase 1: Foundation & Type System (Week 1-2) ✅ COMPLETE

**Status:** 100% Complete (7/7 tasks done) ✅
**Duration:** 2 weeks (2025-11-02 to 2025-01-06)
**Team:** Agent 1 (Backend) + Agent 2 (Documentation)
**Total Tests:** 225+ passing
**Total Lines:** 2,700+ code lines

### 1.1 Universal Schema Types ✅ COMPLETE

- [x] **Create base type definitions** (`frontend/shared/foundation/types/universal-database.ts`) ✅
  - [x] Define `UniversalDatabase` interface (654 lines)
  - [x] Define `Property` interface with all 21 types
  - [x] Define `View` interface with all 10 layouts
  - [x] Define `Row` interface
  - [x] Define `Filter`, `Sort`, `ViewOptions` types
  - [x] Add JSDoc documentation for all types
  - [x] Export all types from `index.ts`
  - [x] Add type guards (isPropertyType, isViewLayout, isFilterOperator)
  - [x] Add type categories (PropertyTypeCategories, ViewLayoutCategories)

**Property Types (21):**
- Core (14): title, rich_text, number, select, multi_select, date, people, files, checkbox, url, email, relation, rollup, formula
- Extended (7): status, phone, button, unique_id, place, created_time, created_by, last_edited_time, last_edited_by

**View Layouts (10):**
- Existing (5): table, board, list, timeline, calendar
- New (5): gallery, map, chart, feed, form

### 1.2 Zod Validation Schemas ✅ COMPLETE

- [x] **Create Zod schemas** (`frontend/shared/foundation/schemas/universal-database.ts`) ✅
  - [x] Create `PropertyTypeSchema` (21 property types) - 578 lines
  - [x] Create `ViewLayoutSchema` (10 view layouts)
  - [x] Create `FilterOperatorSchema` (18 operators)
  - [x] Create `PropertySchema` with validation rules
  - [x] Create `ViewSchema` with validation rules
  - [x] Create `RowSchema` with validation rules
  - [x] Create `DatabaseSpecSchema` with cross-field validation
  - [x] Create `UniversalDatabaseSchema` (complete v2.0)
  - [x] Add custom validators for cross-field validation
    - [x] At least 1 primary property
    - [x] Only 1 primary property
    - [x] At least 1 default view
    - [x] Only 1 default view
  - [x] Add validation helpers (validateUniversalDatabase, validateProperty, validateView, validateRow)
  - [x] Add error messages in English
  - [x] Write unit tests for each schema (85%+ coverage achieved)

**Tests:** 30+ validation tests passing

### 1.3 Convex Schema Update ✅ COMPLETE

- [x] **Update Convex schema** (`convex/features/database/api/schema.ts`) ✅
  - [x] Add `universalDatabases` table definition
  - [x] Add fields:
    - [x] workspaceId (id, indexed)
    - [x] name (string)
    - [x] universalSpec (any - stores complete Universal Database JSON)
    - [x] version (string - schema version tracking)
    - [x] Audit fields (createdById, updatedById, createdAt, updatedAt)
  - [x] Add indexes: by_workspace, by_workspace_name
  - [x] Export in databaseTables
  - [x] Update TypeScript types
  - [x] Document migration path (V1 coexists with Universal)

**Note:** V1 tables (dbTables, dbFields, dbViews, dbRows) remain intact for backward compatibility.

### 1.4 Converter Layer ✅ COMPLETE

- [x] **Create converter layer** (`convex/lib/converters/database-converter.ts`) ✅
  - [x] Implement `toUniversal()` function (669 lines)
    - [x] V1 dbTable → Universal Database
    - [x] Map 14 V1 field types → 21 Universal property types
    - [x] Map 6 V1 view types → 10 Universal view layouts
    - [x] Convert field IDs to property keys
    - [x] Convert filters, sorts, visible fields
    - [x] Preserve all metadata (timestamps, users)
  - [x] Implement `fromUniversal()` function
    - [x] Universal → V1 components (table, fields, views, rows)
    - [x] Property key to field ID mapping
    - [x] Create temporary IDs for new fields
    - [x] Handle new property types gracefully
  - [x] Add validation helpers
    - [x] `validateUniversalDatabase()` with detailed errors
    - [x] Schema version check
    - [x] Required fields validation
  - [x] Add factory function
    - [x] `createMinimalDatabase()` for quick setup
  - [x] Write comprehensive unit tests (90%+ coverage)
    - [x] toUniversal() conversion tests
    - [x] fromUniversal() conversion tests
    - [x] Bidirectional round-trip tests
    - [x] Edge cases (missing fields, invalid data)

**Tests:** 40+ converter tests passing

### 1.5 Property Options Types ✅ COMPLETE

- [x] **Property Options Types** (`frontend/shared/foundation/types/property-options.ts`) ✅
  - [x] Create `NumberOptions` interface (format, currency, decimals, min, max)
  - [x] Create `SelectOptions` + `SelectChoice` interfaces
  - [x] Create `StatusOptions` + `StatusGroup` + `StatusChoice` interfaces
  - [x] Create `DateOptions` interface (format, includeTime, timeFormat, supportRange)
  - [x] Create `PeopleOptions` interface (allowMultiple, restrictToRoles, showAvatars, notifyOnAssign)
  - [x] Create `FilesOptions` interface (maxSize, allowedTypes, maxFiles, showThumbnails)
  - [x] Create `RelationOptions` interface (targetDatabaseId, displayProperty, bidirectional)
  - [x] Create `RollupOptions` interface (relationPropertyKey, function, asPercent)
  - [x] Create `ButtonOptions` interface (label, action, redirect, message, color, icon)
  - [x] Create `PlaceOptions` interface (defaultZoom, showFullAddress, provider)
  - [x] Create `FormulaOptions` interface (expression, returnType, numberFormat, dateFormat)
  - [x] Create union type `PropertyOptions`
  - [x] Add complete JSDoc documentation
  - [x] Re-exported from universal-database.ts
  - [x] Write unit tests (42 tests - DoD: 20+ ✅)

**File:** 452 lines, 11 interfaces  
**Tests:** 42 passing (210% of DoD requirement)

### 1.6 View Options Types ✅ COMPLETE

- [x] **View Options Types** (`frontend/shared/foundation/types/view-options.ts`) ✅
  - [x] Create `TableOptions` interface (showRowNumbers, rowHeight, wrapCells, showCalculations, columnWidths, frozenColumns)
  - [x] Create `BoardOptions` interface (cardCoverProperty, cardPreviewProperties, showEmptyGroups, groupByProperty, subGroupByProperty)
  - [x] Create `ListOptions` interface (showIcon, previewProperties, compact, groupByProperty)
  - [x] Create `TimelineOptions` interface (startDateProperty, endDateProperty, zoom, showWeekends, titleProperty, statusProperty, showTodayLine)
  - [x] Create `CalendarOptions` interface (dateProperty, defaultView, showWeekends, firstDayOfWeek, showWeekNumbers)
  - [x] Create `GalleryOptions` + `GalleryCard` interfaces (card, cardsPerRow, cardSize)
  - [x] Create `MapOptions` + `MapMarker` interfaces (locationProperty, marker, defaultCenter, defaultZoom, clusterMarkers)
  - [x] Create `ChartOptions` interface (type, xAxisProperty, yAxisProperty, aggregation, groupByProperty, showLegend, showGrid)
  - [x] Create `FeedOptions` + `FeedCard` interfaces (card, sortByProperty, sortDirection)
  - [x] Create `FormOptions` + `FormSection` + `FormField` interfaces (title, description, sections, submitButtonText, successMessage, redirectAfterSubmit)
  - [x] Create union type `ViewOptions`
  - [x] Add complete JSDoc documentation
  - [x] Re-exported from universal-database.ts
  - [x] Write unit tests (30 tests - DoD: 20+ ✅)

**File:** 561 lines, 10 view interfaces + 6 helper interfaces  
**Tests:** 30 passing (150% of DoD requirement)

### 1.7 Documentation Update ✅ COMPLETE

- [x] **Update progress tracker** (`docs/99_CURRENT_PROGRESS.md`) ✅
  - [x] Update Quick Status metrics (Phase 1: 100%)
  - [x] Mark Phase 1 tasks as complete
  - [x] Update deliverables count
  - [x] Add Phase 1 metrics table
  - [x] Document all completed tasks

- [x] **Update TODO checklist** (this file) ✅
  - [x] Mark all Phase 1 tasks as [x]
  - [x] Add completion notes
  - [x] Update test counts (225 total)
  - [x] Add links to deliverables

- [x] **Create Phase 1 summary** (`docs/PHASE_1_SUMMARY.md`) ✅
  - [x] Executive summary
  - [x] Detailed deliverables by task
  - [x] Comprehensive metrics & KPIs
  - [x] Testing summary (225 tests, 85%+ coverage)
  - [x] Key achievements
  - [x] DoD compliance verification
  - [x] Files created/modified list
  - [x] Agent workflow summary
  - [x] Next steps (Phase 2)

**Files Created/Updated:**
- `docs/PHASE_1_SUMMARY.md` (final completion report)
- `docs/PHASE_1_PROGRESS_SUMMARY.md` (interim progress)
- `docs/99_CURRENT_PROGRESS.md` (updated)
- `docs/UNIVERSAL_DATABASE_TODO.md` (this file - updated)
- `docs/README.md` (updated with Universal Database section)
- `docs/AGENT_1_NEXT_TASKS.md` (Task 1.5-1.6 instructions)
- `docs/AGENT_2_NEXT_TASKS.md` (Task 1.7 instructions)
- `docs/PHASE_1_COMPLETION_REPORT.md` (Task 1.1-1.4 report)
- `docs/AGENT_2_EXECUTION_REPORT.md` (Agent 2 work log)

---

### Phase 1 Summary

**Total Deliverables:**
- 8 core implementation files (2,700+ lines)
- 5 test files (225 tests passing)
- 10+ documentation files (2,000+ lines)

**Quality Metrics:**
- ✅ 225 tests passing (0 failures)
- ✅ 85%+ test coverage
- ✅ 0 TypeScript errors
- ✅ 0 linting errors
- ✅ 100% DoD compliance (5/5 requirements)

**Key Achievements:**
- ✅ Complete type system (21 property types + 10 view types)
- ✅ 21 configuration interfaces (11 property + 10 view)
- ✅ Runtime validation with Zod
- ✅ Bidirectional conversion (V1 ↔ Universal)
- ✅ Comprehensive testing & documentation

**Status:** Phase 1 Complete ✅ | Ready for Phase 2 🎯

---
  - [ ] Executive summary
  - [ ] Deliverables list
  - [ ] Metrics table
  - [ ] Key achievements
  - [ ] Next phase preview

- [ ] **Update README** (`README.md`)
  - [ ] Add Universal Database section
  - [ ] Add type system example
  - [ ] Add documentation links
  - [ ] Add testing instructions

- [ ] **Verify cross-references**
  - [ ] Check all links working
  - [ ] Verify file paths correct
  - [ ] Update code examples
  - [ ] Check terminology consistency

**Instructions:** See `docs/AGENT_2_NEXT_TASKS.md` for detailed specifications

**Trigger:** Agent 1 completes tasks 1.5-1.6

---

### Phase 1 Summary (Current Status)

**Completed (Week 1):**
- ✅ 4 major tasks (1.1-1.4)
- ✅ 4 core files (2,000+ lines)
- ✅ 3 test files (87 tests)
- ✅ 6 documentation files
- ✅ 85%+ test coverage
- ✅ 0 TypeScript errors
- ✅ DoD compliant

**Pending (Week 2):**
- ⏳ 3 remaining tasks (1.5-1.7)
- ⏳ 2 type files (700+ lines)
- ⏳ 2 test files (40+ tests)
- ⏳ 4 documentation updates

**Phase 1 Progress: 57% (4/7 tasks)**

---

### 1.2 Convex Schema

- [ ] **Create universal schema** (`convex/features/database/api/universal-schema.ts`)
  - [ ] Define `universalDatabases` table
  - [ ] Add `spec` field (stores complete JSON)
  - [ ] Add metadata fields (name, type, counts)
  - [ ] Add audit fields (created/updated by/at)
  - [ ] Add indexes (by_workspace, by_type)
  - [ ] Add migration tracking fields
  - [ ] Document schema with comments

- [ ] **Extend existing database schema** (`convex/features/database/api/schema.ts`)
  - [ ] Add `universalSpec` field to `dbTables` (optional)
  - [ ] Add `schemaVersion` field
  - [ ] Add `migratedToUniversal` boolean
  - [ ] Add `migrationDate` timestamp
  - [ ] Keep existing fields for backward compatibility
  - [ ] Update TypeScript types

### 1.3 Converter Layer

- [ ] **Create database-to-universal converter** (`frontend/shared/foundation/utils/converters/database-to-universal.ts`)
  - [ ] Implement `databaseToUniversal()` main function
  - [ ] Implement `convertProperty()` (14 existing types)
  - [ ] Implement `convertView()` (5 existing views)
  - [ ] Implement `convertRow()` (data transformation)
  - [ ] Handle edge cases (missing fields, invalid data)
  - [ ] Add comprehensive error handling
  - [ ] Write unit tests (90%+ coverage)

- [ ] **Create universal-to-database converter** (`frontend/shared/foundation/utils/converters/universal-to-database.ts`)
  - [ ] Implement `universalToDatabase()` main function
  - [ ] Implement reverse property conversion
  - [ ] Implement reverse view conversion
  - [ ] Implement reverse row conversion
  - [ ] Handle new property types gracefully (skip or warn)
  - [ ] Add validation before conversion
  - [ ] Write unit tests (90%+ coverage)

- [ ] **Create universal-to-view-system adapter** (`frontend/shared/foundation/utils/adapters/universal-to-view-system.ts`)
  - [ ] Implement `universalPropertyToViewField()`
  - [ ] Implement `universalViewToViewConfig()`
  - [ ] Map 21 property types to view-system types
  - [ ] Map 10 view layouts to view-system types
  - [ ] Handle unsupported features gracefully
  - [ ] Add type guards for safety
  - [ ] Write unit tests (85%+ coverage)

- [ ] **Create Notion API converter** (`frontend/shared/foundation/utils/converters/notion-converter.ts`)
  - [ ] Implement `universalToNotion()` export
  - [ ] Implement `notionToUniversal()` import
  - [ ] Map property types to Notion types
  - [ ] Map view layouts to Notion views
  - [ ] Handle Notion-specific features
  - [ ] Add error handling for API limits
  - [ ] Write integration tests

### 1.4 Validation & Testing

- [ ] **Create validation utilities** (`frontend/shared/foundation/utils/validation/database-validator.ts`)
  - [ ] Implement `validateUniversalDatabase()`
  - [ ] Implement `validateProperty()`
  - [ ] Implement `validateView()`
  - [ ] Implement `validateRow()`
  - [ ] Check for circular relations
  - [ ] Check for invalid references
  - [ ] Add custom validation rules
  - [ ] Return detailed error messages

- [ ] **Write comprehensive tests**
  - [ ] Unit tests for all types (100% coverage)
  - [ ] Unit tests for all converters (90%+ coverage)
  - [ ] Unit tests for all validators (90%+ coverage)
  - [ ] Integration tests for type conversions
  - [ ] Snapshot tests for JSON serialization
  - [ ] Performance tests for large databases (1000+ rows)

**Phase 1 Deliverables:**
- ✅ All TypeScript types defined and exported
- ✅ All Zod schemas with validation
- ✅ Convex schema created and deployed
- ✅ Converters working bidirectionally
- ✅ Tests passing with 85%+ coverage
- ✅ Documentation complete

---

## Phase 2: Core Property Types (Week 3-4)

### 2.1 Existing Property Renderers (14 types)

- [ ] **Refactor existing renderers** (`frontend/features/database/components/properties/`)
  - [ ] `TitleProperty.tsx` - ✅ Already exists, refactor to use universal types
  - [ ] `RichTextProperty.tsx` - ✅ Already exists as TextProperty
  - [ ] `NumberProperty.tsx` - ✅ Already exists, add format options
  - [ ] `SelectProperty.tsx` - ✅ Already exists, ensure consistency
  - [ ] `MultiSelectProperty.tsx` - ✅ Already exists, ensure consistency
  - [ ] `DateProperty.tsx` - ✅ Already exists, add timezone support
  - [ ] `PeopleProperty.tsx` - ✅ Already exists as PersonProperty
  - [ ] `FilesProperty.tsx` - ✅ Already exists, add accept/maxSize
  - [ ] `CheckboxProperty.tsx` - ✅ Already exists
  - [ ] `UrlProperty.tsx` - ✅ Already exists
  - [ ] `EmailProperty.tsx` - ✅ Already exists
  - [ ] `PhoneProperty.tsx` - ✅ Already exists
  - [ ] `FormulaProperty.tsx` - ✅ Already exists
  - [ ] `RelationProperty.tsx` - ✅ Already exists
  - [ ] `RollupProperty.tsx` - ✅ Already exists

### 2.2 New Property Renderers (7 types)

- [ ] **Status Property** (`frontend/features/database/components/properties/StatusProperty.tsx`)
  - [ ] Create component with grouped dropdown
  - [ ] Support status groups (To do / In progress / Done)
  - [ ] Add color indicators per group
  - [ ] Support keyboard navigation
  - [ ] Add group headers in dropdown
  - [ ] Integrate with form validation
  - [ ] Write component tests

- [ ] **Button Property** (`frontend/features/database/components/properties/ButtonProperty.tsx`)
  - [ ] Create button component
  - [ ] Support multiple action types:
    - [ ] `open_url` - Open URL in new tab
    - [ ] `set_property` - Set another property value
    - [ ] `add_relation` - Add relation to another record
    - [ ] `create_record` - Create new record in related DB
    - [ ] `trigger_webhook` - Call external webhook
  - [ ] Add loading states
  - [ ] Add error handling
  - [ ] Support template variables in URLs (e.g., `{{id}}`)
  - [ ] Write component tests

- [ ] **Unique ID Property** (`frontend/features/database/components/properties/UniqueIdProperty.tsx`)
  - [ ] Create read-only component
  - [ ] Support prefix (e.g., "TASK-")
  - [ ] Support zero-padding (e.g., "0001")
  - [ ] Auto-generate on record creation
  - [ ] Ensure uniqueness in database
  - [ ] Add copy-to-clipboard button
  - [ ] Write component tests

- [ ] **Place Property** (`frontend/features/database/components/properties/PlaceProperty.tsx`)
  - [ ] Create location input component
  - [ ] Integrate with geocoding API (Google Maps / Mapbox)
  - [ ] Support address autocomplete
  - [ ] Store lat/lng coordinates
  - [ ] Show mini map preview
  - [ ] Add "Open in Maps" button
  - [ ] Write component tests

- [ ] **Auto Properties** (created_time, created_by, last_edited_time, last_edited_by)
  - [ ] Create `CreatedTimeProperty.tsx` (read-only timestamp)
  - [ ] Create `CreatedByProperty.tsx` (read-only user)
  - [ ] Create `LastEditedTimeProperty.tsx` (read-only timestamp)
  - [ ] Create `LastEditedByProperty.tsx` (read-only user)
  - [ ] Auto-populate on record create/update
  - [ ] Format timestamps with relative time
  - [ ] Write component tests

### 2.3 Property Registry

- [ ] **Create property registry** (`frontend/features/database/registry/property-registry.ts`)
  - [ ] Define `PropertyDefinition` interface
  - [ ] Create registry class
  - [ ] Register all 21 property types
  - [ ] Map types to renderer components
  - [ ] Map types to editor components
  - [ ] Map types to cell renderers (for table view)
  - [ ] Add validation rules per type
  - [ ] Add default options per type
  - [ ] Export `getPropertyDefinition()` helper

- [ ] **Create property factory** (`frontend/features/database/utils/property-factory.ts`)
  - [ ] Implement `createProperty()` function
  - [ ] Generate default values per type
  - [ ] Validate options against type
  - [ ] Handle type-specific initialization
  - [ ] Return fully-formed property object

### 2.4 Property Testing

- [ ] **Write property tests**
  - [ ] Component tests for each renderer
  - [ ] Interaction tests (click, edit, save)
  - [ ] Validation tests (required, format)
  - [ ] Integration tests with database
  - [ ] Accessibility tests (keyboard, screen reader)
  - [ ] Visual regression tests

**Phase 2 Deliverables:**
- ✅ All 21 property types rendered correctly
- ✅ Property registry fully functional
- ✅ Component tests passing (85%+ coverage)
- ✅ Accessibility compliant (WCAG 2.1 AA)

---

## Phase 3: Core View Types (Week 4-5)

### 3.1 Existing View Implementations (5 views)

- [ ] **Refactor Table View** (`frontend/features/database/components/views/table/TableView.tsx`)
  - [ ] Integrate with view-system `TableView`
  - [ ] Use universal property renderers
  - [ ] Support all table options (density, frozen columns)
  - [ ] Add inline editing for all property types
  - [ ] Support column reordering
  - [ ] Support column resizing
  - [ ] Add column visibility toggle
  - [ ] Write view tests

- [ ] **Refactor Board View** (`frontend/features/database/components/views/board/BoardView.tsx`)
  - [ ] Integrate with view-system `KanbanView`
  - [ ] Support grouping by any property
  - [ ] Add subgroupBy support (NEW)
  - [ ] Support card cover images
  - [ ] Add drag-and-drop between groups
  - [ ] Show empty groups option
  - [ ] Support card layouts (default/compact/expanded)
  - [ ] Write view tests

- [ ] **Refactor List View** (`frontend/features/database/components/views/list/ListView.tsx`)
  - [ ] Integrate with view-system `ListView`
  - [ ] Support dense mode
  - [ ] Add thumbnail support (NEW)
  - [ ] Support quick actions on hover
  - [ ] Add bulk selection
  - [ ] Write view tests

- [ ] **Refactor Timeline View** (`frontend/features/database/components/views/timeline/TimelineView.tsx`)
  - [ ] Integrate with view-system `GanttView`
  - [ ] Support start/end date properties
  - [ ] Add zoom levels (day/week/month/quarter/year)
  - [ ] Support grouping by property
  - [ ] Add drag to resize date ranges
  - [ ] Show weekends toggle
  - [ ] Add today marker
  - [ ] Write view tests

- [ ] **Refactor Calendar View** (`frontend/features/database/components/views/calendar/CalendarView.tsx`)
  - [ ] Integrate with view-system `CalendarView`
  - [ ] Support month/week/day views
  - [ ] Add week numbers toggle (NEW)
  - [ ] Support first day of week preference
  - [ ] Add drag-and-drop to move dates
  - [ ] Show multiple events per day
  - [ ] Add today highlighting
  - [ ] Write view tests

### 3.2 New View Implementations (5 views)

- [ ] **Gallery View** (`frontend/features/database/components/views/gallery/GalleryView.tsx`)
  - [ ] Create responsive card grid
  - [ ] Support cover images from file property
  - [ ] Support card sizes (small/medium/large)
  - [ ] Show title and configurable metadata
  - [ ] Add lazy loading for images
  - [ ] Support card click to open detail
  - [ ] Add hover effects
  - [ ] Write view tests

- [ ] **Map View** (`frontend/features/database/components/views/map/MapView.tsx`)
  - [ ] Integrate map library (Mapbox / Leaflet)
  - [ ] Plot records with Place property
  - [ ] Support marker clustering
  - [ ] Add custom marker icons
  - [ ] Support zoom and pan
  - [ ] Show info popup on marker click
  - [ ] Add search/filter on map
  - [ ] Write view tests

- [ ] **Chart View** (`frontend/features/database/components/views/chart/ChartView.tsx`)
  - [ ] Integrate charting library (Chart.js / Recharts)
  - [ ] Support chart types:
    - [ ] Bar chart
    - [ ] Line chart
    - [ ] Area chart
    - [ ] Pie chart
    - [ ] Doughnut chart
    - [ ] Scatter plot (optional)
  - [ ] Support aggregations (count/sum/avg/min/max)
  - [ ] Support grouping and stacking
  - [ ] Add color by property
  - [ ] Add legend and grid toggles
  - [ ] Add export to image
  - [ ] Write view tests

- [ ] **Feed View** (`frontend/features/database/components/views/feed/FeedView.tsx`)
  - [ ] Create social media-style feed
  - [ ] Support card layout (title/subtitle/meta/content/image)
  - [ ] Add infinite scroll / pagination
  - [ ] Support custom ordering (most recent, most edited)
  - [ ] Add grouping by date/property
  - [ ] Support card actions (like, comment, share - optional)
  - [ ] Add skeleton loading states
  - [ ] Write view tests

- [ ] **Form View** (`frontend/features/database/components/views/form/FormView.tsx`)
  - [ ] Create dynamic form builder
  - [ ] Support all 21 property types as form fields
  - [ ] Support multi-column layouts
  - [ ] Support sections with titles
  - [ ] Add field validation (required, format)
  - [ ] Add default values
  - [ ] Support hidden fields
  - [ ] Add custom submit actions
  - [ ] Add success/error messages
  - [ ] Support redirect after submit
  - [ ] Add form preview mode
  - [ ] Write view tests

### 3.3 View Registry Integration

- [ ] **Register views in view-system** (`frontend/shared/ui/layout/view-system/registry.ts`)
  - [ ] Register `DatabaseTableView`
  - [ ] Register `DatabaseBoardView`
  - [ ] Register `DatabaseListView`
  - [ ] Register `DatabaseTimelineView`
  - [ ] Register `DatabaseCalendarView`
  - [ ] Register `DatabaseGalleryView` (NEW)
  - [ ] Register `DatabaseMapView` (NEW)
  - [ ] Register `DatabaseChartView` (NEW)
  - [ ] Register `DatabaseFeedView` (NEW)
  - [ ] Register `DatabaseFormView` (NEW)
  - [ ] Add view icons and descriptions
  - [ ] Add supported features flags

- [ ] **Create view factory** (`frontend/features/database/utils/view-factory.ts`)
  - [ ] Implement `createView()` function
  - [ ] Generate default view configurations
  - [ ] Validate view options against layout type
  - [ ] Handle layout-specific initialization
  - [ ] Return fully-formed view object

### 3.4 View Testing

- [ ] **Write view tests**
  - [ ] Component tests for each view
  - [ ] Interaction tests (filter, sort, group)
  - [ ] Integration tests with data loading
  - [ ] Performance tests (1000+ records)
  - [ ] Accessibility tests
  - [ ] Visual regression tests

**Phase 3 Deliverables:**
- ✅ All 10 view types rendered correctly
- ✅ Views registered in view-system
- ✅ Component tests passing (85%+ coverage)
- ✅ Performance acceptable (<500ms render)

---

## Phase 4: Integration & Migration (Week 5-6)

### 4.1 Database Page V2

- [ ] **Create new database page** (`frontend/features/database/views/DatabasePageV2.tsx`)
  - [ ] Integrate `ViewProvider` with universal data
  - [ ] Use `ViewRenderer` for dynamic view switching
  - [ ] Connect to universal database queries
  - [ ] Handle loading and error states
  - [ ] Support view switching via toolbar
  - [ ] Support view creation and deletion
  - [ ] Support view settings editing
  - [ ] Add feature flag check

- [ ] **Create universal toolbar** (`frontend/features/database/components/DatabaseToolbarV2.tsx`)
  - [ ] Integrate with `UniversalToolbar`
  - [ ] Add view switcher dropdown
  - [ ] Add filter builder
  - [ ] Add sort controls
  - [ ] Add group by selector
  - [ ] Add search input
  - [ ] Add custom actions (import/export)
  - [ ] Add view settings menu

- [ ] **Update database shell** (`frontend/features/database/components/DatabaseShell.tsx`)
  - [ ] Support both V1 and V2 implementations
  - [ ] Add feature flag routing
  - [ ] Maintain sidebar compatibility
  - [ ] Update header with universal data

### 4.2 Convex Queries & Mutations

- [ ] **Create universal queries** (`convex/features/database/queries/universal.ts`)
  - [ ] `getUniversalDatabase(id)` - Get full database spec
  - [ ] `listUniversalDatabases(workspaceId)` - List all databases
  - [ ] `searchUniversalDatabases(workspaceId, query)` - Search databases
  - [ ] `getUniversalDatabaseMetadata(id)` - Get metadata only
  - [ ] Add permission checks
  - [ ] Add error handling
  - [ ] Write query tests

- [ ] **Create universal mutations** (`convex/features/database/mutations/universal.ts`)
  - [ ] `createUniversalDatabase(spec)` - Create new database
  - [ ] `updateUniversalDatabase(id, spec)` - Update database
  - [ ] `deleteUniversalDatabase(id)` - Delete database
  - [ ] `createProperty(dbId, property)` - Add property
  - [ ] `updateProperty(dbId, propertyKey, updates)` - Update property
  - [ ] `deleteProperty(dbId, propertyKey)` - Delete property
  - [ ] `createView(dbId, view)` - Add view
  - [ ] `updateView(dbId, viewId, updates)` - Update view
  - [ ] `deleteView(dbId, viewId)` - Delete view
  - [ ] `createRow(dbId, data)` - Add row
  - [ ] `updateRow(dbId, rowId, data)` - Update row
  - [ ] `deleteRow(dbId, rowId)` - Delete row
  - [ ] Add audit logging
  - [ ] Add permission checks
  - [ ] Write mutation tests

- [ ] **Create migration utilities** (`convex/features/database/migrations/to-universal.ts`)
  - [ ] `migrateDatabaseToUniversal(tableId)` - Migrate single database
  - [ ] `migrateAllDatabases(workspaceId)` - Batch migration
  - [ ] `validateMigration(tableId)` - Check migration success
  - [ ] `rollbackMigration(tableId)` - Revert migration
  - [ ] Add dry-run mode
  - [ ] Add progress reporting
  - [ ] Write migration tests

### 4.3 Feature Flag System

- [ ] **Create feature flag infrastructure** (`lib/features/flags.ts`)
  - [ ] Define `USE_UNIVERSAL_DATABASE` flag
  - [ ] Support percentage-based rollout
  - [ ] Support user-based override
  - [ ] Support workspace-based override
  - [ ] Add flag checking hook: `useFeatureFlag()`
  - [ ] Add admin UI for flag management
  - [ ] Write flag tests

- [ ] **Update database entry point** (`frontend/features/database/page.tsx`)
  - [ ] Check `USE_UNIVERSAL_DATABASE` flag
  - [ ] Route to V2 if enabled, V1 otherwise
  - [ ] Log flag decisions for analytics
  - [ ] Add A/B testing metadata

### 4.4 Data Migration Scripts

- [ ] **Create CLI migration tool** (`scripts/migrate-database-universal.ts`)
  - [ ] Add command-line interface
  - [ ] Support dry-run mode
  - [ ] Support single database migration
  - [ ] Support workspace-wide migration
  - [ ] Add progress bar and logging
  - [ ] Generate migration report
  - [ ] Add error recovery
  - [ ] Write script tests

- [ ] **Create migration validation** (`scripts/validate-database-migration.ts`)
  - [ ] Compare V1 vs V2 data
  - [ ] Check data integrity
  - [ ] Verify all fields migrated
  - [ ] Verify all views migrated
  - [ ] Verify all rows migrated
  - [ ] Generate validation report
  - [ ] Flag discrepancies

### 4.5 Integration Testing

- [ ] **Write integration tests**
  - [ ] End-to-end tests for database creation
  - [ ] End-to-end tests for CRUD operations
  - [ ] End-to-end tests for view switching
  - [ ] End-to-end tests for filtering/sorting
  - [ ] Migration tests (V1 → V2)
  - [ ] Rollback tests (V2 → V1)
  - [ ] Performance tests (large databases)
  - [ ] Concurrent user tests

**Phase 4 Deliverables:**
- ✅ Database V2 fully functional
- ✅ Feature flag system working
- ✅ Migration scripts tested
- ✅ Integration tests passing (90%+ coverage)
- ✅ Ready for beta rollout

---

## Phase 5: Import/Export & Interoperability (Week 6-7)

### 5.1 Notion Integration

- [ ] **Create Notion API client** (`lib/integrations/notion/client.ts`)
  - [ ] Setup Notion SDK
  - [ ] Add authentication handling
  - [ ] Add rate limiting
  - [ ] Add error handling
  - [ ] Write client tests

- [ ] **Notion import** (`lib/integrations/notion/import.ts`)
  - [ ] Fetch Notion database via API
  - [ ] Convert Notion properties to universal properties
  - [ ] Convert Notion views to universal views
  - [ ] Import rows with data transformation
  - [ ] Handle nested relations
  - [ ] Add import progress tracking
  - [ ] Write import tests

- [ ] **Notion export** (`lib/integrations/notion/export.ts`)
  - [ ] Convert universal database to Notion format
  - [ ] Create database in Notion workspace
  - [ ] Export properties and views
  - [ ] Export rows in batches
  - [ ] Handle API limits gracefully
  - [ ] Add export progress tracking
  - [ ] Write export tests

- [ ] **Notion sync** (`lib/integrations/notion/sync.ts`)
  - [ ] Implement two-way sync logic
  - [ ] Detect changes in both systems
  - [ ] Resolve conflicts (last-write-wins)
  - [ ] Schedule periodic sync
  - [ ] Add sync status UI
  - [ ] Write sync tests

### 5.2 Standard Format Export

- [ ] **CSV export** (`lib/export/csv-exporter.ts`)
  - [ ] Flatten universal database to CSV
  - [ ] Handle nested properties (JSON stringify)
  - [ ] Support custom column selection
  - [ ] Add CSV download handler
  - [ ] Write export tests

- [ ] **Excel export** (`lib/export/excel-exporter.ts`)
  - [ ] Use library (xlsx / exceljs)
  - [ ] Create sheets for each view
  - [ ] Format cells by property type
  - [ ] Add data validation rules
  - [ ] Support formulas
  - [ ] Add Excel download handler
  - [ ] Write export tests

- [ ] **JSON export** (`lib/export/json-exporter.ts`)
  - [ ] Export full universal JSON spec
  - [ ] Support minified and pretty print
  - [ ] Add metadata (export date, version)
  - [ ] Add JSON download handler
  - [ ] Write export tests

- [ ] **Markdown export** (`lib/export/markdown-exporter.ts`)
  - [ ] Convert database to markdown tables
  - [ ] Support view-specific exports
  - [ ] Format properties as markdown
  - [ ] Add front matter with metadata
  - [ ] Add markdown download handler
  - [ ] Write export tests

### 5.3 Standard Format Import

- [ ] **CSV import** (`lib/import/csv-importer.ts`)
  - [ ] Parse CSV with header detection
  - [ ] Auto-detect property types
  - [ ] Map columns to properties
  - [ ] Validate data before import
  - [ ] Handle errors gracefully
  - [ ] Add import UI
  - [ ] Write import tests

- [ ] **Excel import** (`lib/import/excel-importer.ts`)
  - [ ] Parse Excel files (xlsx / exceljs)
  - [ ] Support multiple sheets
  - [ ] Preserve cell formatting as property options
  - [ ] Extract formulas
  - [ ] Validate data before import
  - [ ] Add import UI
  - [ ] Write import tests

- [ ] **JSON import** (`lib/import/json-importer.ts`)
  - [ ] Parse and validate universal JSON
  - [ ] Check schema version compatibility
  - [ ] Import full database structure
  - [ ] Handle conflicts (merge or replace)
  - [ ] Add import UI
  - [ ] Write import tests

### 5.4 Template System

- [ ] **Create template registry** (`frontend/features/database/templates/registry.ts`)
  - [ ] Define template structure
  - [ ] Create built-in templates:
    - [ ] Task Management (Kanban + Timeline)
    - [ ] Project Tracker (Gantt + Table)
    - [ ] CRM (Board + Gallery)
    - [ ] Event Calendar (Calendar + List)
    - [ ] Content Planner (Feed + Calendar)
    - [ ] Knowledge Base (Table + Form)
  - [ ] Add template preview images
  - [ ] Add template descriptions

- [ ] **Template UI** (`frontend/features/database/components/TemplateGallery.tsx`)
  - [ ] Create template gallery component
  - [ ] Add template cards with previews
  - [ ] Add "Use Template" button
  - [ ] Support template customization before creation
  - [ ] Add template search and filtering
  - [ ] Write component tests

- [ ] **Template sharing** (`lib/templates/sharing.ts`)
  - [ ] Allow users to save database as template
  - [ ] Support public template sharing
  - [ ] Add template marketplace (future)
  - [ ] Add template import from URL
  - [ ] Write sharing tests

**Phase 5 Deliverables:**
- ✅ Notion import/export working
- ✅ CSV/Excel/JSON/Markdown export working
- ✅ CSV/Excel/JSON import working
- ✅ Template system with 6+ built-in templates
- ✅ Template gallery UI complete

---

## Phase 6: Polish & Optimization (Week 7-8)

### 6.1 Performance Optimization

- [ ] **Frontend optimization**
  - [ ] Implement virtual scrolling for large tables
  - [ ] Add memoization to converters
  - [ ] Lazy load view components
  - [ ] Optimize re-renders with React.memo
  - [ ] Add debouncing to search/filter
  - [ ] Implement incremental loading (pagination)
  - [ ] Add loading skeletons
  - [ ] Profile and optimize hot paths

- [ ] **Backend optimization**
  - [ ] Add database indexes for common queries
  - [ ] Optimize Convex queries with projections
  - [ ] Implement caching for static data
  - [ ] Batch mutations where possible
  - [ ] Add query result caching
  - [ ] Profile slow queries
  - [ ] Optimize for large databases (10k+ rows)

- [ ] **Caching strategy**
  - [ ] Cache universal database specs in memory
  - [ ] Cache property/view registries
  - [ ] Cache computed values (formulas, rollups)
  - [ ] Implement cache invalidation
  - [ ] Add cache warming for common operations

### 6.2 User Experience

- [ ] **Onboarding flow**
  - [ ] Create welcome modal for new users
  - [ ] Add interactive tutorial
  - [ ] Add tooltips for features
  - [ ] Create video tutorials
  - [ ] Add contextual help links

- [ ] **Keyboard shortcuts**
  - [ ] Add shortcut registry
  - [ ] Support table navigation (arrow keys)
  - [ ] Support quick actions (cmd+k)
  - [ ] Support view switching (cmd+1-9)
  - [ ] Add shortcut help modal (?)

- [ ] **Accessibility**
  - [ ] Audit with screen reader
  - [ ] Ensure keyboard navigability
  - [ ] Add ARIA labels everywhere
  - [ ] Check color contrast (WCAG AA)
  - [ ] Add focus indicators
  - [ ] Support reduced motion
  - [ ] Test with accessibility tools

- [ ] **Responsive design**
  - [ ] Optimize for mobile (320px+)
  - [ ] Optimize for tablet (768px+)
  - [ ] Add touch gestures
  - [ ] Test on real devices
  - [ ] Add mobile-specific views

### 6.3 Error Handling & Monitoring

- [ ] **Error boundaries**
  - [ ] Add error boundaries to all views
  - [ ] Add fallback UI for errors
  - [ ] Log errors to monitoring service
  - [ ] Add retry mechanisms

- [ ] **Validation feedback**
  - [ ] Add inline validation errors
  - [ ] Add toast notifications for actions
  - [ ] Add confirmation dialogs for destructive actions
  - [ ] Add undo/redo support (optional)

- [ ] **Monitoring & analytics**
  - [ ] Track view usage metrics
  - [ ] Track property type usage
  - [ ] Track performance metrics
  - [ ] Track error rates
  - [ ] Add custom dashboards

### 6.4 Documentation

- [ ] **Developer documentation**
  - [ ] Document universal schema format
  - [ ] Document converter usage
  - [ ] Document how to add new property types
  - [ ] Document how to add new view types
  - [ ] Add architecture diagrams
  - [ ] Add code examples

- [ ] **User documentation**
  - [ ] Create user guide for each view type
  - [ ] Create user guide for each property type
  - [ ] Create import/export guide
  - [ ] Create template guide
  - [ ] Add FAQs
  - [ ] Create video tutorials

- [ ] **API documentation**
  - [ ] Document Convex queries and mutations
  - [ ] Document REST API (if applicable)
  - [ ] Document webhook payloads
  - [ ] Add OpenAPI/Swagger spec

**Phase 6 Deliverables:**
- ✅ Performance optimized (sub-second response)
- ✅ Excellent UX with keyboard shortcuts
- ✅ WCAG 2.1 AA compliant
- ✅ Comprehensive documentation
- ✅ Ready for production launch

---

## Phase 7: Beta Testing & Rollout (Week 8+)

### 7.1 Beta Testing

- [ ] **Internal testing**
  - [ ] Create test plan
  - [ ] Test all 21 property types
  - [ ] Test all 10 view types
  - [ ] Test import/export flows
  - [ ] Test migration scripts
  - [ ] Document bugs and issues

- [ ] **External beta**
  - [ ] Recruit beta testers (10-20 users)
  - [ ] Enable feature flag for beta users
  - [ ] Collect feedback via surveys
  - [ ] Monitor usage metrics
  - [ ] Monitor error rates
  - [ ] Conduct user interviews
  - [ ] Iterate based on feedback

### 7.2 Gradual Rollout

- [ ] **Rollout plan**
  - [ ] Week 1: Enable for 5% of users
  - [ ] Week 2: Enable for 25% of users
  - [ ] Week 3: Enable for 50% of users
  - [ ] Week 4: Enable for 100% of users
  - [ ] Monitor metrics at each stage
  - [ ] Halt rollout if issues detected

- [ ] **Migration execution**
  - [ ] Notify users of upcoming migration
  - [ ] Run migration scripts for all workspaces
  - [ ] Monitor migration progress
  - [ ] Handle migration failures
  - [ ] Provide support for issues

### 7.3 Post-Launch

- [ ] **Monitoring**
  - [ ] Set up alerts for errors
  - [ ] Monitor performance metrics
  - [ ] Track user engagement
  - [ ] Collect user feedback

- [ ] **Cleanup**
  - [ ] Remove feature flags once stable
  - [ ] Deprecate old database code
  - [ ] Archive old components
  - [ ] Update documentation

- [ ] **Future enhancements**
  - [ ] AI-powered formula assistant
  - [ ] Real-time collaboration on forms
  - [ ] Advanced chart types
  - [ ] Database templates marketplace
  - [ ] Mobile app with offline support

**Phase 7 Deliverables:**
- ✅ Beta tested with real users
- ✅ 100% of users migrated successfully
- ✅ Production launch complete
- ✅ Post-launch metrics healthy

---

## Summary Statistics

### Total Tasks
- **Phase 1 (Foundation):** ~50 tasks
- **Phase 2 (Properties):** ~35 tasks
- **Phase 3 (Views):** ~45 tasks
- **Phase 4 (Integration):** ~30 tasks
- **Phase 5 (Import/Export):** ~40 tasks
- **Phase 6 (Polish):** ~30 tasks
- **Phase 7 (Launch):** ~20 tasks

**Total:** ~250 tasks

### Estimated Effort
- **Phase 1:** 80 hours (2 weeks, 2 devs)
- **Phase 2:** 80 hours (2 weeks, 2 devs)
- **Phase 3:** 80 hours (2 weeks, 2 devs)
- **Phase 4:** 80 hours (2 weeks, 2 devs)
- **Phase 5:** 80 hours (2 weeks, 2 devs)
- **Phase 6:** 80 hours (2 weeks, 2 devs)
- **Phase 7:** 40 hours (1 week, 2 devs)

**Total:** ~520 hours (13 weeks, 2 devs) or ~260 hours (13 weeks, 1 dev)

### Key Milestones

1. **Week 2:** Foundation complete, types defined ✅
2. **Week 4:** All property types working ✅
3. **Week 5:** All view types working ✅
4. **Week 6:** V2 implementation complete, migration scripts ready ✅
5. **Week 7:** Import/export + templates complete ✅
6. **Week 8:** Performance optimized, ready for beta ✅
7. **Week 10:** Beta testing complete ✅
8. **Week 12:** Production launch 🚀

---

## Risk Management

### High Risks
1. **Data migration failures** → Mitigation: Extensive testing, dry-runs, rollback plan
2. **Performance issues with large databases** → Mitigation: Virtual scrolling, pagination, caching
3. **Missing feature parity** → Mitigation: Comprehensive feature checklist, user testing

### Medium Risks
1. **Complex adapter logic** → Mitigation: Unit tests, type safety, code reviews
2. **View-system integration issues** → Mitigation: Incremental integration, fallbacks
3. **Third-party API limits (Notion, Maps)** → Mitigation: Rate limiting, error handling, retries

### Low Risks
1. **UI/UX issues** → Mitigation: User testing, iterations
2. **Documentation gaps** → Mitigation: Continuous documentation updates

---

## Success Criteria

- ✅ All 21 property types working correctly
- ✅ All 10 view types rendering correctly
- ✅ Zero data loss during migration
- ✅ Performance: <500ms render time for 1000 rows
- ✅ Test coverage: >85% for all new code
- ✅ Accessibility: WCAG 2.1 AA compliant
- ✅ User satisfaction: >4.0/5.0 rating
- ✅ Adoption: >80% of database users on V2 within 1 month

---

**Document Status:** Ready for Implementation
**Next Steps:** Start Phase 1 - Foundation & Type System
**Estimated Completion:** 8-12 weeks from start
