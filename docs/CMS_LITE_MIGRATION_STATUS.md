# CMS Lite - Convex Migration Summary

## ✅ Yang Sudah Selesai

### 1. **Backend & Core Infrastructure**

#### `frontend/features/cms-lite/lib/backend.ts`
- ✅ Diganti dari REST API client ke Convex hooks
- ✅ Sekarang export `useConvex`, `useMutation`, `useQuery`, dan `api`
- ✅ Deprecated warning ditambahkan untuk migrasi bertahap

#### `frontend/features/cms-lite/shared/hooks/useConvexBackend.ts` (BARU)
- ✅ Hook baru untuk operasi backend menggunakan Convex
- ✅ Menyediakan interface yang terstruktur untuk semua fitur CMS
- ✅ Mendukung: products, posts, portfolio, services, settings, navigation, features, quicklinks, AI, landing, cart, wishlist, currency, storage

### 2. **Context Providers** - Semua Sudah Migrasi ke Convex

#### `frontend/features/cms-lite/contexts/CartContext.tsx`
- ✅ Sekarang menggunakan `useQuery` dan `useMutation` dari Convex
- ✅ Membutuhkan `workspaceId` sebagai prop
- ✅ Auto-reactive - tidak perlu manual refresh
- ✅ Real-time updates otomatis dari Convex

#### `frontend/features/cms-lite/contexts/CurrencyContext.tsx`
- ✅ Query currency rates dari Convex
- ✅ Membutuhkan `workspaceId` sebagai prop
- ✅ Format currency tetap menggunakan Intl.NumberFormat

#### `frontend/features/cms-lite/contexts/LanguageContext.tsx`
- ✅ Tambah "use client" directive
- ✅ Sudah siap untuk Next.js
- ✅ Tidak ada perubahan logika (client-side only)

#### `frontend/features/cms-lite/contexts/ThemeContext.tsx`
- ✅ Query settings dari Convex untuk theme colors
- ✅ Membutuhkan `workspaceId` sebagai prop
- ✅ Auto-apply theme berdasarkan settings dari database

### 3. **Documentation**

#### `docs/CMS_LITE_CONVEX_MIGRATION.md`
- ✅ Panduan lengkap untuk migrasi admin pages
- ✅ Contoh kode before/after
- ✅ Step-by-step instructions
- ✅ Troubleshooting guide

#### `docs/examples/AdminDashboard.convex.tsx`
- ✅ Contoh lengkap AdminDashboard yang sudah migrasi
- ✅ Menunjukkan pattern Convex yang benar
- ✅ Bisa dijadikan template untuk admin pages lain

---

## ⏳ Yang Perlu Dilakukan Selanjutnya

### 1. **Admin Pages - Belum Migrasi**

File-file ini masih menggunakan `useBackend()` yang return mock data:

- ❌ `frontend/features/cms-lite/features/admin/pages/AdminAI.tsx`
- ❌ `frontend/features/cms-lite/features/admin/pages/AdminAIAnalytics.tsx`
- ❌ `frontend/features/cms-lite/features/admin/pages/AdminAISettings.tsx`
- ❌ `frontend/features/cms-lite/features/admin/pages/AdminDashboard.tsx`
- ❌ `frontend/features/cms-lite/features/admin/pages/AdminFeatures.tsx`
- ❌ Plus 10+ admin pages lainnya (Products, Posts, Portfolio, etc.)

**Cara Migrasi:**
1. Ganti `useBackend()` dengan Convex hooks
2. Tambahkan `workspaceId` dari params/props
3. Ganti async/await pattern dengan reactive Convex queries
4. Lihat contoh di `docs/examples/AdminDashboard.convex.tsx`

### 2. **Convex Backend - AI Features**

File-file AI masih belum ada di Convex:

```
convex/features/cms_lite/ai/         ← BELUM ADA
  queries.ts   - getStats, getErrors, listKBDocuments
  mutations.ts - updateSettings, createKBDocument
  schema.ts    - AI tables definition
```

**Yang Perlu Dibuat:**
- Table untuk AI settings
- Table untuk knowledge base documents
- Table untuk error logs
- Table untuk usage statistics
- Queries untuk analytics
- Mutations untuk CRUD operations

### 3. **Route Structure Update**

Admin pages perlu akses ke `workspaceId`. Ada beberapa pilihan:

**Option A: URL Params (Recommended)**
```
/dashboard/[workspaceId]/cms-admin/dashboard
/dashboard/[workspaceId]/cms-admin/products
/dashboard/[workspaceId]/cms-admin/posts
```

**Option B: Context Provider**
```tsx
<WorkspaceProvider workspaceId={workspaceId}>
  <AdminPages />
</WorkspaceProvider>
```

**Option C: Global State**
```tsx
const workspaceId = useStore(state => state.currentWorkspaceId);
```

### 4. **Public Pages - Masih React Router**

11 file public pages masih menggunakan React Router:
- HomePage, BlogPage, BlogPostPage, ProductsPage, etc.

Perlu diganti:
- `useParams()` → props from Next.js
- `useNavigate()` → `useRouter()` from next/navigation
- `Link from react-router-dom` → `Link from next/link`

### 5. **Testing & Validation**

Setelah migrasi:
- [ ] Test semua admin pages
- [ ] Verify permissions work correctly
- [ ] Check real-time updates
- [ ] Test error handling
- [ ] Validate toast notifications
- [ ] Check loading states

---

## 📋 Migration Checklist

### Phase 1: Infrastructure (✅ DONE)
- [x] Migrate backend.ts
- [x] Create useConvexBackend hook
- [x] Migrate all context providers
- [x] Add "use client" directives
- [x] Create migration documentation

### Phase 2: Admin Pages (⏳ IN PROGRESS)
- [ ] Add workspaceId to route structure
- [ ] Migrate AdminDashboard (example ready)
- [ ] Migrate AdminFeatures
- [ ] Migrate AdminProducts
- [ ] Migrate AdminPosts
- [ ] Migrate AdminPortfolio
- [ ] Migrate AdminServices
- [ ] Migrate AdminSettings
- [ ] Migrate AdminNavigation
- [ ] Migrate AdminQuicklinks
- [ ] Migrate AdminLanding
- [ ] Migrate AdminAI
- [ ] Migrate AdminAIAnalytics
- [ ] Migrate AdminAISettings

### Phase 3: AI Features (⏳ TODO)
- [ ] Create AI schema in Convex
- [ ] Create AI queries
- [ ] Create AI mutations
- [ ] Add analytics functions
- [ ] Add error logging
- [ ] Add KB document management

### Phase 4: Public Pages (⏳ TODO)
- [ ] Convert HomePage
- [ ] Convert BlogPage
- [ ] Convert BlogPostPage
- [ ] Convert ProductsPage
- [ ] Convert ProductDetailPage
- [ ] Convert PortfolioPage
- [ ] Convert remaining pages

### Phase 5: Testing & Deployment (⏳ TODO)
- [ ] Integration testing
- [ ] Permission testing
- [ ] Real-time update testing
- [ ] Performance testing
- [ ] Production deployment

---

## 🚀 Quick Start - Melanjutkan Migrasi

### Untuk Migrasi Admin Page:

1. **Copy template dari contoh:**
   ```bash
   cp docs/examples/AdminDashboard.convex.tsx frontend/features/cms-lite/features/admin/pages/AdminDashboard.tsx
   ```

2. **Sesuaikan dengan page yang spesifik:**
   - Ganti queries sesuai data yang dibutuhkan
   - Tambahkan mutations untuk CRUD operations
   - Update UI components

3. **Test di browser:**
   ```bash
   npm run dev
   # atau
   pnpm dev
   ```

### Untuk Create AI Features di Convex:

1. **Buat folder structure:**
   ```bash
   mkdir -p convex/features/cms_lite/ai/api
   ```

2. **Create schema:**
   ```typescript
   // convex/features/cms_lite/ai/api/schema.ts
   export const aiSettings = {
     enabled: v.boolean(),
     rateLimitPerMinute: v.number(),
     // ...
   };
   ```

3. **Create queries:**
   ```typescript
   // convex/features/cms_lite/ai/api/queries.ts
   export const getStats = query({
     args: { workspaceId: v.id("workspaces") },
     handler: async (ctx, args) => {
       // Implementation
     },
   });
   ```

---

## 📞 Need Help?

Lihat dokumentasi:
- `docs/CMS_LITE_CONVEX_MIGRATION.md` - Panduan lengkap
- `docs/examples/AdminDashboard.convex.tsx` - Contoh lengkap
- Convex docs: https://docs.convex.dev/

Pattern umum:
```tsx
// Query (read)
const data = useQuery(api.path.to.query, { workspaceId, ...args });

// Mutation (write)
const mutate = useMutation(api.path.to.mutation);
await mutate({ workspaceId, ...data });
```

---

## 🎯 Priority Order

**High Priority:**
1. Migrasi AdminDashboard (template sudah ada)
2. Migrasi AdminProducts, AdminPosts, AdminPortfolio (CRUD pages)
3. Add workspaceId to route structure

**Medium Priority:**
4. Create AI features in Convex
5. Migrasi AI admin pages
6. Migrasi settings & configuration pages

**Low Priority:**
7. Migrasi public pages
8. Performance optimization
9. Advanced features

---

**Status:** Infrastructure ✅ | Admin Pages ⏳ | AI Features ⏳ | Public Pages ⏳
**Next Step:** Migrate AdminDashboard using the example provided
