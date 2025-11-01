# CMS Lite - Convex Backend Integration Guide

## Overview
CMS Lite sudah memiliki backend lengkap di `convex/features/cms_lite/`. Admin pages perlu diupdate untuk menggunakan Convex hooks instead of mock `useBackend()`.

## Current Structure

### Backend (Convex)
```
convex/features/cms_lite/
├── products/
│   ├── api/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── schema.ts
├── posts/
├── portfolio/
├── services/
├── settings/
├── navigation/
├── features/
├── quicklinks/
├── users/
├── cart/
├── wishlist/
├── comments/
├── currency/
├── storage/
├── landing/
├── permissions/
└── queries.ts (main entry)
```

### Frontend (Admin Pages)
```
frontend/features/cms-lite/features/admin/pages/
├── AdminProducts.tsx     ❌ Uses useBackend()
├── AdminPosts.tsx        ❌ Uses useBackend()
├── AdminPortfolio.tsx    ❌ Uses useBackend()
├── AdminServices.tsx     ❌ Uses useBackend()
├── AdminSettings.tsx     ❌ Uses useBackend()
├── AdminNavigation.tsx   ❌ Uses useBackend()
├── AdminFeatures.tsx     ❌ Uses useBackend()
├── AdminQuicklinks.tsx   ❌ Uses useBackend()
├── AdminUsers.tsx        ❌ Uses useBackend()
└── ... (other admin pages)
```

## Migration Pattern

### Before (Mock Backend)
```typescript
import { useBackend } from "../../../shared/hooks/useBackend";

export default function AdminProducts() {
  const backend = useBackend();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await backend.products.list();
      setProducts(result.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    await backend.products.create(data);
    loadProducts();
  };

  const handleUpdate = async (id, data) => {
    await backend.products.update({ id, ...data });
    loadProducts();
  };

  const handleDelete = async (id) => {
    await backend.products.delete({ id });
    loadProducts();
  };

  // ... render
}
```

### After (Convex)
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/frontend/shared/foundation/provider/WorkspaceProvider";

export default function AdminProducts() {
  const { currentWorkspace } = useWorkspace();
  
  // Queries (auto-refreshing)
  const products = useQuery(
    api.features.cms_lite.products.queries.list,
    currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip"
  );

  // Mutations
  const createProduct = useMutation(api.features.cms_lite.products.mutations.create);
  const updateProduct = useMutation(api.features.cms_lite.products.mutations.update);
  const deleteProduct = useMutation(api.features.cms_lite.products.mutations.delete);

  const handleCreate = async (data) => {
    if (!currentWorkspace) return;
    await createProduct({
      workspaceId: currentWorkspace._id,
      ...data
    });
    // No need to reload - Convex auto-updates!
  };

  const handleUpdate = async (id, data) => {
    if (!currentWorkspace) return;
    await updateProduct({
      workspaceId: currentWorkspace._id,
      id,
      ...data
    });
  };

  const handleDelete = async (id) => {
    if (!currentWorkspace) return;
    await deleteProduct({
      workspaceId: currentWorkspace._id,
      id
    });
  };

  // Loading state built-in
  if (products === undefined) {
    return <LoadingSpinner />;
  }

  // ... render with products data
}
```

## Key Differences

### 1. No Manual Loading
- ❌ Before: Manual `useEffect` + `useState` + loading states
- ✅ After: `useQuery` handles everything automatically

### 2. Auto-Refresh
- ❌ Before: Must call `loadProducts()` after mutations
- ✅ After: Convex auto-updates queries when data changes

### 3. Workspace Context
- All CMS Lite operations are scoped to a workspace
- Use `useWorkspace()` to get current workspace ID
- Pass `workspaceId` to all queries and mutations

### 4. Type Safety
- Convex provides full TypeScript types
- Import types from `@/convex/_generated/api`

## Step-by-Step Migration

### For Each Admin Page:

1. **Add Convex Imports**
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useWorkspace } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
```

2. **Remove useBackend**
```typescript
// Remove this
const backend = useBackend();
```

3. **Add Workspace Context**
```typescript
const { currentWorkspace } = useWorkspace();
```

4. **Replace Queries**
```typescript
// Replace useState + useEffect
const products = useQuery(
  api.features.cms_lite.products.queries.list,
  currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip"
);
```

5. **Replace Mutations**
```typescript
const createProduct = useMutation(api.features.cms_lite.products.mutations.create);
const updateProduct = useMutation(api.features.cms_lite.products.mutations.update);
const deleteProduct = useMutation(api.features.cms_lite.products.mutations.delete);
```

6. **Update Handlers**
```typescript
const handleCreate = async (data) => {
  if (!currentWorkspace) return;
  try {
    await createProduct({
      workspaceId: currentWorkspace._id,
      ...data
    });
    toast({ title: "Product created successfully" });
  } catch (err) {
    toast({ 
      title: "Error creating product", 
      description: err.message, 
      variant: "destructive" 
    });
  }
};
```

7. **Update Loading States**
```typescript
// Loading is built-in
if (products === undefined) {
  return <LoadingSpinner />;
}

if (!currentWorkspace) {
  return <div>Please select a workspace</div>;
}
```

## Available Convex APIs

Based on `convex/features/cms_lite/` structure:

### Products
- `api.features.cms_lite.products.queries.list`
- `api.features.cms_lite.products.queries.get`
- `api.features.cms_lite.products.mutations.create`
- `api.features.cms_lite.products.mutations.update`
- `api.features.cms_lite.products.mutations.delete`

### Posts
- `api.features.cms_lite.posts.queries.list`
- `api.features.cms_lite.posts.mutations.create`
- etc.

### Portfolio
- `api.features.cms_lite.portfolio.queries.list`
- `api.features.cms_lite.portfolio.mutations.create`
- etc.

**Pattern applies to all modules**: services, settings, navigation, features, quicklinks, users, cart, wishlist, comments, etc.

## Testing

After migration:
1. Open CMS admin at `/dashboard/cms-admin`
2. Test CRUD operations for each section
3. Verify auto-refresh works (data updates without reload)
4. Check workspace isolation (data only visible in correct workspace)
5. Test error handling and loading states

## Benefits of Convex

1. **Real-time Updates** - No manual refresh needed
2. **Type Safety** - Full TypeScript support
3. **Optimistic Updates** - UI updates instantly
4. **Built-in Caching** - Automatic query caching
5. **Workspace Isolation** - Data scoped per workspace
6. **Less Code** - No manual state management

## Next Steps

1. Start with one page (e.g., AdminProducts.tsx)
2. Migrate and test thoroughly
3. Apply same pattern to other pages
4. Remove `useBackend()` hook once all pages migrated
5. Update tests to use Convex
