/**
 * Blocks - Main Export
 * 
 * Centralized UI block components for building features.
 * 
 * Directory Structure:
 * - shared/     - Reusable utilities, types, and components
 * - Activity/   - Activity feed block
 * - Stats/      - Statistics grid block
 * - Events/     - Upcoming events block
 * - Team/       - Team composition block
 * - List/       - Generic list block
 * - TimeRange/  - Time range selector block
 * - Agent/      - AI Assistant panel block
 */

// ============================================================================
// Shared Utilities
// ============================================================================
export * from "./shared"

// ============================================================================
// Block Components
// ============================================================================

// Activity Block
export { ActivityBlock, type ActivityBlockProps, type ActivityItem, type ActivityType } from "./Activity"

// Stats Block
export { StatsBlock, type StatsBlockProps, type StatItem } from "./Stats"

// Events Block
export { EventsBlock, type EventsBlockProps, type EventItem, type EventUrgency } from "./Events"

// Team Block
export { TeamBlock, type TeamBlockProps } from "./Team"

// List Block
export { ListBlock, type ListBlockProps, type ListItem, type ListItemType } from "./List"

// TimeRange Block
export { TimeRangeBlock, type TimeRangeBlockProps, type TimeRange } from "./TimeRange"

// Agent Block
export { AgentBlock, type AgentBlockProps } from "./Agent"

// Chart Block
export { ChartBlock, type ChartBlockProps, type ChartDataPoint, type ChartType } from "./Chart"

// Kanban Block
export { KanbanBlock, type KanbanBlockProps, type KanbanColumn, type KanbanItem } from "./Kanban"

// Table Block
export { TableBlock, type TableBlockProps } from "./Table"

// Calendar Block
export { CalendarBlock, type CalendarBlockProps } from "./Calendar"

// Filter Block
export { FilterBlock, type FilterBlockProps, type FilterField } from "./Filter"

// File Block
export { FileBlock, type FileBlockProps, type FileItem } from "./File"

// Comment Block
export { CommentBlock, type CommentBlockProps, type CommentItem } from "./Comment"

// RichText Block
export { RichTextBlock, type RichTextBlockProps } from "./RichText"

// Form Block
export { FormBlock, type FormBlockProps, type FormField } from "./Form"

// Media Block
export { MediaBlock, type MediaBlockProps } from "./Media"

// Profile Block
export { ProfileBlock, type ProfileBlockProps, type ProfileAction } from "./Profile"

// Metric Card Block
export { MetricCardBlock, type MetricCardBlockProps } from "./Metric"

// ============================================================================
// Registry & Utils
// ============================================================================
export * from "./registry"
export * from "./utils/blockFactory"
export { createBlock } from "./utils/blockFactory"

