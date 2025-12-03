# Tabs System

Standardized tabs component for consistent UI across the application.

## Features

- **Multiple variants**: default, pills, underline, boxed, segment, minimal
- **Orientations**: horizontal and vertical
- **Compound pattern**: `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`
- **Declarative pattern**: Pass `tabs` array prop
- **Icons & badges**: Full support for Lucide icons and badges
- **Keyboard navigation**: Arrow keys, Home, End
- **Lazy loading**: Only render active tab content
- **Accessibility**: Full ARIA support

## Usage

### Compound Pattern (Flexible)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/frontend/shared/ui/layout/tabs"
import { Home, Settings, User } from "lucide-react"

<Tabs defaultActiveTab="home" variant="pills">
  <TabsList>
    <TabsTrigger value="home" icon={Home}>Home</TabsTrigger>
    <TabsTrigger value="settings" icon={Settings}>Settings</TabsTrigger>
    <TabsTrigger value="profile" icon={User} badge="3">Profile</TabsTrigger>
  </TabsList>
  
  <TabsContent value="home">
    <HomePage />
  </TabsContent>
  <TabsContent value="settings">
    <SettingsPage />
  </TabsContent>
  <TabsContent value="profile">
    <ProfilePage />
  </TabsContent>
</Tabs>
```

### Declarative Pattern (Simple)

```tsx
import { Tabs } from "@/frontend/shared/ui/layout/tabs"
import { Home, Settings, User } from "lucide-react"

<Tabs
  variant="underline"
  tabs={[
    { id: "home", label: "Home", icon: Home, content: <HomePage /> },
    { id: "settings", label: "Settings", icon: Settings, content: <SettingsPage /> },
    { id: "profile", label: "Profile", icon: User, badge: "3", content: <ProfilePage /> },
  ]}
  onTabChange={(tabId) => console.log("Active:", tabId)}
/>
```

### Controlled Mode

```tsx
const [activeTab, setActiveTab] = useState("home")

<Tabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
  tabs={myTabs}
/>
```

## Variants

| Variant | Description |
|---------|-------------|
| `default` | Standard underline indicator |
| `pills` | Pill-shaped background on active |
| `underline` | Clean underline indicator |
| `boxed` | Bordered box around active |
| `segment` | iOS-style segmented control |
| `minimal` | Hover effects only |

```tsx
// Pills variant
<Tabs variant="pills" tabs={tabs} />

// Segment control (full width)
<Tabs variant="segment" fullWidth tabs={tabs} />

// Minimal (no indicators)
<Tabs variant="minimal" tabs={tabs} />
```

## Sizes

```tsx
<Tabs size="sm" tabs={tabs} /> // Compact
<Tabs size="md" tabs={tabs} /> // Default
<Tabs size="lg" tabs={tabs} /> // Large
```

## Orientations

```tsx
// Horizontal (default)
<Tabs orientation="horizontal" tabs={tabs} />

// Vertical (sidebar style)
<Tabs orientation="vertical" tabs={tabs} />
```

## Alignment

```tsx
<Tabs alignment="start" tabs={tabs} />   // Left/top aligned
<Tabs alignment="center" tabs={tabs} />  // Centered
<Tabs alignment="end" tabs={tabs} />     // Right/bottom aligned
<Tabs alignment="stretch" tabs={tabs} /> // Full width
```

## Features

### Icons & Badges

```tsx
<Tabs
  tabs={[
    { id: "inbox", label: "Inbox", icon: Inbox, badge: 12 },
    { id: "sent", label: "Sent", icon: Send },
    { id: "drafts", label: "Drafts", icon: File, disabled: true },
  ]}
/>
```

### Lazy Loading

```tsx
// Only render active tab content
<Tabs lazy tabs={tabs} />

// Keep all tabs mounted (preserve state)
<Tabs keepMounted tabs={tabs} />
```

### Keyboard Navigation

- **Arrow keys**: Navigate between tabs (horizontal: Left/Right, vertical: Up/Down)
- **Home**: Go to first tab
- **End**: Go to last tab
- **Enter/Space**: Activate focused tab

```tsx
// Disable keyboard navigation
<Tabs keyboard={false} tabs={tabs} />
```

## Presets

Use pre-configured settings for common patterns:

```tsx
import { TAB_PRESETS } from "@/frontend/shared/ui/layout/tabs"

// Default tabs
<Tabs {...TAB_PRESETS.default} tabs={tabs} />

// Pill tabs
<Tabs {...TAB_PRESETS.pills} tabs={tabs} />

// Segment control
<Tabs {...TAB_PRESETS.segment} tabs={tabs} />

// Vertical sidebar tabs
<Tabs {...TAB_PRESETS.sidebar} tabs={tabs} />

// Compact underline tabs
<Tabs {...TAB_PRESETS.compact} tabs={tabs} />
```

## API Reference

### TabsProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | `[]` | Array of tab items |
| `activeTab` | `string` | - | Controlled active tab |
| `defaultActiveTab` | `string` | - | Initial active tab |
| `onTabChange` | `(id: string) => void` | - | Tab change callback |
| `variant` | `TabVariant` | `"default"` | Visual variant |
| `size` | `TabSize` | `"md"` | Size variant |
| `orientation` | `TabOrientation` | `"horizontal"` | Layout direction |
| `alignment` | `TabAlignment` | `"start"` | Tab alignment |
| `fullWidth` | `boolean` | `false` | Full width tabs |
| `keyboard` | `boolean` | `true` | Enable keyboard nav |
| `lazy` | `boolean` | `false` | Lazy load content |
| `keepMounted` | `boolean` | `false` | Keep inactive mounted |

### TabItem

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display label |
| `icon` | `LucideIcon` | Optional icon |
| `content` | `ReactNode` | Tab content |
| `disabled` | `boolean` | Whether disabled |
| `badge` | `string \| number` | Badge text/count |

## File Structure

```
tabs/
├── index.ts      # Exports
├── types.ts      # Type definitions
├── context.tsx   # React context
├── styles.ts     # Styling utilities
├── Tabs.tsx      # Main component
└── README.md     # This file
```
