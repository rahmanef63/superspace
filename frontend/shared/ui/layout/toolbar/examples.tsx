/**
 * Example: Using Universal Toolbar System
 * 
 * This file demonstrates various toolbar configurations from basic to advanced.
 * Copy these examples to your feature pages.
 */

import { useState } from 'react'
import { 
  UniversalToolbar, 
  toolType, 
  viewMode, 
  useToolbar,
  useViewMode,
  useSearchState,
  useSortState,
  type ToolId
} from '@/frontend/shared/ui/layout/toolbar'
import { 
  Grid3x3, 
  List, 
  LayoutGrid, 
  Table2,
  Download, 
  Upload, 
  Plus,
  Filter,
  SortAsc,
  Search,
  Home,
  Folder,
  File
} from 'lucide-react'

// ============================================================================
// EXAMPLE 1: Basic Toolbar (Search + View)
// ============================================================================

export function Example1_BasicToolbar() {
  const toolbar = useToolbar({
    storagePrefix: "example1",
    initialView: viewMode.grid,
  })

  return (
    <UniversalToolbar
      tools={[
        {
          id: "search" as ToolId,
          type: toolType.search,
          params: {
            value: toolbar.searchValue,
            onChange: toolbar.setSearchValue,
            placeholder: "Search...",
            clearable: true,
          }
        },
        {
          id: "view" as ToolId,
          type: toolType.view,
          position: "right",
          params: {
            options: [
              { label: "Grid", value: viewMode.grid, icon: Grid3x3 },
              { label: "List", value: viewMode.list, icon: List },
            ],
            currentView: toolbar.viewMode,
            onChange: toolbar.setViewMode,
          }
        }
      ]}
      border="bottom"
    />
  )
}

// ============================================================================
// EXAMPLE 2: Full Featured Toolbar (All Tools)
// ============================================================================

export function Example2_FullToolbar() {
  const toolbar = useToolbar({
    storagePrefix: "example2",
    initialView: viewMode.grid,
    initialSort: "name",
    initialFilters: new Set(["active"]),
  })

  const handleExport = () => alert("Exporting...")
  const handleImport = () => alert("Importing...")
  const handleCreate = () => alert("Creating new...")

  return (
    <UniversalToolbar
      tools={[
        // === LEFT GROUP ===
        {
          id: "search" as ToolId,
          type: toolType.search,
          position: "left",
          params: {
            value: toolbar.searchValue,
            onChange: toolbar.setSearchValue,
            placeholder: "Search items...",
            clearable: true,
            shortcuts: "Ctrl+K",
          }
        },
        {
          id: "sort" as ToolId,
          type: toolType.sort,
          position: "left",
          params: {
            options: [
              { label: "Name", value: "name" },
              { label: "Date Created", value: "createdAt" },
              { label: "Date Modified", value: "modifiedAt" },
              { label: "Size", value: "size" },
            ],
            currentSort: toolbar.currentSort,
            currentDirection: toolbar.sortDirection,
            onChange: toolbar.setSort,
            showDirection: true,
          }
        },
        {
          id: "filter" as ToolId,
          type: toolType.filter,
          position: "left",
          params: {
            options: [
              { 
                label: "Active", 
                value: "active", 
                active: toolbar.hasFilter("active"),
                count: 12 
              },
              { 
                label: "Archived", 
                value: "archived", 
                active: toolbar.hasFilter("archived"),
                count: 3 
              },
              { 
                label: "Favorites", 
                value: "favorites", 
                active: toolbar.hasFilter("favorites"),
                count: 8 
              },
            ],
            onToggle: toolbar.toggleFilter,
            showCount: true,
            showClearAll: true,
          }
        },

        // === RIGHT GROUP ===
        {
          id: "view" as ToolId,
          type: toolType.view,
          position: "right",
          params: {
            options: [
              { label: "Grid", value: viewMode.grid, icon: Grid3x3 },
              { label: "List", value: viewMode.list, icon: List },
              { label: "Tiles", value: viewMode.tiles, icon: LayoutGrid },
              { label: "Table", value: viewMode.table, icon: Table2 },
            ],
            currentView: toolbar.viewMode,
            onChange: toolbar.setViewMode,
            layout: "segmented",
            showLabels: true,
          }
        },
        {
          id: "actions" as ToolId,
          type: toolType.actions,
          position: "right",
          params: {
            actions: [
              { 
                label: "Create", 
                icon: Plus, 
                onClick: handleCreate,
                variant: "default" as const,
                shortcut: "Ctrl+N"
              },
              { 
                label: "Export", 
                icon: Download, 
                onClick: handleExport,
                variant: "outline" as const,
              },
              { 
                label: "Import", 
                icon: Upload, 
                onClick: handleImport,
                variant: "outline" as const,
              },
            ],
            primary: "Create",
            maxVisible: 2,
          }
        },
      ]}
      sticky
      border="bottom"
      background="card"
      spacing="normal"
    />
  )
}

// ============================================================================
// EXAMPLE 3: Toolbar with Tabs
// ============================================================================

export function Example3_ToolbarWithTabs() {
  const toolbar = useToolbar({
    storagePrefix: "example3",
  })

  const [currentTab, setCurrentTab] = useState("all")

  return (
    <UniversalToolbar
      tools={[
        // Tabs in center
        {
          id: "tabs" as ToolId,
          type: toolType.tabs,
          position: "center",
          params: {
            tabs: [
              { label: "All Items", value: "all", count: 23 },
              { label: "Recent", value: "recent", count: 8 },
              { label: "Shared", value: "shared", count: 5 },
              { label: "Archived", value: "archived", count: 2 },
            ],
            currentTab,
            onChange: setCurrentTab,
            variant: "underline",
          }
        },

        // Search on right
        {
          id: "search" as ToolId,
          type: toolType.search,
          position: "right",
          params: {
            value: toolbar.searchValue,
            onChange: toolbar.setSearchValue,
            placeholder: "Search...",
          }
        },
      ]}
      border="bottom"
    />
  )
}

// ============================================================================
// EXAMPLE 4: Toolbar with Breadcrumb
// ============================================================================

export function Example4_ToolbarWithBreadcrumb() {
  const toolbar = useToolbar({
    storagePrefix: "example4",
  })

  return (
    <UniversalToolbar
      tools={[
        // Breadcrumb on left
        {
          id: "breadcrumb" as ToolId,
          type: toolType.breadcrumb,
          position: "left",
          params: {
            items: [
              { label: "Home", icon: Home, onClick: () => console.log("Home") },
              { label: "Section", onClick: () => console.log("Section") },
              { label: "Page", active: true }
            ]
          }
        }
      ]}
      border="bottom"
    />
  )
}
