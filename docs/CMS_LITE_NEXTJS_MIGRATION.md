# React Router to Next.js Migration - CMS Lite

## Summary

Successfully migrated CMS Lite components from React Router to Next.js App Router best practices.

## Files Updated

### ✅ BlogPostPage.tsx
**Changes:**
- ❌ Removed: `import { useParams, Link } from "react-router-dom"`
- ✅ Added: `import { usePathname } from "next/navigation"`
- ✅ Added: `import Link from "next/link"`
- ✅ Changed: `useParams()` → `usePathname()` with slug extraction
- ✅ Changed: `<Link to="/blog">` → `<Link href="/blog">`
- ✅ Added: Optional `slug` prop for dynamic route usage

**Usage:**
```tsx
// From dynamic route
<BlogPostPage slug={params.slug} />

// Standalone (extracts slug from pathname)
<BlogPostPage />
```

### ✅ ProductDetailPage.tsx
**Changes:**
- ❌ Removed: `import { useParams, Link } from "react-router-dom"`
- ✅ Added: `import { usePathname } from "next/navigation"`
- ✅ Added: `import Link from "next/link"`
- ✅ Changed: `useParams()` → `usePathname()` with slug extraction
- ✅ Changed: `<Link to="/products">` → `<Link href="/products">`
- ✅ Added: Optional `slug` prop for dynamic route usage

**Usage:**
```tsx
// From dynamic route
<ProductDetailPage slug={params.slug} />

// Standalone (extracts slug from pathname)
<ProductDetailPage />
```

### ⚠️ AdminLayout.tsx (LEGACY - Not Migrated)
**Status:** Marked as legacy, not migrated

**Reason:** This component was designed for a standalone React app and uses patterns incompatible with Next.js:
- `Outlet` - No equivalent in Next.js (use layouts)
- `Navigate` - Use Next.js `redirect()` instead
- `useNavigate` - Use Next.js `useRouter()` instead
- `useLocation` - Use Next.js `usePathname()` instead
- Client-side localStorage auth - Use Next.js middleware + Clerk

**Next.js Equivalent:**
- Admin layout: `app/dashboard/layout.tsx`
- Sidebar: `components/sidebar.tsx`
- Navigation: Use Next.js `<Link>` components
- Auth: Clerk middleware in `middleware.ts`

## Migration Patterns

### Pattern 1: Link Components
```tsx
// ❌ React Router
import { Link } from "react-router-dom";
<Link to="/products">Products</Link>

// ✅ Next.js
import Link from "next/link";
<Link href="/products">Products</Link>
```

### Pattern 2: Route Parameters
```tsx
// ❌ React Router
import { useParams } from "react-router-dom";
const { slug } = useParams<{ slug: string }>();

// ✅ Next.js (Client Component)
import { usePathname } from "next/navigation";
const pathname = usePathname();
const slug = pathname?.split('/').pop();

// ✅ Next.js (Server Component)
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
}
```

### Pattern 3: Navigation
```tsx
// ❌ React Router
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/login");

// ✅ Next.js
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/login");
```

### Pattern 4: Current Location
```tsx
// ❌ React Router
import { useLocation } from "react-router-dom";
const location = useLocation();
const isActive = location.pathname === "/admin";

// ✅ Next.js
import { usePathname } from "next/navigation";
const pathname = usePathname();
const isActive = pathname === "/admin";
```

### Pattern 5: Redirects
```tsx
// ❌ React Router
import { Navigate } from "react-router-dom";
if (!token) return <Navigate to="/login" replace />;

// ✅ Next.js (Server Component)
import { redirect } from "next/navigation";
if (!token) redirect("/login");

// ✅ Next.js (Client Component)
import { useRouter } from "next/navigation";
const router = useRouter();
if (!token) router.replace("/login");
```

### Pattern 6: Nested Routes
```tsx
// ❌ React Router
import { Outlet } from "react-router-dom";
return <Layout><Outlet /></Layout>;

// ✅ Next.js (layout.tsx)
export default function Layout({ children }: { children: React.ReactNode }) {
  return <LayoutComponent>{children}</LayoutComponent>;
}
```

## Benefits of Next.js Approach

### 🚀 Performance
- **Server Components** - Faster initial load
- **Automatic Code Splitting** - Only load what's needed
- **Image Optimization** - Built-in with `next/image`
- **Font Optimization** - Built-in with `next/font`

### 🔒 Security
- **Middleware** - Server-side auth checks
- **API Routes** - Secure backend endpoints
- **Environment Variables** - Proper secret handling

### 📱 SEO
- **Server-Side Rendering** - Better SEO
- **Static Site Generation** - Pre-rendered pages
- **Metadata API** - Easy meta tags

### 🛠️ Developer Experience
- **File-based Routing** - No route config needed
- **TypeScript** - Better type safety
- **Layouts** - Shared UI without Outlet
- **Loading States** - Built-in loading.tsx

## Testing Checklist

- [x] BlogPostPage renders with slug prop
- [x] BlogPostPage extracts slug from pathname
- [x] ProductDetailPage renders with slug prop
- [x] ProductDetailPage extracts slug from pathname
- [x] All `<Link to=` converted to `<Link href=`
- [x] No react-router-dom imports in active code
- [x] Legacy AdminLayout marked with warning

## Next Steps

### For New Admin UI
Instead of using the legacy AdminLayout, create:

1. **Dashboard Layout** (`app/dashboard/layout.tsx`):
```tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

2. **Sidebar Component** (`components/sidebar.tsx`):
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64">
      <Link 
        href="/dashboard" 
        className={pathname === "/dashboard" ? "active" : ""}
      >
        Dashboard
      </Link>
      {/* More links */}
    </aside>
  );
}
```

3. **Auth Middleware** (`middleware.ts`):
```tsx
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});
```

## Common Issues & Solutions

### Issue: "Module not found: react-router-dom"
**Solution:** Component still imports react-router-dom. Replace with Next.js equivalent.

### Issue: "useParams is not a function"
**Solution:** Use `usePathname()` in client components or `params` prop in server components.

### Issue: "Link to prop not working"
**Solution:** Next.js Link uses `href`, not `to`. Change `<Link to="/path">` → `<Link href="/path">`.

### Issue: "Navigate component not found"
**Solution:** Use `redirect()` in server components or `router.replace()` in client components.

### Issue: "Outlet not rendering children"
**Solution:** Next.js doesn't use Outlet. Create a layout.tsx with `children` prop instead.

## References

- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Link](https://nextjs.org/docs/app/api-reference/components/link)
- [Next.js useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Clerk Next.js](https://clerk.com/docs/quickstarts/nextjs)

## Files Inventory

### ✅ Migrated (Active)
- `frontend/features/cms-lite/pages/BlogPostPage.tsx`
- `frontend/features/cms-lite/pages/ProductDetailPage.tsx`
- `frontend/features/cms-lite/pages/HelloPage.tsx` (already using useQuery)

### ⚠️ Legacy (Inactive)
- `frontend/features/cms-lite/features/admin/components/AdminLayout.tsx`

### 🎯 Next.js Replacements (Active)
- `app/dashboard/layout.tsx` - Main dashboard layout
- `components/sidebar.tsx` - Sidebar navigation
- `middleware.ts` - Auth protection
- `app/(cms)/[...slug]/page.tsx` - Dynamic CMS pages

---

**Migration Status:** ✅ Complete

All active CMS Lite components now follow Next.js best practices!
