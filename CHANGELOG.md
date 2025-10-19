# Changelog

All notable changes to SuperSpace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🔧 Fixed (2025-01-18)
- **Menu Store - Optional Features Not Showing**
  - Fixed `getAvailableFeatureMenus` to use `OPTIONAL_FEATURES_CATALOG` instead of hardcoded list
  - Fixed `installFeatureMenus` to dynamically build from catalog
  - Impact: Reports, Calendar, Tasks, Wiki now appear in Menu Store
  - Root cause: Hardcoded features list missing newly added optional features
  - See [MENU_STORE_FIX.md](./docs/MENU_STORE_FIX.md) for details

### 🎉 Added (2025-01-18)
- **Feature Status System** - Comprehensive development status tracking
  - `FeatureBadge` component - Visual status indicators (Dev, Beta, Stable, etc.)
  - `FeatureNotReady` component - Professional "under development" screens
  - Status fields in `features.config.ts` (status, isReady, expectedRelease)
  - Schema updated with status metadata fields
  - Auto-synced to `optional_features_catalog.ts`
  - See [FEATURE_STATUS_SYSTEM.md](./docs/FEATURE_STATUS_SYSTEM.md) for details

- **Enhanced Error Handling** - Better UX for incomplete features
  - Graceful fallback for missing/incomplete features
  - Clear communication about development status
  - Expected release dates displayed to users
  - Professional "coming soon" experience

### 🎉 Added
- **Health Check System** - Comprehensive workspace health monitoring
  - `convex/workspace/health.ts` - Health check queries and mutations
  - `scripts/check-workspace-health.ts` - CLI health check tool
  - `pnpm run check:workspaces` - Diagnose workspace issues
  - `pnpm run check:workspaces:fix` - Auto-fix common issues

- **Documentation Suite** - Complete knowledge base
  - `docs/KNOWLEDGE_BASE.md` - Quick reference (<5000 tokens)
  - `docs/FEATURE_STATUS.md` - Detailed project status (26/39 tasks complete)
  - `docs/README.md` - Complete guide with examples
  - `docs/TROUBLESHOOTING.md` - Common issues and solutions
  - `docs/feature-system-diagram.md` - Visual architecture diagrams

### 🔧 Fixed
- **CRITICAL: Schema Mismatch** - Fixed workspace bootstrap failure
  - Added `tags` field to `menuItems.metadata` schema ([convex/schema.ts:168](convex/schema.ts#L168))
  - Error: `Object contains extra field 'tags' that is not in the validator`
  - Impact: New workspaces created without menus
  - Status: ✅ RESOLVED

- **Better Error Handling** - Improved workspace creation logging
  - Enhanced error messages in `createWorkspace` mutation
  - Added detailed error context (workspaceId, error, stack trace)
  - Changed from `console.warn` to `console.error` for critical errors
  - Added recovery instructions in logs

### 🚀 Improved
- **Error Recovery** - Multiple options for fixing broken workspaces
  - Via Convex Dashboard: `resetWorkspace` mutation
  - Via CLI: `pnpm run check:workspaces:fix`
  - Via Query: `fixWorkspaceIssues` mutation with auto-fix

- **Developer Experience**
  - Added `pnpm run check:workspaces` for health diagnostics
  - Created comprehensive troubleshooting guide
  - Improved documentation structure for AI agents
  - Optimized token usage with hierarchical docs

## [0.1.0] - 2025-01-18

### 🎉 Initial Release Features

#### Core Systems (83% Complete)
- ✅ Feature Package System
- ✅ RBAC (Role-Based Access Control)
- ✅ Audit Logging
- ✅ Menu System with Sets
- ✅ Workspace Management
- ✅ Role Hierarchy (Owner → Guest)
- ✅ Permission Checks
- ✅ Schema Validation (Zod)

#### Default Features (85% Complete)
- ✅ Overview Dashboard
- ✅ Chats Clone (Chats, Calls, Status, AI, Starred, Archived, Settings, Profile)
- ✅ Members Management
- ✅ Friends System
- ✅ Pages (Notion-like)
- ✅ Databases (Notion-style tables)
- ✅ Canvas (Whiteboarding)
- ⚠️ Menu Store (Backend complete, UI needs polish)
- ⚠️ Invitations (Basic flow incomplete)

#### Optional Features (17% Complete)
- ✅ Reports (Scaffolded)
- 📋 TODO: Calendar, Tasks, Wiki, Forms, Analytics

#### Infrastructure (88% Complete)
- ✅ Schema Definitions
- ✅ Integration Tests
- ✅ Feature Scaffold Generator
- ✅ Sync Scripts
- ✅ Validation Scripts (workspace, settings, document, role, conversation, features)
- 🚧 CI/CD Pipeline (Not tested)
- 📋 TODO: E2E Tests

### 📊 Stats
- **Total Features:** 39
- **Completed:** 26 (67%)
- **In Progress:** 3 (8%)
- **Remaining:** 10 (25%)

---

## How to Read This Changelog

### Emojis
- 🎉 **Added** - New features
- 🔧 **Fixed** - Bug fixes
- 🚀 **Improved** - Enhancements
- ⚠️ **Deprecated** - Soon-to-be removed features
- 🔥 **Removed** - Removed features
- 🔒 **Security** - Security fixes

### Status Indicators
- ✅ Complete
- 🚧 In Progress
- ⚠️ Needs Work
- 📋 TODO
- 🔴 Critical Issue
- 🟡 Warning
- 🟢 All Good

---

## Migration Guides

### Migrating from Broken Workspaces (2025-01-18)

If you have workspaces created before the schema fix (2025-01-18), they may have no menus.

**Check if affected:**
```bash
pnpm run check:workspaces
```

**Auto-fix:**
```bash
pnpm run check:workspaces:fix
```

**Manual fix via Convex Dashboard:**
```typescript
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "your_workspace_id",
  mode: "replaceMenus"
})
```

**Bulk fix all broken workspaces:**
```typescript
const result = await ctx.runMutation(
  api.workspace.health.migrateAllBrokenWorkspaces,
  {}
)
console.log("Fixed:", result.fixed, "Failed:", result.failed)
```

---

## Links

- [Feature Status](./docs/FEATURE_STATUS.md) - Detailed project status
- [Knowledge Base](./docs/KNOWLEDGE_BASE.md) - Quick reference
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues
- [README](./docs/README.md) - Complete guide

---

**Maintained by:** Development Team
**Last Updated:** 2025-01-18
