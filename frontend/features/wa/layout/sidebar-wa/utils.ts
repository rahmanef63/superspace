import type { TabType } from "../../types";

/**
 * Get CSS classes for navigation items based on active state
 */
export const getNavigationItemClasses = (itemId: TabType, activeTab: TabType): string => {
  const isActive = activeTab === itemId;
  return isActive 
    ? "bg-wa-active text-white font-medium" 
    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent";
};

/**
 * Get CSS classes for special navigation items (non-active items)
 */
export const getSpecialItemClasses = (): string => {
  return "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent";
};
