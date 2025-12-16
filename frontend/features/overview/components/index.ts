/**
 * Overview Components
 * 
 * Modular components for the Overview feature.
 * Each section is a separate file for maintainability.
 */

// Section Components
export { StatsGrid, StatCard } from "./StatsGrid"
export type { StatsGridProps, StatCardProps } from "./StatsGrid"

export { RecentActivitySection } from "./RecentActivitySection"
export type { RecentActivitySectionProps, ActivityItem, ActivityType } from "./RecentActivitySection"

// New comprehensive sections
export { RecentItemsSection } from "./RecentItemsSection"
export type { RecentItemsSectionProps, RecentItem, RecentItemType } from "./RecentItemsSection"

export { UpcomingEventsSection } from "./UpcomingEventsSection"
export type { UpcomingEventsSectionProps, UpcomingEvent, EventUrgency } from "./UpcomingEventsSection"

export { AIQuickChatSection } from "./AIQuickChatSection"
export type { AIQuickChatSectionProps, QuickPrompt } from "./AIQuickChatSection"

// Legacy (deprecated - use new sections instead)
// export * from "./QuickActionsSection" // Deprecated
// export type { QuickActionsSectionProps, QuickAction } from "./QuickActionsSection" // Deprecated

export { TimeRangeSelector } from "./TimeRangeSelector"
export type { TimeRangeSelectorProps, TimeRange } from "./TimeRangeSelector"

export { WorkspacesGrid, WorkspaceCard } from "./WorkspacesGrid"
export type { WorkspacesGridProps, WorkspaceItem, WorkspaceCardProps } from "./WorkspacesGrid"

export { TeamCompositionSection } from "./TeamCompositionSection"
export type { TeamCompositionSectionProps } from "./TeamCompositionSection"

export { OverviewSkeleton } from "./OverviewSkeleton"

