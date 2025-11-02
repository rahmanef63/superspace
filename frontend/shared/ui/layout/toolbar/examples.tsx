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
              { label: "Documents", icon: Folder, onClick: () => console.log("Documents") },
              { label: "Projects", icon: Folder, onClick: () => console.log("Projects") },
              { label: "Current File", icon: File },
            ],
            maxItems: 4,
          }
        },

        // View + Actions on right
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
        },
      ]}
      border="bottom"
      background="muted"
    />
  )
}

// ============================================================================
// EXAMPLE 5: Responsive Toolbar (Mobile-Optimized)
// ============================================================================

export function Example5_ResponsiveToolbar() {
  const toolbar = useToolbar({
    storagePrefix: "example5",
  })

  return (
    <UniversalToolbar
      tools={[
        // Search - always visible
        {
          id: "search" as ToolId,
          type: toolType.search,
          position: "left",
          params: {
            value: toolbar.searchValue,
            onChange: toolbar.setSearchValue,
            placeholder: "Search...",
          }
        },

        // Sort - collapses on mobile
        {
          id: "sort" as ToolId,
          type: toolType.sort,
          position: "left",
          responsive: {
            collapseOnMobile: true,
          },
          params: {
            options: [
              { label: "Name", value: "name" },
              { label: "Date", value: "date" },
            ],
            currentSort: toolbar.currentSort,
            onChange: (sort: string, dir?: "asc" | "desc") => toolbar.setSort(sort, dir),
          }
        },

        // Filter - hidden on mobile
        {
          id: "filter" as ToolId,
          type: toolType.filter,
          position: "left",
          responsive: {
            hideMobile: true,
          },
          params: {
            options: [
              { label: "Active", value: "active", active: toolbar.hasFilter("active") },
              { label: "Archived", value: "archived", active: toolbar.hasFilter("archived") },
            ],
            onToggle: toolbar.toggleFilter,
          }
        },

        // View - always visible, changes layout
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
            layout: "dropdown", // Dropdown on all screens
          }
        },
      ]}
      sticky
      border="bottom"
    />
  )
}

// ============================================================================
// EXAMPLE 6: Compact Toolbar (Minimal)
// ============================================================================

export function Example6_CompactToolbar() {
  const toolbar = useToolbar({
    storagePrefix: "example6",
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
          }
        },
        {
          id: "sort" as ToolId,
          type: toolType.sort,
          position: "right",
          params: {
            options: [
              { label: "Name", value: "name" },
              { label: "Date", value: "date" },
            ],
            currentSort: toolbar.currentSort,
            onChange: (sort: string, dir?: "asc" | "desc") => toolbar.setSort(sort, dir),
          }
        },
      ]}
      spacing="compact"
      border="bottom"
      background="transparent"
    />
  )
}

// ============================================================================
// EXAMPLE 7: Using Individual State Hooks
// ============================================================================

export function Example7_IndividualHooks() {
  const [viewMode, setViewMode] = useViewMode("example7-view", "grid")
  const search = useSearchState()
  const sort = useSortState("example7-sort", "name", "asc")

  return (
    <div>
      <UniversalToolbar
        tools={[
          {
            id: "search" as ToolId,
            type: toolType.search,
            params: {
              value: search.value,
              onChange: search.setValue,
            }
          },
          {
            id: "sort" as ToolId,
            type: toolType.sort,
            params: {
              options: [
                { label: "Name", value: "name" },
                { label: "Date", value: "date" },
              ],
              currentSort: sort.currentSort,
              currentDirection: sort.currentDirection,
              onChange: sort.setSort,
              showDirection: true,
            }
          },
          {
            id: "view" as ToolId,
            type: toolType.view,
            position: "right",
            params: {
              options: [
                { label: "Grid", value: "grid" as any, icon: Grid3x3 },
                { label: "List", value: "list" as any, icon: List },
              ],
              currentView: viewMode as any,
              onChange: setViewMode,
            }
          },
        ]}
      />

      {/* Use debounced search for API calls */}
      <div className="p-4">
        <p>Search Query: {search.debouncedValue}</p>
        <p>Sort: {sort.currentSort} ({sort.currentDirection})</p>
        <p>View: {viewMode}</p>
      </div>
    </div>
  )
}
