# UI Blocks Catalog

> Reusable UI blocks for building feature interfaces rapidly.

## Available Blocks

The following blocks are available in `frontend/shared/builder/blocks/`.

### 1. ActivityBlock
Displays a chronological feed of user activities.
- **Props**: `activities: ActivityItem[]`, `maxItems?`, `title?`
- **Use Case**: Dashboard feeds, project history, user audit logs.

### 2. StatsBlock
Displays a grid of statistic cards with optional trends and badges.
- **Props**: `stats: StatItem[]`, `columns?`
- **Use Case**: KPI dashboards, project metrics.

### 3. EventsBlock
Displays a list of upcoming events with dates and times.
- **Props**: `events: EventItem[]`, `title?`
- **Use Case**: Calendar widgets, upcoming tasks.

### 4. TeamBlock
Displays a summary of team members or roles.
- **Props**: `roles: Record<string, number>`, `limit?`
- **Use Case**: Team composition overview.

### 5. ListBlock
A generic list component with icon, title, subtitle, and action area.
- **Props**: `items: ListItem[]`, `title?`
- **Use Case**: Recent items, message lists, task lists.

### 6. TimeRangeBlock
A simple segmented control for selecting time ranges (e.g., 7d, 30d).
- **Props**: `value`, `onChange`, `options`
- **Use Case**: Filtering dashboard data.

### 7. AgentBlock
An embeddable AI chat interface for feature-specific assistance.
- **Props**: `agentName`, `featureSlug`, `suggestions`
- **Use Case**: Sidebar assistants, context-aware help.

### 8. ChartBlock (New)
Visualizations using Recharts (Line, Bar, Area, Pie).
- **Props**: `type`, `data`, `color`, `height`
- **Use Case**: Analytics, trends, data reporting.

### 9. KanbanBlock (New)
A column-based board for managing stateful items.
- **Props**: `columns`, `onAddItem`
- **Use Case**: Project management, pipelines, task tracking.

### 10. TableBlock (New)
A powerful data table with sorting, selection, and pagination support.
- **Props**: `data`, `columns`, `searchable?`, `onRowClick?`
- **Use Case**: User lists, audit logs, inventory tables.

### 11. CalendarBlock (New)
A calendar view for date picking or event display.
- **Props**: `mode`, `selected`, `events`
- **Use Case**: Scheduling, task deadlines, event logs.

### 12. FilterBlock (New)
A generic filtering component with search and multi-type filters.
- **Props**: `fields`, `onFilterChange`, `onSearchChange`
- **Use Case**: Advanced search, reports filtering.

### 13. FileBlock (New)
A file manager block with drag-and-drop upload and list view.
- **Props**: `files`, `allowUpload`, `onUpload`, `onDelete`
- **Use Case**: Document attachments, media galleries.

### 14. CommentBlock (New)
A threaded discussion component with rich interactions.
- **Props**: `comments`, `onAddComment`, `currentUser`
- **Use Case**: Project discussions, helpdesk tickets.

### 15. RichTextBlock (New)
A full featured WYSIWYG editor using Tiptap.
- **Props**: `content`, `editable`, `onUpdate`
- **Use Case**: Articles, descriptions, notes.

---

## Future Blocks (Planned)

### 16. FormBlock (New)
Wraps the system's FormPreview to embed dynamic forms.
- **Props**: `fields`, `onSubmit`
- **Use Case**: Data collection, contact forms.

### 17. MediaBlock (New)
Render images or videos with consistent styling.
- **Props**: `type`, `src`, `aspectRatio`, `allowFullscreen`
- **Use Case**: Gelleries, product showcases, tutorials.

### 18. ProfileBlock (New)
A comprehensive entity header for users or contacts.
- **Props**: `name`, `role`, `avatar`, `actions`, `coverImage`
- **Use Case**: User profiles, CRM contact details.

### 19. MetricCardBlock (New)
A simplified single-stat component.
- **Props**: `title`, `value`, `trend`
- **Use Case**: Dashboard KPIs, quick stats.


