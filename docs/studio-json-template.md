# Studio JSON Schema — Guide, Rules & Context

> Use this document as **base knowledge** when asking an AI to generate Studio layouts in JSON format.
> The AI should return a valid Schema object that can be imported directly into Studio.

---

## 1. Schema Structure

Every Studio layout is a **Schema** JSON object:

```json
{
  "version": "0.4",
  "root": ["node-1"],
  "nodes": {
    "node-1": {
      "type": "div",
      "props": { "tag": "section", "display": "flex", "flexDirection": "col", "gap": "6", "padding": "6" },
      "children": ["node-2", "node-3"]
    },
    "node-2": {
      "type": "text",
      "props": { "tag": "h1", "content": "Hello World", "fontSize": "2xl", "fontWeight": "bold" },
      "children": []
    },
    "node-3": {
      "type": "button",
      "props": { "text": "Get Started", "variant": "default" },
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
  type: string;            // Widget key (see Section 3)
  props: Record<string, any>; // Only non-default props needed
  children: string[];     // Ordered list of child node IDs
}
```

**Rules:**
- **Only include props that differ from defaults** — missing props use widget defaults.
- **Node IDs** must be unique strings. Use descriptive names like `hero-section`, `nav-bar`, `cta-button`.
- **Children** must reference IDs defined in `nodes`.
- Circular references are forbidden.

---

## 3. Available Widget Types

### Layout

| Type          | Label           | Key Props                                                              |
|---------------|-----------------|------------------------------------------------------------------------|
| `div`         | Div             | `tag` (div/section/article/header/footer/main/aside/nav), `display`, `flexDirection`, `gap`, `padding`, `path` |
| `section`     | Page            | `path` (route), `tag`, `display`, `gap`, `padding`                    |
| `row`         | Row             | `gap`, `align`, `justify`                                              |
| `column`      | Column          | `gap`, `flex`                                                          |
| `twoColumn`   | Two Column      | `leftWidth`, `gap`                                                     |
| `threeColumn` | Three Column    | `leftWidth`, `rightWidth`, `resizable`                                 |
| `grid`        | Grid            | `cols`, `gap`                                                          |
| `flex`        | Flex            | `direction`, `gap`, `align`, `justify`, `wrap`                        |

### Content

| Type   | Label | Key Props                                              |
|--------|-------|--------------------------------------------------------|
| `text` | Text  | `tag` (p/h1-h6/span), `content`, `fontSize`, `fontWeight`, `textAlign`, `color` |
| `card` | Card  | `title`, `description`, `padding`                     |

### Media

| Type    | Label | Key Props                        |
|---------|-------|----------------------------------|
| `image` | Image | `src`, `alt`, `width`, `height`  |

### Action

| Type         | Label       | Key Props                                       |
|--------------|-------------|-------------------------------------------------|
| `button`     | Button      | `text`, `variant` (default/outline/ghost/secondary/destructive), `size` |
| `iconButton` | Icon Button | `icon`, `variant`, `size`                       |

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
| `heading`    | Heading      | `level` (1-6), `content`          |
| `divider`    | Divider      | `orientation`                      |
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

## 4. Common Prop Values

### Display / Layout

```
display: "block" | "flex" | "grid" | "inline-flex"
flexDirection: "row" | "col"
justify: "start" | "center" | "between" | "end" | "around" | "evenly"
align: "start" | "center" | "end" | "stretch"
wrap: "nowrap" | "wrap" | "wrap-reverse"
gap: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12"
padding: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12"
width: "auto" | "full" | "screen"
height: "auto" | "full" | "screen"
```

### Typography

```
fontSize: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
fontWeight: "normal" | "medium" | "semibold" | "bold" | "extrabold"
textAlign: "left" | "center" | "right" | "justify"
color: "foreground" | "muted-foreground" | "primary" | "destructive" | "white" | (any hex)
tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "div"
```

### Background / Border

```
backgroundColor: "background" | "muted" | "primary" | "secondary" | (any hex)
borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"
borderWidth: "0" | "1" | "2" | "4" | "8"
```

### Button Variants
```
variant: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive"
size: "sm" | "default" | "lg" | "icon"
```

---

## 5. Page Routing

To make a page accessible via navigation, use a `div` or `section` with a `path` prop:

```json
"page-home": {
  "type": "div",
  "props": { "tag": "section", "path": "/", "display": "flex", "flexDirection": "col" },
  "children": [...]
}
```

The Renderer automatically routes to the node whose `path` matches the active route.

---

## 6. Rules & Constraints

1. **version** must always be `"0.4"`.
2. **root** must list IDs of nodes that have no parent (not a child of any other node).
3. **Node IDs** must be unique across the entire `nodes` map.
4. **Do not nest a node as its own ancestor** (no circular children).
5. **All IDs in `children` arrays** must exist as keys in `nodes`.
6. **Props are optional** — only include what you want to override from defaults.
7. **Block types** (`tableBlock`, `chartBlock`, etc.) render with placeholder data if no real data is passed.
8. **Smart blocks** should not be nested inside each other as children — put them as siblings inside a layout container.

---

## 7. Example — Dashboard Layout

```json
{
  "version": "0.4",
  "root": ["dashboard-page"],
  "nodes": {
    "dashboard-page": {
      "type": "div",
      "props": { "tag": "section", "path": "/dashboard", "display": "flex", "flexDirection": "col", "gap": "6", "padding": "6" },
      "children": ["dash-header", "dash-grid"]
    },
    "dash-header": {
      "type": "div",
      "props": { "display": "flex", "flexDirection": "row", "justify": "between", "align": "center" },
      "children": ["dash-title", "dash-timerange"]
    },
    "dash-title": {
      "type": "text",
      "props": { "tag": "h1", "content": "Dashboard", "fontSize": "2xl", "fontWeight": "bold" },
      "children": []
    },
    "dash-timerange": {
      "type": "timeRangeBlock",
      "props": { "value": "30d" },
      "children": []
    },
    "dash-grid": {
      "type": "grid",
      "props": { "cols": "3", "gap": "4" },
      "children": ["metric-1", "metric-2", "metric-3", "table-main", "chart-main"]
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

## 8. AI Prompt Template

Use this prompt when asking an AI to generate Studio JSON:

```
You are a Studio JSON schema generator for SuperSpace.

Rules:
- Return ONLY valid JSON matching the Studio schema (version "0.4")
- Use only widget types listed in the Studio JSON Schema Guide
- Only include non-default props
- Node IDs must be unique descriptive strings (kebab-case)
- Root array lists all top-level node IDs

Request: [describe the layout you want]

Return the JSON schema only, no explanation.
```

---

*Last updated: 2026-03-13 | Studio Schema v0.4*
