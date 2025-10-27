# Feature Scripts

Scripts untuk mengelola dan menganalisis features di SuperSpace app.

## 📦 Available Scripts

### 1. `analyze-feature.ts` - Feature Analyzer

Script untuk menganalisis informasi lengkap tentang suatu feature dan menyimpannya sebagai dokumentasi.

#### Features:
- ✅ Analyze file structure (frontend + convex)
- ✅ Detect components, hooks, stores, types
- ✅ Extract CRUD operations (queries, mutations, actions)
- ✅ List permissions & RBAC
- ✅ Show dependencies & exports
- ✅ Interactive selection dengan keyboard navigation
- ✅ Auto-save ke `docs/features/` dengan prefix date

#### Usage:

**Langsung analyze feature:**
```bash
pnpm run analyze:feature <feature-name>
```

**Interactive selection (keyboard up/down):**
```bash
pnpm run analyze:feature --list
# atau
pnpm run analyze:feature -l
```

**Save analysis ke file:**
```bash
pnpm run analyze:feature cms --save
# Output: docs/features/2025-10-27-cms.md
```

**Custom output path:**
```bash
pnpm run analyze:feature cms --save --output custom/path.md
```

**JSON output:**
```bash
pnpm run analyze:feature cms --json
```

#### Examples:

```bash
# Analyze chat feature (console only)
pnpm run analyze:feature chat

# Analyze and save to docs/features/
pnpm run analyze:feature chat --save

# Interactive selection
pnpm run analyze:feature --list

# Custom output location
pnpm run analyze:feature cms --save --output reports/cms-analysis.md
```

#### Output Format:

Ketika menggunakan `--save`, file akan disimpan di `docs/features/` dengan format:
```
docs/features/{YYYY-MM-DD}-{feature-id}.md
```

Contoh:
- `docs/features/2025-10-27-cms.md`
- `docs/features/2025-10-27-chat.md`

#### Information Analyzed:

1. **Basic Information**
   - ID, Name, Description
   - Category, Status, Version

2. **Capabilities**
   - Has UI, Has Convex, Has Tests, Has Settings
   - Permissions (RBAC)

3. **Frontend Structure**
   - Total files, Components, Hooks, Stores, Types
   - Detailed list of components and hooks

4. **Convex Backend**
   - Queries (Read operations)
   - Mutations (Write operations)
   - Actions (Async operations)
   - With file locations

5. **Dependencies**
   - External packages
   - Key exports

---

### 2. `list.ts` - Feature List

List all features in the registry.

```bash
pnpm run list:features
pnpm run list:features --type optional
pnpm run list:features --category analytics
```

---

### 3. `create.ts` - Create Feature

Create a new feature with scaffolding.

```bash
pnpm run create:feature
```

---

### 4. `sync.ts` - Sync Features

Sync features with the registry.

```bash
pnpm run sync:features
```

---

## 📁 Output Structure

```
docs/
└── features/
    ├── 2025-10-27-cms.md
    ├── 2025-10-27-chat.md
    ├── 2025-10-27-database.md
    └── ...
```

## 🔧 Development

### Adding New Analysis Features

Edit `scripts/features/analyze-feature.ts`:

1. Update `FeatureAnalysis` interface
2. Add new analysis functions
3. Update `analyzeFeature()` function
4. Update `displayAnalysis()` for console output
5. Update `formatAsMarkdown()` for file output

### Testing

```bash
# Test with different features
pnpm run analyze:feature cms --save
pnpm run analyze:feature chat --save
pnpm run analyze:feature --list

# Verify output
ls docs/features/
cat docs/features/2025-10-27-cms.md
```

## 📚 Related Documentation

- [Feature Reference](../../docs/5_FEATURE_REFERENCE.md)
- [Developer Guide](../../docs/2_DEVELOPER_GUIDE.md)
- [Architecture](../../docs/architecture/)

---

**Note:** Semua scripts menggunakan feature registry system yang auto-discover features dari `frontend/features/*/config.ts`.
