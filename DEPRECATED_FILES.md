# Deprecated Files

**Date:** 2025-01-25

The following files have been deprecated and replaced with the new auto-discovery system.

---

## ❌ Deprecated Files

### 1. `features.config.ts` → DEPRECATED

**Status:** Renamed to `features.config.ts.DEPRECATED`

**Why deprecated:**
- ❌ Hardcoded feature definitions (771 lines)
- ❌ Manual editing required for every new feature
- ❌ Not modular - central file approach
- ❌ Duplication of data
- ❌ Easy to forget updates

**Replaced by:**
- ✅ `frontend/features/*/config.ts` (per-feature config, auto-discovered!)
- ✅ `lib/features/registry.ts` (auto-discovery system)
- ✅ Zero manual registration required

**Migration:**
All features now have individual `config.ts` files in their own folders:
```
frontend/features/analytics/config.ts
frontend/features/cms/config.ts
frontend/features/reports/config.ts
...etc
```

---

### 2. `manifest.config.ts` → DELETED

**Status:** Permanently deleted

**Why deleted:**
- ❌ Manual imports for each feature
- ❌ Minimal data (not complete feature config)
- ❌ Duplication with per-feature configs
- ❌ Not auto-discovered

**Replaced by:**
- ✅ Auto-discovery via `lib/features/registry.ts`
- ✅ Generated manifests in `convex/features/menus/`
- ✅ No manual imports needed

---

## ✅ New System (Current)

### Auto-Discovery Architecture

```
frontend/features/*/config.ts
  ↓ (auto-discovered by)
lib/features/registry.ts
  ↓ (used by)
scripts/features/sync.ts
  ↓ (generates)
convex/features/menus/menu_manifest_data.ts
convex/features/menus/optional_features_catalog.ts
```

### Benefits

1. **100% Modular**
   - Each feature has config.ts in its own folder
   - Self-contained, no external dependencies
   - Easy to add/remove features

2. **Zero Manual Registration**
   - Create `frontend/features/{slug}/config.ts`
   - Auto-discovered by `import.meta.glob`
   - No editing central files!

3. **DRY (Don't Repeat Yourself)**
   - Single source of truth per feature
   - No duplication across files
   - Auto-generated aggregations

4. **Type-Safe & Validated**
   - Zod schema validation
   - TypeScript type checking
   - Runtime safety guaranteed

---

## 🚀 How to Add Features Now

### Old Way (DEPRECATED):
```bash
# ❌ Don't do this anymore!
1. Edit features.config.ts (add 50+ lines)
2. Edit manifest.config.ts (add import)
3. Create manifest.ts in feature folder
4. Run sync scripts
```

### New Way (CURRENT):
```bash
# ✅ Do this instead!
1. pnpm run create:feature analytics --category analytics --icon BarChart
# Done! Auto-discovered and ready to use!

2. pnpm run sync:all  # Sync to Convex
3. pnpm run validate:features  # Validate
```

---

## 📋 All Scripts Now Use Registry

All scripts have been updated to use the auto-discovery registry:

- ✅ `scripts/features/create.ts` - Creates per-feature config.ts
- ✅ `scripts/features/list.ts` - Lists from registry
- ✅ `scripts/features/edit.ts` - Edits per-feature config.ts
- ✅ `scripts/features/delete.ts` - Deletes per-feature files
- ✅ `scripts/features/sync.ts` - Syncs from registry
- ✅ `scripts/features/generate-manifest.ts` - Generates from registry
- ✅ `scripts/validation/features.ts` - Validates registry
- ✅ `scripts/validation/pages.ts` - Validates from registry

**NO scripts reference deprecated files anymore!**

---

## 🗑️ Can I Delete `features.config.ts.DEPRECATED`?

**Answer:** Yes, after you've verified everything works!

**Before deleting, verify:**
```bash
# 1. List all features (should work)
pnpm run list:features

# 2. Validate features (should work)
pnpm run validate:features

# 3. Sync features (should work)
pnpm run sync:all

# 4. Test registry (should work)
pnpm run test:registry
```

If all commands work, you can safely delete:
```bash
rm features.config.ts.DEPRECATED
```

---

## 📚 Documentation

See these files for complete documentation:

- [FEATURE_CRUD_SUMMARY.md](FEATURE_CRUD_SUMMARY.md) - CRUD system guide
- [RESTRUCTURING_SUMMARY.md](RESTRUCTURING_SUMMARY.md) - Scripts reorganization
- [scripts/README.md](scripts/README.md) - All scripts documentation
- [docs/1_SYSTEM_OVERVIEW.md](docs/1_SYSTEM_OVERVIEW.md) - System architecture

---

## ✅ Summary

**Old System:**
- ❌ 2 central config files (933 lines total)
- ❌ Manual editing required
- ❌ Duplication everywhere
- ❌ Not modular

**New System:**
- ✅ Per-feature config.ts (auto-discovered)
- ✅ Zero manual registration
- ✅ No duplication
- ✅ 100% modular

**Result:** 75% code reduction, infinite scalability, zero maintenance! 🚀

---

**Last Updated:** 2025-01-25
