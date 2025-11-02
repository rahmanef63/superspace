# CMS Lite Dynamic Pages System

## Overview

The CMS Lite Dynamic Pages system allows admins to create pages with **multi-language slugs** without needing to hardcode routes. Pages are dynamically served through the `app/(cms)/[...slug]` catch-all route.

## Features

✅ **Multi-Language Slugs** - Create pages in any language (English, Arabic, Russian, Indonesian, etc.)  
✅ **Dynamic Routing** - No need to create new route files  
✅ **SEO Support** - Custom meta titles, descriptions, and keywords  
✅ **Page Type Mapping** - Map slugs to specific page components  
✅ **Publish Control** - Draft/published states  
✅ **Display Order** - Control page ordering  
✅ **Admin UI** - Full CRUD interface for page management

## Architecture

### Database Schema

**Table**: `cms_lite_pages`

```typescript
{
  slug: string;              // "hello", "مرحبا", "привет", "halo"
  locale: string;            // "en", "ar", "ru", "id"
  pageType: PageType;        // "home", "about", "products", etc.
  title: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isPublished: boolean;
  displayOrder?: number;
  workspaceId: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  updatedBy?: string;
}
```

### Page Types

- `home` → HomePage.tsx
- `about` → AboutPage.tsx
- `products` → ProductsPage.tsx
- `product-detail` → ProductDetailPage.tsx
- `blog` → BlogPage.tsx
- `blog-post` → BlogPostPage.tsx
- `portfolio` → PortfolioPage.tsx
- `hello` → HelloPage.tsx (Quick Links)
- `custom` → HomePage.tsx (fallback)

## Usage Examples

### Create English Page

```typescript
await createPage({
  slug: "hello",
  locale: "en",
  pageType: "hello",
  title: "Quick Links",
  description: "Access your favorite resources",
  isPublished: true,
  displayOrder: 1,
});
```

**URL**: `http://localhost:3000/hello`

### Create Arabic Page

```typescript
await createPage({
  slug: "مرحبا",
  locale: "ar",
  pageType: "hello",
  title: "روابط سريعة",
  description: "الوصول إلى مواردك المفضلة",
  isPublished: true,
  displayOrder: 2,
});
```

**URL**: `http://localhost:3000/مرحبا`

### Create Russian Page

```typescript
await createPage({
  slug: "привет",
  locale: "ru",
  pageType: "hello",
  title: "Быстрые ссылки",
  description: "Быстрый доступ к ресурсам",
  isPublished: true,
  displayOrder: 3,
});
```

**URL**: `http://localhost:3000/привет`

### Create Indonesian Page

```typescript
await createPage({
  slug: "halo",
  locale: "id",
  pageType: "hello",
  title: "Tautan Cepat",
  description: "Akses cepat ke sumber daya",
  isPublished: true,
  displayOrder: 4,
});
```

**URL**: `http://localhost:3000/halo`

## Dynamic Route Flow

```
User visits: /hello
   ↓
app/(cms)/[...slug]/page.tsx
   ↓
Query: api.features.cms_lite.pages.api.queries.getPageBySlug({ slug: "hello" })
   ↓
Returns: { pageType: "hello", title: "Quick Links", ... }
   ↓
Component: <HelloPage />
   ↓
Rendered: Full page with Navbar, content, Footer
```

## Admin Interface

Access at: `/dashboard/cms-lite` → Pages tab

**Features**:
- ✅ Create new pages
- ✅ Edit existing pages
- ✅ Delete pages
- ✅ Toggle published status
- ✅ Set display order
- ✅ Multi-language support
- ✅ SEO configuration

## API Endpoints

### Queries

**`getPageBySlug`** - Get page by slug (public)
```typescript
const page = useQuery(api.features.cms_lite.pages.api.queries.getPageBySlug, {
  slug: "hello",
  workspaceId: "..." // optional
});
```

**`listPages`** - List all published pages (public)
```typescript
const { pages } = useQuery(api.features.cms_lite.pages.api.queries.listPages, {
  workspaceId: "...", // optional
  locale: "en"        // optional
});
```

**`getPagesByLocale`** - Get pages by language
```typescript
const { pages } = useQuery(api.features.cms_lite.pages.api.queries.getPagesByLocale, {
  locale: "ar",
  workspaceId: "..."
});
```

### Mutations

**`createPage`** - Create new page (admin only)
```typescript
const { pageId } = await createPage({
  slug: "about",
  locale: "en",
  pageType: "about",
  title: "About Us",
  isPublished: true,
});
```

**`updatePage`** - Update existing page (admin only)
```typescript
await updatePage({
  pageId: "...",
  title: "New Title",
  isPublished: false,
});
```

**`deletePage`** - Delete page (admin only)
```typescript
await deletePage({ pageId: "..." });
```

## Seeding Default Pages

Run seed mutation to create default pages:

```typescript
await ctx.runMutation(internal.features.cms_lite.pages.api.internalMutations.seedDefaultPages, {
  workspaceId: "...",
  userId: "...",
});
```

This creates:
- English pages: home, hello, about, products, blog, portfolio
- Multi-language hello pages: hello (en), halo (id), مرحبا (ar), привет (ru)

## Benefits

### 🌍 No Language Barriers
Admins can create pages in **any language** - Arabic, Russian, Chinese, Japanese, Korean, etc. The system doesn't impose language restrictions.

### 🚀 No Code Changes
Create new pages without touching code:
1. Go to admin panel
2. Click "New Page"
3. Set slug (any language), page type, content
4. Publish
5. Done! Page is live at `/{slug}`

### 📱 SEO Friendly
Each page has:
- Custom meta title
- Custom meta description
- Custom keywords
- Language locale

### 🎨 Component Reuse
All pages use existing page components from `frontend/features/cms-lite/pages/`:
- No duplicate code
- Consistent design
- Easy maintenance

## Future Enhancements

- [ ] Custom page templates
- [ ] Page versioning
- [ ] A/B testing
- [ ] Analytics integration
- [ ] Auto-translation
- [ ] Rich content editor
- [ ] Media library integration
- [ ] URL redirects
- [ ] Page cloning
- [ ] Bulk operations

## Examples

### Multi-Language Navigation

```tsx
// English site
<Link href="/hello">Quick Links</Link>

// Arabic site
<Link href="/مرحبا">روابط سريعة</Link>

// Russian site
<Link href="/привет">Быстрые ссылки</Link>

// Indonesian site
<Link href="/halo">Tautan Cepat</Link>
```

All map to the **same page component** (HelloPage.tsx) with **different slugs**!

### Creating Custom Landing Pages

```typescript
// Create special landing page for campaign
await createPage({
  slug: "summer-sale-2024",
  locale: "en",
  pageType: "custom",
  title: "Summer Sale 2024",
  metaTitle: "50% Off Summer Sale 2024",
  isPublished: true,
});
```

URL: `http://localhost:3000/summer-sale-2024`

## Troubleshooting

### Page not found
- Check if page is published (`isPublished: true`)
- Verify slug is correct (case-sensitive)
- Check if workspace matches

### Slug conflict
- Each slug must be unique per workspace
- System will throw error if duplicate slug exists

### Page not updating
- Clear browser cache
- Check Convex dashboard for data
- Verify mutations are completing successfully

## Related Files

- `convex/features/cms_lite/pages/api/schema.ts` - Database schema
- `convex/features/cms_lite/pages/api/queries.ts` - Public queries
- `convex/features/cms_lite/pages/api/mutations.ts` - Admin mutations
- `convex/features/cms_lite/pages/api/internalMutations.ts` - Seed data
- `app/(cms)/[...slug]/page.tsx` - Dynamic route handler
- `frontend/features/cms-lite/components/PagesManager.tsx` - Admin UI
