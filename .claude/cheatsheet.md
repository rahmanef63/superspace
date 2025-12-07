# SuperSpace Cheatsheet

## 🚀 **Daily Commands**
```bash
# Start development
pnpm dev

# Create feature
pnpm run create:feature my-feature

# Analyze feature
pnpm run analyze:feature my-feature --save

# Validate everything (SEBELUM COMMIT!)
pnpm run validate:all

# Run tests
pnpm test
```

## 🔥 **Feature Development**

### Create New Feature
```bash
# Interactive
pnpm run create:feature

# Direct
pnpm run create:feature awesome-feature

# Edit config
pnpm run edit:feature awesome-feature
```

### Feature Structure
```
frontend/features/awesome-feature/
├── config.ts          # ⭐ Edit this first!
├── components/
│   └── AwesomeFeature.tsx
├── hooks/
│   └── useAwesomeFeature.ts
└── index.ts           # Exports

convex/features/awesome-feature/
├── queries.ts
├── mutations.ts       # ⭐ 6-step pattern!
├── schema.ts
└── actions.ts
```

## 📝 **Mutation Template (6 Steps)**
```typescript
export const createSomething = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // 1. Permission check
    const workspace = await ctx.db.get(args.workspaceId);
    if (!hasPermission(ctx.user, workspace, "create")) {
      throw new Error("Unauthorized");
    }

    // 2. Input validation
    const validated = createSchema.parse(args);

    // 3. Workspace verification
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // 4. User authentication
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthenticated");
    }

    // 5. Business logic
    const result = await ctx.db.insert("something", {
      ...validated,
      createdAt: Date.now(),
      createdBy: user.tokenIdentifier,
    });

    // 6. Audit logging
    await ctx.db.insert("audit", {
      action: "create",
      entity: "something",
      entityId: result,
      userId: user.tokenIdentifier,
      workspaceId: args.workspaceId,
      timestamp: Date.now(),
    });

    return result;
  },
});
```

## 🎯 **RBAC Permission Check**
```typescript
// Permission levels: 0 (Owner) → 90 (Guest)
const hasPermission = (user, workspace, action: string) => {
  const userLevel = getPermissionLevel(user.role);
  const requiredLevel = getRequiredLevel(action);
  return userLevel <= requiredLevel;
};
```

## 🔍 **Common Debugging**

### Feature Not Showing?
1. Check `frontend/features/*/config.ts`
2. Run `pnpm run sync:all`
3. Check `lib/features/registry.server.ts`

### Validation Errors?
```bash
pnpm run validate:all
# atau specific
pnpm run validate:features
pnpm run validate:permissions
```

### Test Not Passing?
```bash
# Run specific test
pnpm test path/to/test.test.ts

# Run with coverage
pnpm run test:coverage
```

## 🛠️ **Common Tasks**

### Add New Property Type
1. Edit `convex/features/database/propertyTypes.ts`
2. Add UI component in `frontend/features/database/components/properties/`
3. Update schema in `convex/schema.ts`

### Add New View Layout
1. Create component in `frontend/features/database/views/`
2. Register in `frontend/features/database/config.ts`
3. Add layout logic in `convex/features/database/queries.ts`

### Fix Permissions
```typescript
// Check current user
const user = await ctx.auth.getUserIdentity();

// Check workspace
const workspace = await ctx.db.get(workspaceId);

// Check permission
if (!hasPermission(user, workspace, "read")) {
  throw new Error("Unauthorized");
}
```

## 📚 **Quick Documentation Lookup**
- System Overview: `docs/1-core/1_SYSTEM_OVERVIEW.md`
- Feature Rules: `docs/2-rules/FEATURE_RULES.md`
- Mutation Guide: `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md`
- Universal DB: `docs/3-universal-database/`
- All Features: `pnpm run list:features`

## 🚨 **Remember**
- ✅ ALWAYS validate with Zod
- ✅ ALWAYS check permissions (RBAC)
- ✅ ALWAYS log mutations (audit)
- ✅ NEVER hardcode features
- ✅ ALWAYS write tests
- ✅ ALWAYS run `validate:all` before commit