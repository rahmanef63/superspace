# Studio JSON Schema — Guide, Rules & Context

> Use this document as **base knowledge** when asking an AI to generate Studio layouts in JSON format.
> The AI should return a valid Schema object that can be imported directly into Studio.

---

## 1. Schema Structure

Every Studio layout is a **Schema** JSON object:

```json
{
  "version": "0.4",
  "root": ["hero-section"],
  "nodes": {
    "hero-section": {
      "type": "div",
      "props": { "className": "flex flex-col items-center gap-8 py-24 px-8 bg-slate-900 text-white" },
      "children": ["hero-title", "hero-cta"]
    },
    "hero-title": {
      "type": "text",
      "props": { "tag": "h1", "content": "Hello World", "className": "text-5xl font-bold text-center" },
      "children": []
    },
    "hero-cta": {
      "type": "button",
      "props": { "text": "Get Started", "className": "bg-white text-slate-900 px-8 py-3 rounded-full font-semibold" },
      "children": []
    }
  }
}
```

| Field     | Type            | Description                                      |
|-----------|-----------------|--------------------------------------------------|
| `version` | `"0.4"`         | Always `"0.4"` — do not change                  |
| `root`    | `string[]`      | IDs of top-level nodes (no parent)               |
| `nodes`   | `Record<id, SchemaNode>` | All nodes keyed by unique string ID    |

---

## 2. SchemaNode

```ts
{
  type: string;               // Widget key (see Section 3)
  props: Record<string, any>; // Only non-default props needed
  children: string[];         // Ordered list of child node IDs — use [] for leaf nodes
}
```

**Rules:**
- **Only include props that differ from defaults** — missing props use widget defaults.
- **Node IDs** must be unique strings. Use descriptive names like `hero-section`, `nav-bar`, `cta-button`.
- **Children** must reference IDs defined in `nodes`.
- Circular references are forbidden.
- Every node referenced as a child must exist in `nodes`.
- Every node ID in `root` must exist in `nodes`.

---

## 3. Available Widget Types

### Layout

> ✅ **Preferred**: Use `div` for all layout containers — it supports all display modes.
> ⚠️ `row`, `column`, `container` are deprecated legacy aliases (still renderable but not shown in Library).

| Type          | Label           | Key Props                                                                    |
|---------------|-----------------|------------------------------------------------------------------------------|
| `div`         | Div (universal) | `tag`, `display`, `flexDirection`, `justifyContent`, `alignItems`, `gap`, `className`, `path` |
| `section`     | Page            | `path` (route), `className`                                                  |
| `grid`        | Grid            | `columns` (`"2"/"3"/"4"`), `gap` (`"sm"/"md"/"lg"`), `className`             |
| `flex`        | Flex            | `direction`, `gap`, `align`, `justify`, `wrap`, `className`                  |
| `twoColumn`   | Two Column      | `leftWidth`, `gap`                                                           |
| `threeColumn` | Three Column    | `leftWidth`, `rightWidth`, `resizable`                                       |

### Content

| Type   | Label | Key Props                                              |
|--------|-------|--------------------------------------------------------|
| `text` | Text  | `tag` (p/h1-h6/span/div), `content`, `className`      |
| `card` | Card  | `title`, `description`, `imageUrl`, `className`        |

### Media

| Type    | Label | Key Props                              |
|---------|-------|----------------------------------------|
| `image` | Image | `src`, `alt`, `className`              |

### Action

| Type         | Label       | Key Props                                                              |
|--------------|-------------|------------------------------------------------------------------------|
| `button`     | Button      | `text`, `variant`, `size`, `href`, `className`                         |
| `iconButton` | Icon Button | `icon`, `variant`, `size`, `className`                                 |

### Navigation

| Type       | Label     | Key Props                       |
|------------|-----------|---------------------------------|
| `navGroup` | Nav Group | `placement` (sidebar/header)    |
| `link`     | Link      | `href`, `label`, `target`       |

### Templates

| Type            | Label           | Key Props                |
|-----------------|-----------------|--------------------------|
| `hero`          | Hero            | `title`, `subtitle`, `cta` |
| `heroComposite` | Hero Composite  | `title`, `subtitle`      |

### UI Components (shadcn)

| Type         | Label        | Notes                              |
|--------------|--------------|------------------------------------|
| `accordion`  | Accordion    | `items` array                      |
| `alert`      | Alert        | `title`, `description`, `variant`  |
| `avatar`     | Avatar       | `src`, `fallback`                  |
| `badge`      | Badge        | `label`, `variant`                 |
| `tabs`       | Tabs         | `items` (array of {label, content})|
| `dialog`     | Dialog       | `trigger`, `title`, `content`      |
| `input`      | Input        | `placeholder`, `label`, `type`     |
| `select`     | Select       | `placeholder`, `options`           |
| `checkbox`   | Checkbox     | `label`, `checked`                 |
| `switch`     | Switch       | `label`, `checked`                 |
| `separator`  | Separator    | `orientation`                      |
| `spacer`     | Spacer       | `size`                             |
| `progress`   | Progress     | `value`, `max`                     |
| `tooltip`    | Tooltip      | `trigger`, `content`               |
| `breadcrumb` | Breadcrumb   | `items`                            |
| `carousel`   | Carousel     | `items`                            |
| `table`      | Table (UI)   | `columns`, `rows`                  |
| `textarea`   | Textarea     | `placeholder`, `rows`              |
| `scrollArea` | Scroll Area  | —                                  |

### Smart Blocks (data-bound)

| Type            | Label        | Key Props                                  |
|-----------------|--------------|--------------------------------------------|
| `tableBlock`    | Table        | `title`, `columns`, `data`                 |
| `chartBlock`    | Chart        | `title`, `type` (bar/line/pie), `data`     |
| `kanbanBlock`   | Kanban       | `title`, `columns`                         |
| `calendarBlock` | Calendar     | `title`, `events`                          |
| `filterBlock`   | Filter       | `title`, `fields`                          |
| `formBlock`     | Form         | `title`, `fields`, `submitLabel`           |
| `listBlock`     | List         | `title`, `items`, `maxItems`               |
| `statsBlock`    | Stats        | `title`, `stats`                           |
| `activityBlock` | Activity     | `title`, `activities`, `maxItems`          |
| `eventsBlock`   | Events       | `title`, `events`                          |
| `profileBlock`  | Profile      | `name`, `role`, `avatar`                   |
| `metricCardBlock` | Metric     | `label`, `value`, `change`, `trend`        |
| `agentBlock`    | AI Agent     | `agentName`, `description`, `suggestions`  |
| `teamBlock`     | Team         | `title`, `roles`                           |
| `timeRangeBlock`| Time Range   | `value`, `options`                         |
| `fileBlock`     | File         | `title`, `files`                           |
| `commentBlock`  | Comments     | `title`, `comments`                        |
| `richTextBlock` | Rich Text    | `content`                                  |
| `mediaBlock`    | Media        | `title`, `items`                           |

---

## 4. Styling Strategy

### ✅ Recommended: Use `className` with Tailwind utilities

All widgets accept a `className` prop. Pass Tailwind classes directly for full control:

```json
{
  "type": "div",
  "props": {
    "className": "flex flex-col gap-8 max-w-6xl mx-auto px-8 py-20 bg-slate-900 text-white"
  },
  "children": [...]
}
```

### `div` layout props (use instead of deprecated row/column)

| Prop             | Values (CSS)                                                                 |
|------------------|------------------------------------------------------------------------------|
| `display`        | `"block"` \| `"flex"` \| `"grid"` \| `"inline-flex"`                        |
| `flexDirection`  | `"row"` \| `"column"` \| `"row-reverse"` \| `"column-reverse"`              |
| `justifyContent` | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"space-between"` \| `"space-around"` |
| `alignItems`     | `"flex-start"` \| `"center"` \| `"flex-end"` \| `"stretch"` \| `"baseline"` |
| `gap`            | CSS value: `"0.5rem"` \| `"1rem"` \| `"1.5rem"` \| `"2rem"` \| `"3rem"`    |

### Typography prop values

| Prop         | Valid values                                                                    |
|--------------|---------------------------------------------------------------------------------|
| `fontSize`   | `"xs"` \| `"sm"` \| `"base"` \| `"lg"` \| `"xl"` \| `"2xl"` \| `"3xl"` \| `"4xl"` |
| `fontWeight` | `"300"` \| `"400"` \| `"500"` \| `"600"` \| `"700"` \| `"800"` \| `"900"` (numeric strings) |

> **Note**: `fontSize` and `fontWeight` apply via the inspector built-in sections. For full control, use `className` instead.

### Button variants

```
variant: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive"
size:    "sm" | "default" | "lg" | "icon"
```

---

## 5. Page Routing

To make a page accessible via navigation, use a `section` node (or `div` with `tag: "section"`) with a `path` prop:

```json
"home-page": {
  "type": "section",
  "props": { "path": "/", "className": "flex flex-col min-h-screen bg-white" },
  "children": ["nav", "hero", "footer"]
}
```

The Renderer automatically routes to the node whose `path` matches the active route.

For multi-page schemas, put multiple `section` nodes in `root`:

```json
"root": ["home-page", "about-page", "contact-page"]
```

---

## 6. Rules & Constraints

1. `version` must always be `"0.4"`.
2. `root` must list IDs of nodes that have no parent.
3. **Node IDs** must be unique across the entire `nodes` map.
4. **Never nest a node as its own ancestor** (no circular children).
5. **All IDs in `children` arrays** must exist as keys in `nodes`.
6. **Props are optional** — only include what you want to override from defaults.
7. **Block types** (`tableBlock`, `chartBlock`, etc.) render with placeholder data if no real data is passed.
8. **Smart blocks** should not be nested inside each other — put them as siblings inside a layout container.
9. **Do not use deprecated widget types** (`row`, `column`, `container`, `heading`, `divider`) in new schemas — use `div`, `text`, `separator` instead.
10. **Use `className` for all visual styling** — it's the most reliable and predictable approach.

---

## 7. Example — Dashboard Layout

```json
{
  "version": "0.4",
  "root": ["dashboard-page"],
  "nodes": {
    "dashboard-page": {
      "type": "section",
      "props": { "path": "/dashboard", "className": "flex flex-col gap-6 p-6 bg-background min-h-screen" },
      "children": ["dash-header", "dash-metrics", "dash-main"]
    },
    "dash-header": {
      "type": "div",
      "props": { "className": "flex flex-row items-center justify-between" },
      "children": ["dash-title", "dash-timerange"]
    },
    "dash-title": {
      "type": "text",
      "props": { "tag": "h1", "content": "Dashboard", "className": "text-2xl font-bold" },
      "children": []
    },
    "dash-timerange": {
      "type": "timeRangeBlock",
      "props": { "value": "30d" },
      "children": []
    },
    "dash-metrics": {
      "type": "grid",
      "props": { "columns": "3", "gap": "md" },
      "children": ["metric-1", "metric-2", "metric-3"]
    },
    "metric-1": {
      "type": "metricCardBlock",
      "props": { "label": "Total Users", "value": "1,234", "change": "+12%", "trend": "up" },
      "children": []
    },
    "metric-2": {
      "type": "metricCardBlock",
      "props": { "label": "Revenue", "value": "$45,231", "change": "+8%", "trend": "up" },
      "children": []
    },
    "metric-3": {
      "type": "metricCardBlock",
      "props": { "label": "Active Projects", "value": "23", "change": "-2%", "trend": "down" },
      "children": []
    },
    "dash-main": {
      "type": "div",
      "props": { "className": "grid grid-cols-2 gap-6" },
      "children": ["table-main", "chart-main"]
    },
    "table-main": {
      "type": "tableBlock",
      "props": { "title": "Recent Activity" },
      "children": []
    },
    "chart-main": {
      "type": "chartBlock",
      "props": { "title": "Weekly Revenue", "type": "bar" },
      "children": []
    }
  }
}
```

---

## 8. Example — Dark Theme Hero + Features

```json
{
  "version": "0.4",
  "root": ["page"],
  "nodes": {
    "page": {
      "type": "section",
      "props": { "path": "/", "className": "bg-slate-900 text-white min-h-screen" },
      "children": ["hero", "features"]
    },
    "hero": {
      "type": "div",
      "props": { "className": "flex flex-col items-center gap-8 py-32 px-8 text-center" },
      "children": ["hero-h1", "hero-p", "hero-btns"]
    },
    "hero-h1": {
      "type": "text",
      "props": { "tag": "h1", "content": "Build faster. Ship smarter.", "className": "text-5xl font-black tracking-tight max-w-2xl" },
      "children": []
    },
    "hero-p": {
      "type": "text",
      "props": { "tag": "p", "content": "The all-in-one platform for modern teams.", "className": "text-slate-400 text-xl max-w-lg" },
      "children": []
    },
    "hero-btns": {
      "type": "div",
      "props": { "className": "flex flex-row gap-4" },
      "children": ["btn-primary", "btn-ghost"]
    },
    "btn-primary": {
      "type": "button",
      "props": { "text": "Get Started Free", "className": "bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-slate-100" },
      "children": []
    },
    "btn-ghost": {
      "type": "button",
      "props": { "text": "Watch Demo →", "variant": "ghost", "className": "text-white border border-slate-700 px-8 py-3 rounded-full hover:border-white" },
      "children": []
    },
    "features": {
      "type": "div",
      "props": { "className": "py-24 px-8 bg-slate-800/50" },
      "children": ["features-inner"]
    },
    "features-inner": {
      "type": "div",
      "props": { "className": "max-w-5xl mx-auto flex flex-col gap-12" },
      "children": ["feat-title", "feat-grid"]
    },
    "feat-title": {
      "type": "text",
      "props": { "tag": "h2", "content": "Everything you need", "className": "text-3xl font-bold text-center" },
      "children": []
    },
    "feat-grid": {
      "type": "grid",
      "props": { "columns": "3", "gap": "md" },
      "children": ["feat-1", "feat-2", "feat-3"]
    },
    "feat-1": {
      "type": "card",
      "props": { "title": "⚡ Lightning Fast", "description": "Built on edge infrastructure for sub-50ms responses worldwide.", "className": "bg-slate-800 border-slate-700 rounded-2xl p-6" },
      "children": []
    },
    "feat-2": {
      "type": "card",
      "props": { "title": "🔒 Secure by Default", "description": "End-to-end encryption, RBAC, and audit logs out of the box.", "className": "bg-slate-800 border-slate-700 rounded-2xl p-6" },
      "children": []
    },
    "feat-3": {
      "type": "card",
      "props": { "title": "🧩 Modular", "description": "Compose layouts from schema-driven components. No code needed.", "className": "bg-slate-800 border-slate-700 rounded-2xl p-6" },
      "children": []
    }
  }
}
```

---

## 9. Validation Rules (checked by ImportJsonDialog)

When importing JSON, Studio validates:

| Check | Severity |
|-------|----------|
| Top-level must be `{ version, root, nodes }` | Error |
| `root` must be `string[]` | Error |
| All root IDs must exist in `nodes` | Error |
| All child IDs must exist in `nodes` | Error |
| No circular references allowed | Error |
| Widget `type` must be a known widget key | Warning |
| `children` must be an array | Warning |
| `props` must be an object | Error |

**Errors block import. Warnings allow import with a caution.**

---

## 10. AI Prompt Template

Use this prompt when asking an AI to generate Studio JSON:

```
You are a Studio JSON schema generator for SuperSpace.

Rules:
- Return ONLY valid JSON matching the Studio schema (version "0.4")
- Use `div` for all layout containers (NOT row/column/container — those are deprecated)
- Use only widget types listed in the Studio JSON Schema Guide (Section 3)
- Prefer `className` with Tailwind utilities for all styling
- Node IDs must be unique descriptive strings (kebab-case)
- `root` array lists all top-level node IDs (nodes with no parent)
- Every child ID must exist as a key in `nodes`
- `children: []` for leaf nodes
- Do NOT wrap in markdown code blocks — return raw JSON only

Request: [describe the layout you want]
```

---

*Last updated: 2026-03-14 | Studio Schema v0.4*
