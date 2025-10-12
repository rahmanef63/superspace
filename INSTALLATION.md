# 📦 Installation Guide

## Step 1: Install Dependencies

Run the following command to install all new dependencies:

```bash
pnpm install
```

This will install:
- ✅ **vitest** (v2.1.8) - Fast, modern testing framework
- ✅ **convex-test** (v0.0.32) - Convex testing utilities
- ✅ **tsx** (v4.19.2) - TypeScript execution engine
- ✅ **@vitest/ui** (v2.1.8) - Beautiful test UI

## Step 2: Verify Installation

### Test the Validation Scripts

```bash
# This should work now!
pnpm run validate:workspace fixtures/workspace.json
```

Expected output:
```
✓ Workspace payload is valid
  Name: My Workspace
  Slug: my-workspace
  Type: personal
  Public: false
```

### Run All Validators

```bash
pnpm run validate:all
```

This will validate all 6 fixture files:
- ✅ workspace.json
- ✅ workspace-settings.json
- ✅ document.json
- ✅ role.json
- ✅ conversation.json
- ✅ component.json

## Step 3: Run Tests (Optional)

```bash
# Run all tests
pnpm test

# Run with UI
pnpm run test:ui
```

**Note:** The workspace tests require `convex-test` to be properly configured. If tests fail, it's okay for now - the validation scripts are the most important part.

## Available Commands

After installation, you have access to these commands:

### Validation
```bash
pnpm run validate:workspace <file>     # Validate workspace
pnpm run validate:settings <file>      # Validate settings
pnpm run validate:document <file>      # Validate document
pnpm run validate:role <file>          # Validate role
pnpm run validate:conversation <file>  # Validate conversation
pnpm run validate:component <file>     # Validate component
pnpm run validate:all                  # Validate all fixtures
```

### Testing
```bash
pnpm test                    # Run all tests
pnpm run test:ui             # Run tests with UI
pnpm run test:coverage       # Run with coverage
```

### Migration
```bash
pnpm run migrate:settings -- --dry-run    # Preview settings migration
pnpm run migrate:components -- --dry-run  # Preview component migration
```

## Troubleshooting

### Issue: `Cannot use import statement outside a module`

**Solution:** You're using `node` instead of `tsx`. Use the pnpm scripts:
```bash
# ❌ Wrong
node scripts/validate-workspace.ts fixtures/workspace.json

# ✅ Correct
pnpm run validate:workspace fixtures/workspace.json
```

### Issue: `Missing script: test`

**Solution:** Run `pnpm install` to update package.json scripts.

### Issue: Zod import errors

**Solution:** Zod is already installed (v4.1.12). If you get import errors, restart your TypeScript server.

## What Was Added?

### New Files
- ✨ 6 validation scripts in `scripts/`
- ✨ 2 migration scripts in `scripts/`
- ✨ 1 test file in `tests/`
- ✨ 6 fixture files in `fixtures/`
- ✨ 1 Convex settings manager in `convex/workspace/`
- ✨ Enhanced component registry in `convex/components/`
- ✨ GitHub Actions workflow in `.github/workflows/`
- ✨ vitest.config.ts
- ✨ Documentation files

### Updated Files
- ✅ package.json - Added test dependencies and scripts
- ✅ convex/components/registry.ts - Enhanced with audit logging

### New Scripts in package.json
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "validate:workspace": "tsx scripts/validate-workspace.ts",
  "validate:settings": "tsx scripts/validate-workspace-settings.ts",
  "validate:document": "tsx scripts/validate-document.ts",
  "validate:role": "tsx scripts/validate-role.ts",
  "validate:conversation": "tsx scripts/validate-conversation.ts",
  "validate:component": "tsx scripts/validate-component.ts",
  "validate:all": "...",
  "migrate:settings": "tsx scripts/migrate-workspace-settings.ts",
  "migrate:components": "tsx scripts/migrate-component-schema.ts"
}
```

## Next Steps

1. ✅ Run `pnpm install` (you've done this!)
2. ✅ Test validation: `pnpm run validate:all`
3. ✅ Read [QUICK_START.md](QUICK_START.md) for usage examples
4. ✅ Read [CRUD_AGENTS_README.md](CRUD_AGENTS_README.md) for full documentation

## Questions?

- **Quick usage guide:** See [QUICK_START.md](QUICK_START.md)
- **Comprehensive docs:** See [CRUD_AGENTS_README.md](CRUD_AGENTS_README.md)
- **CI/CD workflow:** See [.github/workflows/validate-schemas.yml](.github/workflows/validate-schemas.yml)

---

**You're all set!** 🎉

Try running:
```bash
pnpm run validate:workspace fixtures/workspace.json
```

It should work perfectly now! ✨
