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

export { QuickActionsSection, DEFAULT_QUICK_ACTIONS } from "./QuickActionsSection"
export type { QuickActionsSectionProps } from "./QuickActionsSection"

export { TimeRangeSelector } from "./TimeRangeSelector"
export type { TimeRangeSelectorProps, TimeRange } from "./TimeRangeSelector"

export { WorkspacesGrid, WorkspaceCard } from "./WorkspacesGrid"
export type { WorkspacesGridProps, WorkspaceItem, WorkspaceCardProps } from "./WorkspacesGrid"

export { TeamCompositionSection } from "./TeamCompositionSection"
export type { TeamCompositionSectionProps } from "./TeamCompositionSection"

export { OverviewSkeleton } from "./OverviewSkeleton"
