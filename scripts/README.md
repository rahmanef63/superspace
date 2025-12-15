# Scripts Directory

This directory contains all development and maintenance scripts for the SuperSpace project, organized by purpose.

## Directory Structure

```
scripts/
├── build/          # Build and development tools
├── features/       # Feature management (scaffold, sync, generate)
├── validation/     # Schema and data validation
├── migration/      # Database and schema migrations
└── health/         # System health checks
```

---

## 📁 Categories

### 🏗️ Build (`build/`)

Build and development tooling scripts.

| Script | Command | Description |
|--------|---------|-------------|
| `clear-cache.sh` | - | Clear all caches and rebuild project |
| `run-convex-dev.sh` | - | Run Convex development server |

**Usage:**
```bash
# Clear cache and rebuild
./scripts/build/clear-cache.sh

# Run Convex dev server
./scripts/build/run-convex-dev.sh
```

---

### ⚙️ Features (`features/`)

**Full CRUD operations** for the feature system with auto-discovery support.

#### Create, Read, Update, Delete (CRUD)

| Script | Command | Description |
|--------|---------|-------------|
| `create.ts` | `pnpm run create:feature` | **Create** a new feature with auto-discovered config.ts |
| `list.ts` | `pnpm run list:features` | **Read/List** all features with filtering options |
| `edit.ts` | `pnpm run edit:feature` | **Update** feature config with maintenance mode |
| `delete.ts` | `pnpm run delete:feature` | **Delete** feature safely or archive it |

#### Management Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `sync.ts` | `pnpm run sync:features` | Sync features to Convex manifests |
| `generate-manifest.ts` | `pnpm run generate:manifest` | Generate React component manifest |
| `test-registry.ts` | `pnpm run test:registry` | Test the auto-discovery registry |

**Usage:**

```bash
# CREATE - New feature (auto-discovered!)
pnpm run create:feature analytics --type optional --category analytics --icon BarChart
# ✅ Generates: frontend/features/analytics/config.ts (auto-discovered!)
# ✅ No manual registration needed!

# READ - List all features
pnpm run list:features
pnpm run list:features --type optional
pnpm run list:features --category analytics --status development

# UPDATE - Edit feature
pnpm run edit:feature analytics --set-ready true --status stable
pnpm run edit:feature analytics --maintenance  # Enable maintenance mode
pnpm run edit:feature analytics --version 2.0.0 --backup

# DELETE - Remove feature
pnpm run delete:feature analytics --confirm
pnpm run delete:feature analytics --archive  # Safer: move to archive/

# SYNC - Sync all features
pnpm run sync:all

# TEST - Test auto-discovery
pnpm run test:registry
```

**Key Features:**

✅ **Zero Hardcoding**
- Creates `frontend/features/{slug}/config.ts` (auto-discovered)
- NO editing of `features.config.ts` (deprecated file!)
- Auto-discovery via `lib/features/registry.ts`

✅ **Maintenance Mode Support**
- Put features in maintenance mode while editing
- Rollback to previous version if needed
- Users see maintenance message automatically

✅ **Detailed Error Messages**
- Shows exact file path and field for errors
- Example: `frontend/features/analytics/config.ts (field: ui.icon)`
- No more "undefined" errors!

✅ **Safe Operations**
- Backup support before editing
- Archive instead of delete
- Confirmation required for destructive operations

**Architecture:**
```
pnpm run create:feature my-feature
  ↓
Creates: frontend/features/my-feature/config.ts
  ↓
Auto-discovered by: lib/features/registry.ts
  ↓
pnpm run sync:all
  ↓
Synced to: convex/features/menus/menu_manifest_data.ts
  ↓
✅ Feature ready! (NO manual editing!)

---

### ✅ Validation (`validation/`)

Schema and data validation scripts (all Zod-based).

| Script | Command | Description |
|--------|---------|-------------|
| `features.ts` | `pnpm run validate:features` | Validate features.config.ts schema |
| `pages.ts` | `pnpm run validate:pages` | Validate feature pages exist |
| `workspace.ts` | `pnpm run validate:workspace` | Validate workspace schema |
| `settings.ts` | `pnpm run validate:settings` | Validate workspace settings |
| `document.ts` | `pnpm run validate:document` | Validate document schema |
| `role.ts` | `pnpm run validate:role` | Validate role schema |
| `conversation.ts` | `pnpm run validate:conversation` | Validate conversation schema |
| `component.ts` | `pnpm run validate:component` | Validate component schema |

**Usage:**
```bash
# Validate all schemas
pnpm run validate:all

# Validate specific schema
pnpm run validate:features
pnpm run validate:workspace fixtures/workspace.json
```

**Requirements:**
- All schemas use Zod for runtime validation
- Fixtures are in `fixtures/` directory
- All validation must pass before commits

---

### 🔄 Migration (`migration/`)

Database and schema migration scripts.

| Script | Command | Description |
|--------|---------|-------------|
| `settings.ts` | `pnpm run migrate:settings` | Migrate workspace settings schema |
| `components.ts` | `pnpm run migrate:components` | Migrate component schema |

**Usage:**
```bash
# Run migrations
pnpm run migrate:settings
pnpm run migrate:components
```

**Important:**
- Always backup data before running migrations
- Test migrations in development first
- Migrations should be idempotent (safe to run multiple times)

---

### 🏥 Health (`health/`)

System health checks and diagnostics.

| Script | Command | Description |
|--------|---------|-------------|
| `check-workspaces.ts` | `pnpm run check:workspaces` | Check workspace health |
| `check-workspaces.ts --fix` | `pnpm run check:workspaces:fix` | Fix workspace issues automatically |

**Usage:**
```bash
# Check workspace health
pnpm run check:workspaces

# Auto-fix issues
pnpm run check:workspaces:fix
```

---

## 🚀 Common Workflows

### Adding a New Feature

```bash
# 1. Scaffold the feature
pnpm run scaffold:feature analytics --type optional --category analytics

# 2. Implement your feature (UI + Backend)
# ... edit files in frontend/features/analytics/
# ... edit files in convex/features/analytics/

# 3. Sync manifests
pnpm run sync:all

# 4. Validate everything
pnpm run validate:all

# 5. Test
pnpm test
```

### Pre-Commit Checks

```bash
# Run all pre-commit checks (lint, validate, test)
pnpm run precommit
```

### Feature Validation Workflow

```bash
# Check features config
pnpm run validate:features

# Sync features to manifests
pnpm run sync:features

# Generate React manifest
pnpm run generate:manifest

# Or run all at once
pnpm run sync:all
```

---

## 📝 Development Guidelines

### Writing New Scripts

1. **Choose the right category** - Place script in appropriate subfolder
2. **Use TypeScript** - All new scripts should be `.ts` files
3. **Add to package.json** - Add npm script for easy execution
4. **Document here** - Update this README with usage
5. **Follow conventions** - Use existing scripts as templates

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `check-workspaces.ts`)
- **Commands**: `category:action` (e.g., `validate:features`)
- **Scripts should be**: Idempotent, well-documented, with clear error messages

### Testing Scripts

Always test scripts in development before committing:

```bash
# Test the script manually
tsx scripts/category/script-name.ts

# Or via npm script
pnpm run script:name
```

---

## 🗑️ Removed Files

The following old/redundant scripts have been removed:

- ❌ `clear-cache-rebuild.js` (replaced by `build/clear-cache.sh`)
- ❌ `clear-cache-rebuild.py` (replaced by `build/clear-cache.sh`)
- ❌ `convex-dev.js` (use `npx convex dev` instead)
- ❌ `convex-dev.py` (use `npx convex dev` instead)
- ❌ `diagnose-features.ts` (merged into `validation/features.ts`)
- ❌ `scripts/package.json` (not needed)

---

## 📚 Related Documentation

- [System Overview](../docs/core/01-SYSTEM-OVERVIEW.md) - Architecture overview
- [Developer Guide](../docs/core/02-DEVELOPER-GUIDE.md) - Development workflows
- [Feature Reference](../docs/core/05-FEATURE-REFERENCE.md) - Feature system details
- [Feature Rules](../docs/rules/01-FEATURE-RULES.md) - Development rules

---

**Last Updated:** 2025-12-15
**Maintained by:** SuperSpace Dev Team
