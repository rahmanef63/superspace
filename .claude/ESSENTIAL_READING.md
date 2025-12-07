# 📖 Essential Reading for SuperSpace Development

## 🎯 **Must-Read Order (New Developers)**

### 1. **Start Here** (5 min)
- `docs/00_BASE_KNOWLEDGE.md` - Core concepts & terminology
- `.claude/PROJECT_QUICK_REFERENCE.md` - Quick commands reference

### 2. **Architecture** (15 min)
- `docs/1-core/1_SYSTEM_OVERVIEW.md` - Complete system architecture
- `docs/1-core/2_TECH_STACK.md` - Tech decisions & rationale

### 3. **Critical Rules** (10 min)
- `docs/2-rules/FEATURE_RULES.md` - ⚠️ MUST FOLLOW rules
- `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md` - Backend patterns
- `docs/2-rules/PERMISSIONS_GUIDE.md` - RBAC implementation

### 4. **Feature System** (20 min)
- `docs/5-features/FEATURE_REGISTRY_SYSTEM.md` - Auto-discovery magic
- `docs/5-features/FEATURE_STRUCTURE.md` - Feature anatomy
- `docs/5-features/CREATING_FEATURES.md` - Step-by-step guide

### 5. **Universal Database** (30 min)
- `docs/3-universal-database/1_PROPERTY_SYSTEM.md` - 21 property types
- `docs/3-universal-database/2_VIEW_SYSTEM.md` - 10 view layouts
- `docs/3-universal-database/3_FILTER_SYSTEM.md` - Universal filters

## 🔥 **For Specific Tasks**

### Working on Features?
- `docs/5-features/FEATURE_REGISTRY_SYSTEM.md`
- `docs/5-features/FEATURE_CONFIG_GUIDE.md`
- Check `frontend/features/*/config.ts` examples

### Backend Development?
- `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md`
- `docs/2-rules/PERMISSIONS_GUIDE.md`
- `docs/1-core/4_CONVEX_PATTERNS.md`

### UI Components?
- `docs/1-core/3_UI_COMPONENT_SYSTEM.md`
- Check `components/README.md`
- Look at existing components in `components/ui/`

### Database Work?
- `docs/3-universal-database/`
- `convex/schema.ts`
- Check `convex/features/database/`

## 🚨 **Critical Rules Summary**

### Never Do This
- ❌ Hardcode feature names/paths
- ❌ Skip permission checks
- ❌ Forget audit logging
- ❌ Bypass Zod validation
- ❌ Edit generated files (`convex/_generated/`)

### Always Do This
- ✅ Use auto-discovery system
- ✅ Follow 6-step mutation pattern
- ✅ Check RBAC permissions
- ✅ Log all mutations
- ✅ Validate with Zod
- ✅ Write tests
- ✅ Run `validate:all` before commit

## 📝 **Common Workflows**

### 1. Creating a New Feature
```bash
# Read: docs/5-features/CREATING_FEATURES.md
pnpm run create:feature my-feature
# Edit: frontend/features/my-feature/config.ts
pnpm run sync:all
```

### 2. Adding a Mutation
```bash
# Read: docs/2-rules/MUTATION_TEMPLATE_GUIDE.md
# Follow 6-step pattern exactly
```

### 3. Fixing Permission Issues
```bash
# Read: docs/2-rules/PERMISSIONS_GUIDE.md
# Check RBAC levels (0-90)
# Use hasPermission helper
```

## 🎯 **Key Mental Models**

### 1. Auto-Discovery
- Features are NOT registered manually
- Everything comes from `config.ts`
- Glob patterns find everything

### 2. Three-Tier Architecture
- Global (`frontend/shared/`, `convex/shared/`)
- Feature (`{feature}/shared/`)
- Local (specific files)

### 3. Permission First
- Every mutation checks permissions
- Workspace isolation is mandatory
- Audit logs are immutable

### 4. Schema-Driven
- Zod validates everything
- TypeScript infers from schema
- Generated types are source of truth

## 🔗 **Quick Links**

### Documentation
- All docs: `docs/`
- Feature docs: `docs/features/`
- API docs: `docs/api/`

### Code Examples
- Feature configs: `frontend/features/*/config.ts`
- Mutations: `convex/features/*/mutations.ts`
- Components: `frontend/features/*/components/`

### Tools
- Validation: `scripts/validate-*.ts`
- Feature CLI: `scripts/features/`
- Tests: `tests/`

## 💡 **Pro Tips**

1. **Lost?** Run `pnpm run analyze:feature <name>`
2. **Error?** Check `pnpm run validate:all`
3. **New feature?** Copy existing config
4. **Permission bug?** Check RBAC levels
5. **Type error?** Regenerate with `pnpm dev`

## 🎓 **Learning Path**

1. **Day 1:** Read "Start Here" section + explore codebase
2. **Day 2:** Read "Architecture" + understand file structure
3. **Day 3:** Read "Critical Rules" + try fix a bug
4. **Day 4:** Read "Feature System" + create a simple feature
5. **Day 5:** Read "Universal Database" + understand data model

Remember: This is a sophisticated, production-grade system. Take time to understand the patterns before making changes.