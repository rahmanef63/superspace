"use client"

/**
 * Dynamic Settings View
 *
 * Renders the active settings component with responsive layout
 */

import React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettingsRegistry } from "../SettingsRegistry"
import { DynamicSettingsSidebar } from "./DynamicSettingsSidebar"
import type { SettingsCategory } from "../types"

export interface DynamicSettingsViewProps {
  /** Page title */
  title?: string
  /** Page description */
  description?: string
  /** Core settings categories (always visible, not from features) */
  coreCategories?: SettingsCategory[]
  /** Default category to show */
  defaultCategory?: string
  /** Whether to group settings by feature */
  groupByFeature?: boolean
  /** Additional CSS classes */
  className?: string
  /** Whether to show back button on mobile */
  showMobileBack?: boolean
  /** Callback when back button is clicked */
  onBack?: () => void
}

export function DynamicSettingsView({
  title = "Settings",
  description,
  coreCategories = [],
  defaultCategory,
  groupByFeature = true,
  className,
  showMobileBack = true,
  onBack,
}: DynamicSettingsViewProps) {
  const { categories, activeCategory, setActiveCategory } = useSettingsRegistry()
  const isMobile = useIsMobile()
  const [showSidebar, setShowSidebar] = React.useState(!isMobile)

  // Combine core categories with feature categories
  const allCategories = React.useMemo(() => {
    return [...coreCategories, ...categories]
  }, [coreCategories, categories])

  const activeSettings = allCategories.find((cat) => cat.id === activeCategory)
  const ActiveComponent = activeSettings?.component

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    if (isMobile) {
      setShowSidebar(false)
    }
  }

  const handleBackToSidebar = () => {
    setShowSidebar(true)
  }

  // Set default category on mount
  const lastAppliedDefault = React.useRef<string | undefined>()

  React.useEffect(() => {
    if (allCategories.length === 0) {
      return
    }

    if (defaultCategory) {
      const hasDefault = allCategories.some((cat) => cat.id === defaultCategory)
      if (hasDefault && lastAppliedDefault.current !== defaultCategory) {
        setActiveCategory(defaultCategory)
        lastAppliedDefault.current = defaultCategory
      }

      if (!hasDefault) {
        lastAppliedDefault.current = undefined
      }

      return
    }

    lastAppliedDefault.current = undefined

    const activeStillValid = activeCategory
      ? allCategories.some((cat) => cat.id === activeCategory)
      : false

    if (!activeStillValid) {
      setActiveCategory(allCategories[0].id)
    }
  }, [defaultCategory, allCategories, activeCategory, setActiveCategory])

  // Sync sidebar visibility with mobile state
  React.useEffect(() => {
    setShowSidebar(!isMobile)
  }, [isMobile])

  return (
    <div className={cn("flex flex-col w-full h-full bg-background", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DynamicSettingsSidebar
          categories={allCategories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          groupByFeature={groupByFeature}
          className={cn(
            "transition-all duration-300",
            isMobile ? (showSidebar ? "w-full" : "hidden") : "w-64"
          )}
        />

        {/* Content */}
        <div
          className={cn(
            "flex-1 bg-background overflow-y-auto",
            isMobile && showSidebar && "hidden"
          )}
        >
          {/* Mobile Back Button */}
          {isMobile && !showSidebar && showMobileBack && (
            <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack || handleBackToSidebar}
                className="text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </div>
          )}

          {/* Active Settings Component */}
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No settings selected</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a category from the sidebar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
