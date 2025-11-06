# CMS-Lite Feature Isolation Manifest

> **Complete file listing for isolating cms-lite feature to standalone package**
> **Generated:** 2025-11-04
> **Total Files:** 200+ files

---

## 📋 Table of Contents

1. [Frontend Files (125+ files)](#frontend-files)
2. [Backend Files (150+ files)](#backend-files)
3. [Shared Dependencies](#shared-dependencies)
4. [Test Files](#test-files)
5. [Documentation](#documentation)
6. [Configuration Files](#configuration-files)
7. [File Count Summary](#file-count-summary)

---

## 🎨 Frontend Files

### 1. Core Configuration (2 files)
```
frontend/features/cms-lite/config.ts
frontend/features/cms-lite/README.md
```

### 2. Views & Public Pages (11 files)
```
frontend/features/cms-lite/views/CmsLitePage.tsx
frontend/features/cms-lite/pages/HomePage.tsx
frontend/features/cms-lite/pages/BlogPage.tsx
frontend/features/cms-lite/pages/BlogPostPage.tsx
frontend/features/cms-lite/pages/ProductsPage.tsx
frontend/features/cms-lite/pages/ProductDetailPage.tsx
frontend/features/cms-lite/pages/PortfolioPage.tsx
frontend/features/cms-lite/pages/AboutPage.tsx
frontend/features/cms-lite/pages/LoginPage.tsx
frontend/features/cms-lite/pages/HelloPage.tsx
frontend/features/cms-lite/pages/ServiceDetailPage.tsx
```

### 3. Admin Pages (13 files)
```
frontend/features/cms-lite/features/admin/pages/AdminDashboard.tsx
frontend/features/cms-lite/features/admin/pages/AdminProducts.tsx
frontend/features/cms-lite/features/admin/pages/AdminPosts.tsx
frontend/features/cms-lite/features/admin/pages/AdminPortfolio.tsx
frontend/features/cms-lite/features/admin/pages/AdminServices.tsx
frontend/features/cms-lite/features/admin/pages/AdminNavigation.tsx
frontend/features/cms-lite/features/admin/pages/AdminLanding.tsx
frontend/features/cms-lite/features/admin/pages/AdminFeatures.tsx
frontend/features/cms-lite/features/admin/pages/AdminQuicklinks.tsx
frontend/features/cms-lite/features/admin/pages/AdminUsers.tsx
frontend/features/cms-lite/features/admin/pages/AdminSettings.tsx
frontend/features/cms-lite/features/admin/pages/AdminMediaLibrary.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings.tsx
```

### 4. Admin Website Settings Components (13 files)
```
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/AdvancedStep.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/AnalyticsStep.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/DomainStep.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/MCPStep.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/SEOStep.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/ProgressBar.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/RightPanelTabs.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/SEOScoreCard.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/components/WebsitePreview.tsx
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/utils/seoAnalyzer.ts
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/utils/validators.ts
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/types.ts
frontend/features/cms-lite/features/admin/pages/AdminWebsiteSettings/index.tsx
```

### 5. Admin AI Components (3 files)
```
frontend/features/cms-lite/features/admin/pages/AdminAI/index.tsx
frontend/features/cms-lite/features/admin/pages/AdminAI/components/Analytics.tsx
frontend/features/cms-lite/features/admin/pages/AdminAI/components/Settings.tsx
```

### 6. Admin Components (5 files)
```
frontend/features/cms-lite/features/admin/components/AdminList.tsx
frontend/features/cms-lite/features/admin/components/SearchBar.tsx
frontend/features/cms-lite/features/admin/components/posts/PostForm.tsx
frontend/features/cms-lite/features/admin/components/posts/RevisionsDiff.tsx
frontend/features/cms-lite/features/admin/components/products/ProductForm.tsx
```

### 7. Shared Components (23 files)
```
frontend/features/cms-lite/shared/components/AdminUserInitializer.tsx
frontend/features/cms-lite/shared/components/BulkImageUpload.tsx
frontend/features/cms-lite/shared/components/Button.tsx
frontend/features/cms-lite/shared/components/Comments.tsx
frontend/features/cms-lite/shared/components/ContentRecommendations.tsx
frontend/features/cms-lite/shared/components/ErrorBoundary.tsx
frontend/features/cms-lite/shared/components/ErrorState.tsx
frontend/features/cms-lite/shared/components/Form.tsx
frontend/features/cms-lite/shared/components/ImageEditor.tsx
frontend/features/cms-lite/shared/components/ImageUrlInput.tsx
frontend/features/cms-lite/shared/components/ImportValidationModal.tsx
frontend/features/cms-lite/shared/components/LazyImage.tsx
frontend/features/cms-lite/shared/components/Lightbox.tsx
frontend/features/cms-lite/shared/components/Loading.tsx
frontend/features/cms-lite/shared/components/Modal.tsx
frontend/features/cms-lite/shared/components/RichTextEditor.tsx
frontend/features/cms-lite/shared/components/SchedulePublisher.tsx
frontend/features/cms-lite/shared/components/SearchFilterSort.tsx
frontend/features/cms-lite/shared/components/ShareButtons.tsx
frontend/features/cms-lite/shared/components/Skeleton.tsx
frontend/features/cms-lite/shared/components/Toast.tsx
frontend/features/cms-lite/shared/components/portfolio/PortfolioForm.tsx
```

### 8. Shared Hooks (13 files)
```
frontend/features/cms-lite/shared/hooks/useAutosave.ts
frontend/features/cms-lite/shared/hooks/useBackend.ts
frontend/features/cms-lite/shared/hooks/useBulkSelection.ts
frontend/features/cms-lite/shared/hooks/useConvexBackend.ts
frontend/features/cms-lite/shared/hooks/useFormState.ts
frontend/features/cms-lite/shared/hooks/useImagePreload.ts
frontend/features/cms-lite/shared/hooks/useImageUpload.ts
frontend/features/cms-lite/shared/hooks/useKeyboardNavigation.ts
frontend/features/cms-lite/shared/hooks/useMultiLanguageForm.ts
frontend/features/cms-lite/shared/hooks/useOptimisticUpdate.ts
frontend/features/cms-lite/shared/hooks/useShare.ts
frontend/features/cms-lite/shared/hooks/useWebsiteSettings.ts
frontend/features/cms-lite/shared/hooks/useWorkspaceId.ts
```

### 9. Shared Utils (12 files)
```
frontend/features/cms-lite/shared/utils/accessibility.ts
frontend/features/cms-lite/shared/utils/errorHandling.ts
frontend/features/cms-lite/shared/utils/exportCSV.ts
frontend/features/cms-lite/shared/utils/exportImport.ts
frontend/features/cms-lite/shared/utils/format.ts
frontend/features/cms-lite/shared/utils/format.test.ts
frontend/features/cms-lite/shared/utils/imageCompression.ts
frontend/features/cms-lite/shared/utils/imageUtils.ts
frontend/features/cms-lite/shared/utils/localization.ts
frontend/features/cms-lite/shared/utils/logger.ts
frontend/features/cms-lite/shared/utils/validation.ts
frontend/features/cms-lite/shared/utils/validation.test.ts
```

### 10. Main Components (6 files)
```
frontend/features/cms-lite/components/CartDropdown.tsx
frontend/features/cms-lite/components/Chatbot.tsx
frontend/features/cms-lite/components/CurrencySelector.tsx
frontend/features/cms-lite/components/Footer.tsx
frontend/features/cms-lite/components/Navbar.tsx
frontend/features/cms-lite/components/PagesManager.tsx
```

### 11. Contexts (4 files)
```
frontend/features/cms-lite/contexts/CartContext.tsx
frontend/features/cms-lite/contexts/CurrencyContext.tsx
frontend/features/cms-lite/contexts/LanguageContext.tsx
frontend/features/cms-lite/contexts/ThemeContext.tsx
```

### 12. Types (2 files)
```
frontend/features/cms-lite/types/index.ts
frontend/features/cms-lite/types/cms-types.ts
```

### 13. Lib (2 files)
```
frontend/features/cms-lite/lib/backend.ts
frontend/features/cms-lite/lib/utils.ts
```

### 14. Root Hooks (1 file)
```
frontend/features/cms-lite/hooks/useCmsLite.ts
```

### 15. Settings (5 files)
```
frontend/features/cms-lite/settings/encore.service.ts
frontend/features/cms-lite/settings/export_all.ts
frontend/features/cms-lite/settings/get.ts
frontend/features/cms-lite/settings/import_all.ts
frontend/features/cms-lite/settings/update.ts
```

**Frontend Total: ~125 files**

---

## 🔧 Backend Files

### 1. Core Schema & Config (5 files)
```
convex/features/cms_lite/schema.ts
convex/features/cms_lite/schema.shared.ts
convex/features/cms_lite/_generated.ts
convex/features/cms_lite/queries.ts
convex/features/cms_lite/mutations.ts
```

### 2. Products Module (5 files)
```
convex/features/cms_lite/products/README.md
convex/features/cms_lite/products/api/queries.ts
convex/features/cms_lite/products/api/mutations.ts
convex/features/cms_lite/products/api/actions.ts
convex/features/cms_lite/products/api/schema.ts
```

### 3. Posts Module (5 files)
```
convex/features/cms_lite/posts/README.md
convex/features/cms_lite/posts/api/queries.ts
convex/features/cms_lite/posts/api/mutations.ts
convex/features/cms_lite/posts/api/actions.ts
convex/features/cms_lite/posts/api/schema.ts
```

### 4. Portfolio Module (5 files)
```
convex/features/cms_lite/portfolio/README.md
convex/features/cms_lite/portfolio/api/queries.ts
convex/features/cms_lite/portfolio/api/mutations.ts
convex/features/cms_lite/portfolio/api/actions.ts
convex/features/cms_lite/portfolio/api/schema.ts
```

### 5. Services Module (5 files)
```
convex/features/cms_lite/services/README.md
convex/features/cms_lite/services/api/queries.ts
convex/features/cms_lite/services/api/mutations.ts
convex/features/cms_lite/services/api/actions.ts
convex/features/cms_lite/services/api/schema.ts
```

### 6. Navigation Module (7 files)
```
convex/features/cms_lite/navigation/README.md
convex/features/cms_lite/navigation/schema.ts
convex/features/cms_lite/navigation/types.ts
convex/features/cms_lite/navigation/api/queries.ts
convex/features/cms_lite/navigation/api/mutations.ts
convex/features/cms_lite/navigation/api/actions.ts
convex/features/cms_lite/navigation/api/schema.ts
```

### 7. Landing Module (5 files)
```
convex/features/cms_lite/landing/README.md
convex/features/cms_lite/landing/api/queries.ts
convex/features/cms_lite/landing/api/mutations.ts
convex/features/cms_lite/landing/api/actions.ts
convex/features/cms_lite/landing/api/schema.ts
```

### 8. Features Module (5 files)
```
convex/features/cms_lite/features/README.md
convex/features/cms_lite/features/api/queries.ts
convex/features/cms_lite/features/api/mutations.ts
convex/features/cms_lite/features/api/actions.ts
convex/features/cms_lite/features/api/schema.ts
```

### 9. Quicklinks Module (5 files)
```
convex/features/cms_lite/quicklinks/README.md
convex/features/cms_lite/quicklinks/api/queries.ts
convex/features/cms_lite/quicklinks/api/mutations.ts
convex/features/cms_lite/quicklinks/api/actions.ts
convex/features/cms_lite/quicklinks/api/schema.ts
```

### 10. Settings Module (5 files)
```
convex/features/cms_lite/settings/README.md
convex/features/cms_lite/settings/api/queries.ts
convex/features/cms_lite/settings/api/mutations.ts
convex/features/cms_lite/settings/api/actions.ts
convex/features/cms_lite/settings/api/schema.ts
```

### 11. Cart Module (6 files)
```
convex/features/cms_lite/cart/README.md
convex/features/cms_lite/cart/constants.ts
convex/features/cms_lite/cart/api/queries.ts
convex/features/cms_lite/cart/api/mutations.ts
convex/features/cms_lite/cart/api/actions.ts
convex/features/cms_lite/cart/api/schema.ts
```

### 12. Wishlist Module (5 files)
```
convex/features/cms_lite/wishlist/README.md
convex/features/cms_lite/wishlist/api/queries.ts
convex/features/cms_lite/wishlist/api/mutations.ts
convex/features/cms_lite/wishlist/api/actions.ts
convex/features/cms_lite/wishlist/api/schema.ts
```

### 13. Currency Module (6 files)
```
convex/features/cms_lite/currency/README.md
convex/features/cms_lite/currency/constants.ts
convex/features/cms_lite/currency/api/queries.ts
convex/features/cms_lite/currency/api/mutations.ts
convex/features/cms_lite/currency/api/actions.ts
convex/features/cms_lite/currency/api/schema.ts
```

### 14. Comments Module (5 files)
```
convex/features/cms_lite/comments/README.md
convex/features/cms_lite/comments/api/queries.ts
convex/features/cms_lite/comments/api/mutations.ts
convex/features/cms_lite/comments/api/actions.ts
convex/features/cms_lite/comments/api/schema.ts
```

### 15. Storage Module (5 files)
```
convex/features/cms_lite/storage/README.md
convex/features/cms_lite/storage/api/queries.ts
convex/features/cms_lite/storage/api/mutations.ts
convex/features/cms_lite/storage/api/actions.ts
convex/features/cms_lite/storage/api/schema.ts
```

### 16. Pages Module (6 files)
```
convex/features/cms_lite/pages/README.md
convex/features/cms_lite/pages/api/queries.ts
convex/features/cms_lite/pages/api/mutations.ts
convex/features/cms_lite/pages/api/actions.ts
convex/features/cms_lite/pages/api/schema.ts
convex/features/cms_lite/pages/api/internalMutations.ts
```

### 17. Users Module (5 files)
```
convex/features/cms_lite/users/README.md
convex/features/cms_lite/users/api/queries.ts
convex/features/cms_lite/users/api/mutations.ts
convex/features/cms_lite/users/api/actions.ts
convex/features/cms_lite/users/api/schema.ts
```

### 18. Copies Module (5 files)
```
convex/features/cms_lite/copies/README.md
convex/features/cms_lite/copies/api/queries.ts
convex/features/cms_lite/copies/api/mutations.ts
convex/features/cms_lite/copies/api/actions.ts
convex/features/cms_lite/copies/api/schema.ts
```

### 19. Activity Events Module (6 files)
```
convex/features/cms_lite/activityEvents/README.md
convex/features/cms_lite/activityEvents/lib/audit.ts
convex/features/cms_lite/activityEvents/api/queries.ts
convex/features/cms_lite/activityEvents/api/mutations.ts
convex/features/cms_lite/activityEvents/api/actions.ts
convex/features/cms_lite/activityEvents/api/schema.ts
```

### 20. Website Settings Module (4 files)
```
convex/features/cms_lite/website_settings/api/queries.ts
convex/features/cms_lite/website_settings/api/mutations.ts
convex/features/cms_lite/website_settings/api/schema.ts
```

### 21. Permissions Module (3 files)
```
convex/features/cms_lite/permissions/api/queries.ts
convex/features/cms_lite/permissions/schema.ts
```

### 22. Shared Module (3 files)
```
convex/features/cms_lite/shared/schema.ts
convex/features/cms_lite/shared/auth.ts
convex/features/cms_lite/shared/audit.ts
```

**Backend Total: ~150 files**

---

## 🔗 Shared Dependencies

### Frontend Shared Dependencies

#### UI Components (from `frontend/shared/ui/`)
```
frontend/shared/ui/layout/sidebar/secondary.tsx   # SecondarySidebarLayout
```

#### shadcn/ui Components (from `components/ui/`)
```
components/ui/button.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/textarea.tsx
components/ui/badge.tsx
components/ui/tabs.tsx
components/ui/dialog.tsx
components/ui/select.tsx
components/ui/checkbox.tsx
components/ui/card.tsx
components/ui/alert.tsx
components/ui/separator.tsx
components/ui/dropdown-menu.tsx
components/ui/toast.tsx
components/ui/toaster.tsx
components/ui/use-toast.ts
```

#### Hooks
```
hooks/use-toast.ts
```

#### Lib Utils
```
lib/utils.ts                        # cn() utility
lib/features/defineFeature.ts       # Feature definition helper
```

### Convex Shared Dependencies

#### Global Shared (from `convex/shared/`)
```
convex/shared/permissions/helpers.ts    # requirePermission, hasPermission
convex/shared/audit/logger.ts           # logAuditEvent
convex/shared/utils/validation.ts       # Schema validation helpers
```

#### Convex Core
```
convex/_generated/server.ts             # query, mutation, action
convex/_generated/dataModel.ts          # Id, Doc types
convex/_generated/api.ts                # API exports
```

---

## 🧪 Test Files

```
tests/features/cms-lite/cms-lite.test.ts
tests/features/cms-lite/cms-lite.integration.test.ts
```

---

## 📚 Documentation

```
docs/features/cms-lite/                 # Feature-specific docs (if exists)
frontend/features/cms-lite/README.md    # Feature README
convex/features/cms_lite/*/README.md    # Module READMEs (~18 files)
```

---

## ⚙️ Configuration Files

### Package Dependencies (to extract)
```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "convex": "latest",
    "@clerk/nextjs": "latest",
    "lucide-react": "latest",
    "zod": "latest",
    "tailwindcss": "latest",
    "@radix-ui/react-*": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/node": "^20.x",
    "vitest": "latest",
    "convex-test": "latest"
  }
}
```

### TypeScript Config
```
tsconfig.json                       # Main TS config
```

### Environment Variables
```
.env.example                        # Template for required env vars
```

---

## 📊 File Count Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Frontend** | ~125 | UI components, pages, hooks, utils |
| **Backend** | ~150 | Convex queries, mutations, schemas |
| **Shared Deps** | ~30 | Global shared components & helpers |
| **Tests** | 2 | Unit & integration tests |
| **Docs** | ~20 | Feature & module documentation |
| **Config** | 3 | package.json, tsconfig, .env |
| **TOTAL** | ~330 | Complete feature package |

---

## 🎯 Isolation Strategy

### What to Copy

1. **Complete Feature Folder**
   - `frontend/features/cms-lite/` (all 125 files)
   - `convex/features/cms_lite/` (all 150 files)

2. **Minimal Shared Dependencies**
   - Only files actually imported
   - shadcn/ui components used
   - lib/utils.ts, lib/features/defineFeature.ts
   - convex/shared/permissions, audit

3. **Configuration Files**
   - package.json (deps only)
   - tsconfig.json
   - .env.example

4. **Tests & Docs**
   - Feature tests
   - Feature documentation

### What NOT to Copy

- Other features (chat, calendar, etc)
- Unused shared components
- Root app/ directory
- Full node_modules
- Build artifacts (.next, dist)
- Git history

### Target Structure

```
progress/cms-lite-isolated/
├── frontend/
│   ├── features/
│   │   └── cms-lite/           # Complete feature (125 files)
│   ├── shared/
│   │   └── ui/                 # Only used components
│   └── lib/
│       ├── utils.ts
│       └── features/
│           └── defineFeature.ts
├── convex/
│   ├── features/
│   │   └── cms_lite/           # Complete backend (150 files)
│   ├── shared/
│   │   ├── permissions/
│   │   └── audit/
│   └── _generated/             # Type stubs
├── components/
│   └── ui/                     # shadcn components used
├── tests/
│   └── features/
│       └── cms-lite/
├── docs/
│   ├── 00_BASE_KNOWLEDGE.md    # Base knowledge
│   ├── FEATURE_RULES.md        # Development rules
│   └── cms-lite/               # Feature-specific docs
├── package.json                # Minimal deps
├── tsconfig.json               # TS config
├── .env.example                # Env template
└── README.md                   # Setup guide
```

---

## 📝 Notes

- **Status:** Feature is in development (not production-ready)
- **Dependencies:** Heavily relies on Convex real-time database
- **Auth:** Requires Clerk authentication setup
- **UI:** Uses shadcn/ui component library
- **Backend:** 18 independent modules with full CRUD operations
- **Frontend:** Complete admin panel + public-facing pages

---

**Last Updated:** 2025-11-04
**Manifest Version:** 1.0.0
