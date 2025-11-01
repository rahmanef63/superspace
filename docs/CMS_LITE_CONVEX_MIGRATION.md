## Migration Guide: CMS Lite Admin Pages to Convex

### Files Updated

1. **lib/backend.ts** - Migrated to use Convex hooks
2. **contexts/CartContext.tsx** - Now uses Convex queries/mutations
3. **contexts/CurrencyContext.tsx** - Now uses Convex queries
4. **contexts/LanguageContext.tsx** - Added "use client" directive
5. **contexts/ThemeContext.tsx** - Now uses Convex queries for settings

### Admin Pages Migration Status

The admin pages (`AdminDashboard.tsx`, `AdminFeatures.tsx`, `AdminAI.tsx`, etc.) currently use `useBackend()` hook which returns mock data.

### To Complete Convex Integration:

#### Step 1: Add workspaceId to Admin Pages

Each admin page needs access to the current `workspaceId`. This should come from:
- URL params (if CMS is workspace-scoped)
- Context provider
- Or global state

Example:
```tsx
export default function AdminDashboard({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  const resolvedParams = use(params);
  const workspaceId = resolvedParams.workspaceId as Id<"workspaces">;
  
  // Now use Convex hooks
  const products = useQuery(api.features.cms_lite.products.queries.list, { workspaceId });
  const posts = useQuery(api.features.cms_lite.posts.queries.list, { workspaceId });
  const portfolio = useQuery(api.features.cms_lite.portfolio.queries.list, { workspaceId });
  
  // ...rest of component
}
```

#### Step 2: Replace useBackend() with Convex Hooks

**Before (using mock backend):**
```tsx
const backend = useBackend();
const products = await backend.products.listAll({});
```

**After (using Convex):**
```tsx
// For queries (reading data)
const products = useQuery(api.features.cms_lite.products.queries.list, { workspaceId });

// For mutations (writing data)  
const createProduct = useMutation(api.features.cms_lite.products.mutations.create);
await createProduct({ workspaceId, ...productData });
```

#### Step 3: Update Data Loading Pattern

**Before (async/await with useEffect):**
```tsx
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  const data = await backend.products.listAll({});
  setProducts(data.products);
};
```

**After (reactive with Convex):**
```tsx
// Convex queries are reactive - no useEffect needed!
const products = useQuery(api.features.cms_lite.products.queries.list, { workspaceId });

// Handle loading state
if (products === undefined) return <Loading />;
```

#### Step 4: Update Mutations

**Before:**
```tsx
const handleCreate = async () => {
  await backend.products.create(formData);
  loadData(); // Manual refresh
};
```

**After:**
```tsx
const createProduct = useMutation(api.features.cms_lite.products.mutations.create);

const handleCreate = async () => {
  await createProduct({ workspaceId, ...formData });
  // No manual refresh needed - Convex auto-updates!
};
```

### Example: AdminDashboard Migration

See `docs/CMS_LITE_ADMIN_DASHBOARD_CONVEX_EXAMPLE.md` for complete example.

### AI/Chatbot Special Considerations

The AI features (`AdminAI.tsx`, `AdminAIAnalytics.tsx`, `AdminAISettings.tsx`) may need custom Convex functions since they're not standard CRUD operations.

You'll need to create:
```
convex/features/cms_lite/ai/
  queries.ts  - getStats, getErrors, listKBDocuments
  mutations.ts - updateSettings, createKBDocument, deleteKBDocument
  schema.ts - AI-specific tables
```

### Context Providers Update

All context providers now require `workspaceId` prop:

```tsx
<CartProvider workspaceId={workspaceId}>
  <CurrencyProvider workspaceId={workspaceId}>
    <ThemeProvider workspaceId={workspaceId}>
      {children}
    </ThemeProvider>
  </CurrencyProvider>
</CartProvider>
```

### Testing

1. Start Convex dev: `npx convex dev`
2. Ensure all tables exist in schema
3. Test each admin page individually
4. Check browser console for errors

### Troubleshooting

**Error: "Query not found"**
- Check the API path is correct
- Ensure query/mutation is exported in Convex file

**Error: "workspaceId required"**
- All operations need workspaceId parameter
- Add it to function arguments

**Data not updating**
- Check mutation is being called correctly
- Verify permission checks in Convex

### Next Steps

1. ✅ Migrate contexts (DONE)
2. ⏳ Add workspaceId to admin route structure
3. ⏳ Migrate AdminDashboard (example provided)
4. ⏳ Migrate remaining admin pages
5. ⏳ Create AI-specific Convex functions
6. ⏳ Test all functionality

