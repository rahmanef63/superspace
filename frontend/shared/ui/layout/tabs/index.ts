/**
 * Tabs System
 * 
 * Standardized tabs component for consistent UI across the application.
 * 
 * Features:
 * - Multiple visual variants (default, pills, underline, boxed, segment, minimal)
 * - Horizontal and vertical orientations
 * - Compound component pattern for flexibility
 * - Declarative props pattern for simplicity
 * - Icon and badge support
 * - Keyboard navigation
 * - Lazy loading and keep-mounted options
 * - Full accessibility (ARIA)
 * 
 * @example Compound Pattern
 * ```tsx
 * import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/frontend/shared/ui/layout/tabs"
 * 
 * <Tabs defaultActiveTab="tab1" variant="pills">
 *   <TabsList>
 *     <TabsTrigger value="tab1" icon={HomeIcon}>Home</TabsTrigger>
 *     <TabsTrigger value="tab2" icon={SettingsIcon}>Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Home content</TabsContent>
 *   <TabsContent value="tab2">Settings content</TabsContent>
 * </Tabs>
 * ```
 * 
 * @example Declarative Pattern
 * ```tsx
 * import { Tabs } from "@/frontend/shared/ui/layout/tabs"
 * 
 * <Tabs
 *   variant="segment"
 *   tabs={[
 *     { id: "tab1", label: "Tab 1", icon: Icon1, content: <Content1 /> },
 *     { id: "tab2", label: "Tab 2", icon: Icon2, content: <Content2 />, badge: "3" },
 *   ]}
 *   onTabChange={(id) => {}}
 * />
 * ```
 */
export {
  getTabsContainerClasses,
  getTabsListClasses,
  getTabTriggerClasses,
  getTabPanelClasses,
  getIconSize,
  getBadgeClasses,
} from "./styles"
