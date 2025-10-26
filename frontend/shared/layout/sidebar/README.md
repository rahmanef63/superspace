# Unified Sidebar System

A comprehensive, modular sidebar system for the SuperSpace application combining primary navigation, secondary feature sidebars, and shared components.

## 📁 Directory Structure

```
frontend/shared/layout/sidebar/
├── primary/                    # Main App Sidebar (Navigation)
│   ├── AppSidebar.tsx          # Main sidebar container
│   ├── WorkspaceSwitcher.tsx   # Workspace selection dropdown
│   ├── NavMain.tsx             # Primary navigation items
│   ├── NavSecondary.tsx        # Secondary navigation (settings, support)
│   ├── NavSystem.tsx           # System menu items
│   ├── NavUser.tsx             # User profile menu
│   └── index.ts                # Barrel exports
├── secondary/                  # Feature-Specific Sidebars
│   ├── components/
│   │   ├── SecondarySidebarLayout.tsx    # Layout container
│   │   ├── SecondarySidebarHeader.tsx    # Header with actions
│   │   ├── SecondarySidebar.tsx          # Sidebar with sections
│   │   └── SecondarySidebarTools.tsx     # Search, filter, sort tools
│   ├── index.ts                # Barrel exports
│   └── README.md               # Secondary sidebar documentation
├── components/                 # Shared Components
│   ├── breadcrumbs-context.tsx # Breadcrumb state management
│   ├── onboarding-guard.tsx    # Workspace onboarding check
│   ├── site-header.tsx         # Top header with breadcrumbs
│   ├── state-pages.tsx         # Error & not-found states
│   ├── loading-bar.tsx         # Top loading indicator
│   └── index.ts                # Barrel exports
├── index.ts                    # Master barrel export
└── README.md                   # This file
```

##  Purpose & Organization

### Primary Sidebar (`primary/`)
**Purpose**: Main application navigation for the dashboard

**Components**:
- `AppSidebar`: Main sidebar container that orchestrates all nav components
- `WorkspaceSwitcher`: Workspace selection with dropdown
- `NavMain`: Primary navigation items (Overview, Chat, Calls, etc.)
- `NavSecondary`: Bottom navigation (Support, Feedback, Dark mode)
- `NavSystem`: System-level menu items (Settings, etc.)
- `NavUser`: User profile and account menu

**Used in**:
- [app/dashboard/layout.tsx](../../../../app/dashboard/layout.tsx)

**Import pattern**:
```tsx
import { AppSidebar } from "@/frontend/shared/layout/sidebar/primary/AppSidebar";
// or
import { AppSidebar } from "@/frontend/shared/layout/sidebar";
```

### Secondary Sidebar (`secondary/`)
**Purpose**: Feature-specific navigation and tools for individual pages

**Components**:
- `SecondarySidebarLayout`: Complete layout with header, sidebar, and content
- `SecondarySidebarHeader`: Header with title, actions, breadcrumbs, toolbar
- `SecondarySidebar`: Sidebar with customizable sections
- `SecondarySidebarTools`: Search, sort, filter, view toggle controls

**Used in**:
- [frontend/features/menu-store/page.tsx](../../../features/menu-store/page.tsx)
- [frontend/features/documents/shared/components/DocumentsBrowser.tsx](../../../features/documents/shared/components/DocumentsBrowser.tsx)
- [frontend/features/chat/components/chat/ChatsView.tsx](../../../features/chat/components/chat/ChatsView.tsx)
- And more feature pages

**Import pattern**:
```tsx
import { SecondarySidebarLayout } from "@/frontend/shared/layout/sidebar/secondary";
// or
import { SecondarySidebarLayout } from "@/frontend/shared/layout/sidebar";
```

### Shared Components (`components/`)
**Purpose**: Common components used across different sidebar types

**Components**:
- `breadcrumbs-context`: React context for managing breadcrumb navigation
- `onboarding-guard`: Redirects to workspace creation if needed
- `site-header`: Top header with breadcrumbs and sidebar trigger
- `state-pages`: Error and not-found state components
- `loading-bar`: Top-level loading indicator

**Used in**:
- [app/dashboard/layout.tsx](../../../../app/dashboard/layout.tsx)
- [app/dashboard/[[...slug]]/error.tsx](../../../../app/dashboard/[[...slug]]/error.tsx)
- [app/dashboard/[[...slug]]/not-found.tsx](../../../../app/dashboard/[[...slug]]/not-found.tsx)
- And various feature components

**Import pattern**:
```tsx
import { useBreadcrumbs, SiteHeader } from "@/frontend/shared/layout/sidebar/components";
// or
import { useBreadcrumbs } from "@/frontend/shared/layout/sidebar";
```

##  Usage Examples

### Example 1: Main Dashboard Layout

```tsx
// app/dashboard/layout.tsx
import {
  AppSidebar,
  SiteHeader,
  BreadcrumbsProvider,
  LoadingBar,
  OnboardingGuard
} from "@/frontend/shared/layout/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <BreadcrumbsProvider>
        <WorkspaceProvider>
          <OnboardingGuard />
          <AppSidebar />
          <SidebarInset>
            <LoadingBar />
            <SiteHeader />
            {children}
          </SidebarInset>
        </WorkspaceProvider>
      </BreadcrumbsProvider>
    </SidebarProvider>
  );
}
```

### Example 2: Feature Page with Secondary Sidebar

```tsx
// frontend/features/documents/DocumentsPage.tsx
import { SecondarySidebarLayout } from "@/frontend/shared/layout/sidebar/secondary";

export default function DocumentsPage({ workspaceId }) {
  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "Documents",
        description: "Manage your workspace documents",
        primaryAction: {
          label: "New Document",
          icon: Plus,
          onClick: handleCreate,
        },
        toolbar: <DocumentsToolbar />,
      }}
      sidebarProps={{
        sections: [
          {
            title: "Folders",
            content: <FolderTree />,
          },
        ],
      }}
    >
      <DocumentsGrid />
    </SecondarySidebarLayout>
  );
}
```

### Example 3: Using Breadcrumbs

```tsx
// app/dashboard/[[...slug]]/page.tsx
import { useBreadcrumbs } from "@/frontend/shared/layout/sidebar";

function MyPage() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Documents", href: "/dashboard/documents" },
      { label: "Report.pdf", href: "/dashboard/documents/123" },
    ]);
  }, []);

  return <div>Content</div>;
}
```

## 🎨 Component APIs

### AppSidebar Props

```typescript
interface AppSidebarProps {
  workspaceId?: Id<"workspaces"> | null;
  onWorkspaceChange?: (workspaceId: Id<"workspaces">) => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}
```

### SecondarySidebarLayout Props

```typescript
interface SecondarySidebarLayoutProps {
  header?: ReactNode;  // Custom header
  sidebar?: ReactNode; // Custom sidebar
  children: ReactNode; // Main content area
  headerProps?: {
    title: string;
    description?: ReactNode;
    primaryAction?: {
      label: string;
      icon?: React.ElementType;
      onClick?: () => void;
    };
    toolbar?: ReactNode;
  };
  sidebarProps?: {
    sections?: Array<{
      title?: string;
      content?: ReactNode;
      items?: Array<{
        id: string;
        label: string;
        icon?: React.ElementType;
        onClick?: () => void;
      }>;
    }>;
  };
}
```

### Breadcrumbs Context API

```typescript
interface BreadcrumbItem {
  label: string;
  href: string;
}

function useBreadcrumbs() {
  return {
    breadcrumbs: BreadcrumbItem[];
    setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  };
}
```

## 📦 Migration Guide

### From Old Structure

If you're migrating from the old structure:

**Old imports**:
```tsx
// ❌ Old - Don't use
import { AppSidebar } from "@/app/dashboard/_components/app-sidebar";
import { SecondarySidebarLayout } from "@/frontend/shared/layout/secondary-sidebar";
import { useBreadcrumbs } from "@/app/dashboard/_components/breadcrumbs-context";
```

**New imports**:
```tsx
// ✅ New - Use these
import { AppSidebar } from "@/frontend/shared/layout/sidebar/primary/AppSidebar";
import { SecondarySidebarLayout } from "@/frontend/shared/layout/sidebar/secondary";
import { useBreadcrumbs } from "@/frontend/shared/layout/sidebar/components/breadcrumbs-context";

// Or use barrel exports
import { AppSidebar, SecondarySidebarLayout, useBreadcrumbs } from "@/frontend/shared/layout/sidebar";
```

### File Mappings

| Old Location | New Location |
|--------------|--------------|
| `app/dashboard/_components/app-sidebar.tsx` | `frontend/shared/layout/sidebar/primary/AppSidebar.tsx` |
| `app/dashboard/_components/WorkspaceSwitcher.tsx` | `frontend/shared/layout/sidebar/primary/WorkspaceSwitcher.tsx` |
| `app/dashboard/_components/NavMain.tsx` | `frontend/shared/layout/sidebar/primary/NavMain.tsx` |
| `frontend/shared/layout/secondary-sidebar/` | `frontend/shared/layout/sidebar/secondary/` |
| `app/dashboard/_components/breadcrumbs-context.tsx` | `frontend/shared/layout/sidebar/components/breadcrumbs-context.tsx` |

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- Primary sidebar: App-level navigation
- Secondary sidebar: Feature-level navigation
- Shared components: Reusable utilities

### 2. **DRY (Don't Repeat Yourself)**
- Single source of truth for sidebar components
- No duplicate code between features
- Reusable patterns for common use cases

### 3. **Type Safety**
- Full TypeScript coverage
- Exported types for all props
- Type-safe context providers

### 4. **Composition over Configuration**
- Components can be used individually
- Layout components accept custom children
- Flexible props for customization

## 🔧 Best Practices

1. **Use barrel exports** for cleaner imports:
   ```tsx
   import { AppSidebar, SecondarySidebarLayout } from "@/frontend/shared/layout/sidebar";
   ```

2. **Prefer `headerProps`/`sidebarProps`** over custom components when possible:
   ```tsx
   <SecondarySidebarLayout
     headerProps={{ title: "My Feature" }}
     // Better than creating custom header
   >
   ```

3. **Keep breadcrumbs updated** in page components:
   ```tsx
   useEffect(() => {
     setBreadcrumbs([...]);
   }, [currentPage]);
   ```

4. **Use TypeScript types** for props:
   ```tsx
   import type { AppSidebarProps } from "@/frontend/shared/layout/sidebar";
   ```

## 📚 Related Documentation

- [Menu System](../menus/README.md)
- [Secondary Sidebar Details](./secondary/README.md)
- [Feature Package System](../../../../docs/1_SYSTEM_OVERVIEW.md)

## 🐛 Troubleshooting

### Issue: Import errors after migration
**Solution**: Use the new import paths from `@/frontend/shared/layout/sidebar`

### Issue: Breadcrumbs not showing
**Solution**: Ensure `BreadcrumbsProvider` wraps your layout and `setBreadcrumbs()` is called

### Issue: Sidebar not rendering
**Solution**: Check that `SidebarProvider` from `@/components/ui/sidebar` wraps your layout

---

**Version**: 2.0.0
**Last Updated**: 2025-10-21
**Maintained by**: SuperSpace Team
