# 🚀 Quick Start Guide - CRUD Agents

## Installation

First, install the new dependencies:

```bash
pnpm install
```

This will install:
- `vitest` - Testing framework
- `convex-test` - Convex testing utilities
- `tsx` - TypeScript execution
- `@vitest/ui` - Test UI

## 📝 Validation Scripts

### Run Individual Validators

```bash
# Validate workspace
pnpm run validate:workspace fixtures/workspace.json

# Validate settings
pnpm run validate:settings fixtures/workspace-settings.json

# Validate document
pnpm run validate:document fixtures/document.json

# Validate role
pnpm run validate:role fixtures/role.json

# Validate conversation
pnpm run validate:conversation fixtures/conversation.json

# Validate component
pnpm run validate:component fixtures/component.json
```

### Run All Validators

```bash
pnpm run validate:all
```

### Example Output

```
✓ Workspace payload is valid
  Name: My Workspace
  Slug: my-workspace
  Type: personal
  Public: false
```

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Run Specific Test File

```bash
pnpm test tests/workspaces.test.ts
```

### Run Tests with UI

```bash
pnpm run test:ui
```

### Run Tests with Coverage

```bash
pnpm run test:coverage
```

## 🔄 Migration Scripts

### Workspace Settings Migration

```bash
# Dry run (preview changes)
CONVEX_URL=https://your-deployment.convex.cloud pnpm run migrate:settings -- --dry-run

# Apply changes
CONVEX_URL=https://your-deployment.convex.cloud pnpm run migrate:settings
```

### Component Schema Migration

```bash
# Dry run (preview changes)
CONVEX_URL=https://your-deployment.convex.cloud pnpm run migrate:components -- --dry-run

# Apply changes
CONVEX_URL=https://your-deployment.convex.cloud pnpm run migrate:components
```

## 📚 Available Scripts

### Testing
- `pnpm test` - Run all tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

### Validation
- `pnpm run validate:workspace <file>` - Validate workspace payload
- `pnpm run validate:settings <file>` - Validate settings payload
- `pnpm run validate:document <file>` - Validate document payload
- `pnpm run validate:role <file>` - Validate role payload
- `pnpm run validate:conversation <file>` - Validate conversation payload
- `pnpm run validate:component <file>` - Validate component payload
- `pnpm run validate:all` - Validate all fixtures

### Migration
- `pnpm run migrate:settings` - Migrate workspace settings
- `pnpm run migrate:components` - Migrate component schemas

## 🎯 Usage Examples

### 1. Validate Your Own Payload

Create a JSON file:

```json
// my-workspace.json
{
  "name": "Development Workspace",
  "slug": "dev-workspace",
  "type": "organization",
  "isPublic": false,
  "description": "Our development workspace"
}
```

Validate it:

```bash
pnpm run validate:workspace my-workspace.json
```

### 2. Run Tests Before Committing

```bash
pnpm test
```

### 3. Check Settings Migration Impact

```bash
# See what will change without applying
CONVEX_URL=https://your-deployment.convex.cloud pnpm run migrate:settings -- --dry-run
```

## 🔧 Troubleshooting

### Error: Cannot use import statement outside a module

**Solution:** Make sure you're using `tsx` to run TypeScript files:
```bash
pnpm run validate:workspace fixtures/workspace.json
# NOT: node scripts/validate-workspace.ts
```

### Error: CONVEX_URL environment variable is required

**Solution:** Set your Convex URL:
```bash
# In .env.local
CONVEX_URL=https://your-deployment.convex.cloud

# Or pass it directly
CONVEX_URL=https://your-deployment.convex.cloud pnpm run migrate:settings
```

### Error: Missing script: test

**Solution:** Run `pnpm install` to install new dependencies and update scripts.

## 📖 More Information

See [CRUD_AGENTS_README.md](CRUD_AGENTS_README.md) for comprehensive documentation including:
- Sub-agent details
- Convex functions reference
- API usage examples
- Audit logging
- Contributing guidelines

## 🎨 CI/CD

The validation scripts run automatically on every PR via GitHub Actions.

See [.github/workflows/validate-schemas.yml](.github/workflows/validate-schemas.yml)

## 📞 Support

For issues or questions:
1. Check [CRUD_AGENTS_README.md](CRUD_AGENTS_README.md)
2. Review the fixture files in `fixtures/` for examples
3. Run validators with `--help` flag (coming soon)

---

**Generated with Claude Code** 🤖
