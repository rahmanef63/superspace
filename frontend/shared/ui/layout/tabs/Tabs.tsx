/**
 * Tabs Component
 * 
 * Standardized tabs component with multiple variants and features.
 * Supports both compound component pattern and declarative props.
 * 
 * @example Compound Pattern
 * ```tsx
 * <Tabs defaultActiveTab="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 * ```
 * 
 * @example Declarative Pattern
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: "tab1", label: "Tab 1", content: <Content1 /> },
 *     { id: "tab2", label: "Tab 2", content: <Content2 /> },
 *   ]}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabItem,
} from "./types"
import { TabsProvider, useTabsContext } from "./context"
import {
  getTabsContainerClasses,
  getTabsListClasses,
  getTabTriggerClasses,
  getTabPanelClasses,
  getIconSize,
  getBadgeClasses,
} from "./styles"

// ============================================================================
// Main Tabs Component
// ============================================================================

export function Tabs({
  tabs = [],
  activeTab: controlledActiveTab,
  defaultActiveTab,
  onTabChange,
  // Styling
  variant = "default",
  size = "md",
  orientation = "horizontal",
  alignment = "start",
  fullWidth = false,
  // Features
  keyboard = true,
  lazy = false,
  keepMounted = false,
  allowDeselect = false,
  // Customization
  className,
  tabListClassName,
  panelClassName,
  renderTab,
  renderPanel,
  children,
}: TabsProps & { children?: React.ReactNode }) {
  // Determine initial active tab
  const getInitialTab = () => {
    if (controlledActiveTab) return controlledActiveTab
    if (defaultActiveTab) return defaultActiveTab
    if (tabs.length > 0) return tabs[0].id
    return null
  }

  const [internalActiveTab, setInternalActiveTab] = React.useState<string | null>(
    getInitialTab()
  )

  const isControlled = controlledActiveTab !== undefined
  const activeTabValue = isControlled ? controlledActiveTab : internalActiveTab

  const setActiveTab = React.useCallback(
    (id: string) => {
      if (allowDeselect && id === activeTabValue) {
        if (!isControlled) setInternalActiveTab(null)
        onTabChange?.("")
        return
      }
      if (!isControlled) setInternalActiveTab(id)
      onTabChange?.(id)
    },
    [activeTabValue, isControlled, allowDeselect, onTabChange]
  )

  // Keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, currentIndex: number, tabIds: string[]) => {
      if (!keyboard) return

      let nextIndex: number | null = null

      if (orientation === "horizontal") {
        if (e.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % tabIds.length
        } else if (e.key === "ArrowLeft") {
          nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length
        }
      } else {
        if (e.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % tabIds.length
        } else if (e.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length
        }
      }

      if (e.key === "Home") {
        nextIndex = 0
      } else if (e.key === "End") {
        nextIndex = tabIds.length - 1
      }

      if (nextIndex !== null) {
        e.preventDefault()
        setActiveTab(tabIds[nextIndex])
        // Focus the next tab
        const nextTab = document.querySelector(
          `[data-tab-id="${tabIds[nextIndex]}"]`
        ) as HTMLElement
        nextTab?.focus()
      }
    },
    [keyboard, orientation, setActiveTab]
  )

  // Declarative mode: render from tabs prop
  if (tabs.length > 0 && !children) {
    const tabIds = tabs.filter((t) => !t.disabled).map((t) => t.id)

    return (
      <TabsProvider
        activeTab={activeTabValue}
        setActiveTab={setActiveTab}
        variant={variant}
        size={size}
        orientation={orientation}
        alignment={alignment}
        lazy={lazy}
        keepMounted={keepMounted}
      >
        <div className={getTabsContainerClasses(orientation, className)}>
          {/* Tab List */}
          <div
            role="tablist"
            aria-orientation={orientation}
            className={getTabsListClasses(
              variant,
              size,
              orientation,
              alignment,
              fullWidth,
              tabListClassName
            )}
          >
            {tabs.map((tab, index) => {
              const isActive = activeTabValue === tab.id
              const currentIndex = tabIds.indexOf(tab.id)

              if (renderTab) {
                return (
                  <div
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, currentIndex, tabIds)}
                  >
                    {renderTab(tab, isActive)}
                  </div>
                )
              }

              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  id={`tab-${tab.id}`}
                  data-tab-id={tab.id}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  aria-disabled={tab.disabled}
                  tabIndex={isActive ? 0 : -1}
                  disabled={tab.disabled}
                  className={getTabTriggerClasses(
                    variant,
                    size,
                    orientation,
                    isActive,
                    tab.disabled,
                    tab.className
                  )}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, currentIndex, tabIds)}
                >
                  {tab.icon && (
                    <tab.icon
                      size={getIconSize(size)}
                      className="flex-shrink-0"
                    />
                  )}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={getBadgeClasses(variant, isActive)}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Panels */}
          <div className={getTabPanelClasses(orientation, panelClassName)}>
            {tabs.map((tab) => {
              const isActive = activeTabValue === tab.id
              const shouldRender = keepMounted || isActive || !lazy

              if (!shouldRender) return null

              if (renderPanel) {
                return (
                  <div
                    key={tab.id}
                    role="tabpanel"
                    id={`panel-${tab.id}`}
                    aria-labelledby={`tab-${tab.id}`}
                    hidden={!isActive}
                    tabIndex={0}
                  >
                    {renderPanel(tab, isActive)}
                  </div>
                )
              }

              return (
                <div
                  key={tab.id}
                  role="tabpanel"
                  id={`panel-${tab.id}`}
                  aria-labelledby={`tab-${tab.id}`}
                  hidden={!isActive}
                  tabIndex={0}
                  className={cn(!isActive && "hidden")}
                >
                  {tab.content}
                </div>
              )
            })}
          </div>
        </div>
      </TabsProvider>
    )
  }

  // Compound component mode: render children
  return (
    <TabsProvider
      activeTab={activeTabValue}
      setActiveTab={setActiveTab}
      variant={variant}
      size={size}
      orientation={orientation}
      alignment={alignment}
      lazy={lazy}
      keepMounted={keepMounted}
    >
      <div className={getTabsContainerClasses(orientation, className)}>
        {children}
      </div>
    </TabsProvider>
  )
}

// ============================================================================
// TabsList Component
// ============================================================================

export function TabsList({
  children,
  className,
  variant: variantOverride,
  size: sizeOverride,
  alignment: alignmentOverride,
}: TabsListProps) {
  const ctx = useTabsContext()
  const variant = variantOverride ?? ctx.variant
  const size = sizeOverride ?? ctx.size
  const alignment = alignmentOverride ?? ctx.alignment

  return (
    <div
      role="tablist"
      aria-orientation={ctx.orientation}
      className={getTabsListClasses(
        variant,
        size,
        ctx.orientation,
        alignment,
        false,
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// TabsTrigger Component
// ============================================================================

export function TabsTrigger({
  value,
  children,
  icon: Icon,
  badge,
  disabled,
  className,
}: TabsTriggerProps) {
  const ctx = useTabsContext()
  const isActive = ctx.activeTab === value

  // Register this tab
  React.useEffect(() => {
    ctx.registerTab({
      id: value,
      label: typeof children === "string" ? children : value,
      disabled,
    })
    return () => ctx.unregisterTab(value)
  }, [value, children, disabled, ctx])

  return (
    <button
      role="tab"
      type="button"
      id={`tab-${value}`}
      data-tab-id={value}
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={getTabTriggerClasses(
        ctx.variant,
        ctx.size,
        ctx.orientation,
        isActive,
        disabled,
        className
      )}
      onClick={() => ctx.setActiveTab(value)}
    >
      {Icon && <Icon size={getIconSize(ctx.size)} className="flex-shrink-0" />}
      <span>{children}</span>
      {badge !== undefined && (
        <span className={getBadgeClasses(ctx.variant, isActive)}>{badge}</span>
      )}
    </button>
  )
}

// ============================================================================
// TabsContent Component
// ============================================================================

export function TabsContent({
  value,
  children,
  forceMount,
  className,
}: TabsContentProps) {
  const ctx = useTabsContext()
  const isActive = ctx.activeTab === value

  // Determine if we should render content
  const shouldRender = forceMount || ctx.keepMounted || isActive || !ctx.lazy

  if (!shouldRender) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={cn(
        getTabPanelClasses(ctx.orientation, className),
        !isActive && !forceMount && "hidden"
      )}
    >
      {children}
    </div>
  )
}
