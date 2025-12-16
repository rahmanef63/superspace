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

// ============================================================================
// Registry & Utils
// ============================================================================
export * from "./registry"
export * from "./utils/blockFactory"
export { createBlock } from "./utils/blockFactory"

