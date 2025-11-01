# CMS Lite Next.js Integration

This document explains the CMS Lite integration for Next.js App Router.

## Overview

CMS Lite is an **optional feature** for Superspace users who want to build public-facing websites. Not all users will need this feature - it's specifically for those who want to create content-managed websites.

The CMS Lite system has been adapted from a React Router application to work with Next.js, with two main parts:

1. **Admin Interface** - Integrated into dashboard dynamic routing for content management
2. **Public Routes** - Separate route group `(cms)` for displaying public website content

## Routes

### Admin Interface
- **Access:** Via dashboard dynamic routing (e.g., `/dashboard/cms-admin`)
- **Component:** `frontend/features/cms-lite/views/CmsLitePage.tsx`
- **Purpose:** Content management interface with tabs for all CMS features
- **Note:** No static route needed - uses dashboard's `[[...slug]]` dynamic routing

**Available Admin Sections:**
- Dashboard - Overview and analytics
- Products - Manage products
- Blog Posts - Manage blog content
- Portfolio - Manage portfolio items
- Services - Manage services
- Landing Page - Edit landing page content
- Navigation - Configure site navigation
- Features - Manage feature highlights
- Quick Links - Manage quick access links
- Users - User management
- AI Chatbot - Configure AI chatbot
- AI Analytics - View AI interaction analytics
- AI Settings - AI configuration
- Settings - General site settings

### Public CMS Routes
- **Path Pattern:** `/(cms)/[...slug]`
- **Files:** 
  - `app/(cms)/[...slug]/page.tsx` - Catch-all dynamic route (Next.js 14+ async params)
  - `app/(cms)/layout.tsx` - Layout for public pages

**Planned Public Routes:**
- `/` - Home Page
- `/about` - About Page
- `/products` - Products Catalog
- `/products/[slug]` - Product Detail
- `/blog` - Blog List
- `/blog/[slug]` - Blog Post Detail
- `/portfolio` - Portfolio Gallery
- `/hello` - Contact/Hello Page

## Architecture Decisions

### Why Dynamic Routes in Dashboard?
The dashboard uses `[[...slug]]` dynamic routing, so we don't create static routes like `app/dashboard/admin/page.tsx`. Instead, the CMS admin interface is loaded dynamically when users navigate to the appropriate dashboard path.

### Why Route Group `(cms)` for Public Pages?
- **Route Groups** `(folder)` in Next.js don't affect the URL structure
- Keeps public CMS pages organized and separate from dashboard
- Allows different layouts and metadata for public vs admin pages
- Prevents route conflicts with dashboard routes

### Best Practices Followed
1. **Async Params** - Using `Promise<params>` for Next.js 14+ compatibility
2. **Dynamic Imports** - Using `next/dynamic` to lazy load admin components
3. **Optional Feature** - Not loaded for users who don't use CMS Lite
4. **Separation of Concerns** - Public and admin interfaces are clearly separated

## Migration Status

### ✅ Completed
- Admin interface converted to Next.js component with tabs
- Removed static `app/dashboard/admin/page.tsx` (not needed with dynamic routing)
- Public CMS route group structure created with `(cms)`
- Layout structure for public routes
- Removed problematic Context Providers that depend on missing backend
- Used dynamic imports to prevent loading CMS dependencies unnecessarily
- Updated to Next.js 14+ async params pattern

## Backend Integration Status

### ✅ Backend Available
CMS Lite backend sudah tersedia di Convex:
- **Location**: `convex/features/cms_lite/`
- **Structure**: Feature-based organization dengan queries, mutations, dan schema

**Available Backend Modules:**
- `products/` - Product management
- `posts/` - Blog posts
- `portfolio/` - Portfolio items
- `services/` - Services
- `settings/` - Site settings
- `navigation/` - Navigation items
- `quicklinks/` - Quick links
- `features/` - Features
- `landing/` - Landing page content
- `users/` - User management
- `cart/` - Shopping cart
- `wishlist/` - Wishlist
- `comments/` - Comments
- `currency/` - Currency conversion
- `storage/` - File storage
- `permissions/` - Access control

### 🚧 Integration Required
Admin pages masih menggunakan `useBackend()` hook yang perlu diupdate untuk menggunakan Convex:

**Current Pattern (needs update):**
```typescript
const backend = useBackend();
const result = await backend.products.list();
```

**Should be (using Convex):**
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const products = useQuery(api.features.cms_lite.products.queries.list, { 
  workspaceId 
});
```

2. **Context Providers:**
   - ThemeProvider - Needs backend integration
   - LanguageProvider - Needs i18n setup
   - CurrencyProvider - Needs currency API
   - CartProvider - Needs cart backend (depends on `~backend/client`)

3. **Public Pages Adaptation:**
   - Convert from React Router to Next.js routing
   - Replace `useParams()` with Next.js params
   - Replace `useNavigate()` with Next.js navigation
   - Replace React Router `Link` with Next.js `Link`
   - Add `"use client"` directives where needed

## File Structure

```
app/
  dashboard/
    [[...slug]]/
      page.tsx              # Dynamic routing - CMS admin accessed here
  (cms)/                    # Route group (parentheses = not in URL)
    layout.tsx              # Public CMS layout (simple wrapper for now)
    [...slug]/              # Catch-all route
      page.tsx              # Public CMS pages (placeholder)

frontend/features/cms-lite/
  views/
    CmsLitePage.tsx         # Admin interface (uses dynamic imports)
  pages/
    HomePage.tsx            # Public pages (need Next.js adaptation)
    AboutPage.tsx
    ProductsPage.tsx
    ProductDetailPage.tsx
    BlogPage.tsx
    BlogPostPage.tsx
    PortfolioPage.tsx
    HelloPage.tsx
  features/admin/
    pages/                  # Individual admin page components
    components/             # Admin-specific components
  contexts/                 # Context providers (need backend integration)
  components/               # Shared UI components
```

## Usage

### Accessing Admin Interface
1. Navigate to dashboard (e.g., `/dashboard/cms-admin`)
2. The CMS Lite admin interface will load via dynamic routing
3. Use tabs to switch between content management sections
4. Only available to users who have the CMS Lite feature enabled

### Public Pages (When Integrated)
1. Will be accessible at `/(cms)` routes (the group name is not in the URL)
2. Example: `/` maps to home page, `/about` to about page, etc.
3. Will have separate layout from dashboard
4. Can be pre-rendered or server-rendered as needed

## Next Steps

To complete the CMS Lite integration:

1. **Backend Integration**
   - Replace `~backend/client` with Convex functions or API routes
   - Set up data models for products, posts, portfolio, etc.
   - Implement authentication and authorization

2. **Context Providers**
   - Integrate ThemeProvider with app-wide theme system
   - Set up i18n with next-intl or similar
   - Implement currency conversion API
   - Create shopping cart with backend persistence

3. **Public Pages**
   - Adapt all public pages from React Router to Next.js
   - Implement proper data fetching (Server Components where possible)
   - Add loading and error states
   - Implement SEO metadata

4. **Feature Flag**
   - Add feature flag to enable/disable CMS Lite per workspace
   - Only show CMS admin in dashboard for users with feature enabled
   - Conditionally load CMS routes based on feature flag

## Notes

- CMS Lite is **optional** - not all Superspace users need it
- Admin interface uses dynamic imports to avoid loading for non-CMS users
- Public routes use Next.js 14+ async params pattern
- Route group `(cms)` keeps URLs clean (e.g., `/about` not `/cms/about`)
- Original React Router code preserved in `frontend/features/cms-lite/` for reference
