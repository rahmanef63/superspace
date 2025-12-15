# Feature Layout System

This document describes the standard layout patterns for all features in SuperSpace.

## Quick Start

All features should use one of these two layouts to ensure AI assistant panel support:

### 1. Simple Features (No Left Sidebar)

Use `FeatureLayout` for features that don't need a left navigation panel:

```tsx
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout";

export default function MyFeaturePage({ workspaceId }) {
  return (
    <FeatureLayout featureId="my-feature">
      <MyFeatureContent workspaceId={workspaceId} />
    </FeatureLayout>
  );
}
```

### 2. Complex Features (With Left Sidebar)

Use `FeatureThreeColumnLayout` for master-detail UIs with a sidebar:

```tsx
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column";

export function MyComplexView({ workspaceId }) {
  return (
    <FeatureThreeColumnLayout
      featureId="my-feature"
      sidebarTitle="Items"
      sidebarContent={<ItemsList />}
      mainContent={<ItemDetail />}
      inspector={<ItemInspector />}
    />
  );
}
```

## Architecture

### Two-Column Layout (FeatureLayout)

```
┌─────────────────────────────────────────────────────────────┐
│                      Feature Header                         │
│                                          [Settings] [🤖 AI] │
├────────────────────────────────────┬────────────────────────┤
│                                    │                        │
│                                    │                        │
│           Main Content             │    AI Assistant Panel  │
│                                    │    (toggleable)        │
│                                    │                        │
│                                    │                        │
└────────────────────────────────────┴────────────────────────┘
```

- **Left/Center Column**: Main feature content
- **Right Column**: AI assistant panel (hidden by default, toggled via header button)

### Three-Column Layout (FeatureThreeColumnLayout)

```
┌─────────────────────────────────────────────────────────────┐
│                      Feature Header                         │
│                                          [Settings] [🤖 AI] │
├────────────┬───────────────────────┬────────────────────────┤
│            │                       │                        │
│  Sidebar   │    Main Content       │  Right Panel           │
│  (List)    │    (Detail View)      │  (Inspector or AI)     │
│            │                       │                        │
└────────────┴───────────────────────┴────────────────────────┘
```

- **Left Column**: Navigation sidebar (item list, tree, etc.)
- **Center Column**: Main content area (detail view)
- **Right Column**: Inspector OR AI panel (can toggle between modes)

## Component Reference

### FeatureLayout

The minimum standard layout for all features. Automatically provides:
- 2-column layout with collapsible AI panel on the right
- Integration with `FeatureAIAssistant` button in header
- Mobile-responsive design (drawer for AI on mobile)

```tsx
interface FeatureLayoutProps {
  /** Feature ID for the AI assistant */
  featureId: string;
  /** Main content */
  children: React.ReactNode;
  /** Whether to show max-width container */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | false;
  /** Whether to add default padding */
  padding?: boolean;
  /** Whether to center content horizontally */
  centered?: boolean;
  /** AI panel default width */
  aiPanelWidth?: number;
  /** Default AI panel open state */
  defaultAIPanelOpen?: boolean;
  /** AI panel placeholder text */
  aiPlaceholder?: string;
  /** Additional context for the AI */
  aiContext?: Record<string, any>;
}
```

### TwoColumnWithAILayout

Lower-level component if you need more control:

```tsx
<TwoColumnWithAILayout featureId="documents">
  {/* Your custom content */}
</TwoColumnWithAILayout>
```

### AIAssistantPanelProvider

Context provider for controlling AI panel state programmatically:

```tsx
const { isPanelOpen, openPanel, closePanel, togglePanel, setContext } = useAIAssistantPanel();
```

## How AI Button Works

The `FeatureAIAssistant` button in the header automatically detects which mode to use:

1. **Panel Mode** (default when inside `FeatureLayout` or `TwoColumnWithAILayout`):
   - Button toggles the right panel open/closed
   - Shows active state when panel is open

2. **Dialog Mode** (fallback):
   - Opens AI in a modal dialog (desktop) or drawer (mobile)
   - Used when feature doesn't have AI panel layout

## Migration Guide

### From PageContainer to FeatureLayout

Before:
```tsx
import { PageContainer } from "@/frontend/shared/ui/layout/container";

export default function MyPage({ workspaceId }) {
  return (
    <PageContainer centered>
      <MyContent />
    </PageContainer>
  );
}
```

After:
```tsx
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout";

export default function MyPage({ workspaceId }) {
  return (
    <FeatureLayout featureId="my-feature" centered>
      <MyContent />
    </FeatureLayout>
  );
}
```

### From raw div to FeatureLayout

Before:
```tsx
export default function MyPage({ workspaceId }) {
  return (
    <div className="flex flex-col h-full p-6">
      <MyContent />
    </div>
  );
}
```

After:
```tsx
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout";

export default function MyPage({ workspaceId }) {
  return (
    <FeatureLayout featureId="my-feature">
      <MyContent />
    </FeatureLayout>
  );
}
```

## Best Practices

1. **Always specify `featureId`**: This connects the layout to the correct AI agent
2. **Use the minimum layout needed**: Don't use 3-column when 2-column suffices
3. **Keep content scrollable**: The layout handles scrolling, don't add redundant scroll areas
4. **Consider mobile**: Both layouts are responsive and handle mobile differently
