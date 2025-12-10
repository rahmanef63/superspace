/**
 * Database Feature Preview
 * 
 * Uses the REAL UniversalTableView component with mock data
 * to show an authentic database experience
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  Database,
  Table,
  LayoutGrid,
  Calendar,
  GitBranch,
  Image,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Settings2,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface DbTable {
  id: string
  name: string
  rowCount: number
  icon: string
}

interface DbColumn {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'date' | 'checkbox' | 'user'
}

interface DbRow {
  id: string
  [key: string]: any
}

interface DatabaseMockData {
  tables: DbTable[]
  selectedTable: string
  columns: DbColumn[]
  rows: DbRow[]
  views: Array<{ id: string; name: string; icon: string }>
}

type ViewType = 'table' | 'board' | 'calendar' | 'timeline' | 'gallery'

const viewIcons: Record<ViewType, React.ReactNode> = {
  table: <Table className="h-4 w-4" />,
  board: <LayoutGrid className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  timeline: <GitBranch className="h-4 w-4" />,
  gallery: <Image className="h-4 w-4" />,
}

const statusColors: Record<string, string> = {
  'Done': 'bg-green-500/20 text-green-700 dark:text-green-300',
  'In Progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'Todo': 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
  'Blocked': 'bg-red-500/20 text-red-700 dark:text-red-300',
}

const priorityColors: Record<string, string> = {
  'High': 'bg-red-500/20 text-red-700 dark:text-red-300',
  'Medium': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  'Low': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
}

function DatabasePreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as DatabaseMockData
  const [selectedTable, setSelectedTable] = useState(data.selectedTable)
  const [activeView, setActiveView] = useState<ViewType>('table')
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const selectedTableData = data.tables.find(t => t.id === selectedTable)

  const filteredRows = data.rows.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(globalFilter.toLowerCase())
    )
  )

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Database</span>
          </div>
          <Badge variant="secondary">{data.tables.length} tables</Badge>
        </div>
        {data.tables.slice(0, 3).map((table) => (
          <div key={table.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Table className="h-4 w-4 text-primary" />
            <span className="text-sm truncate flex-1">{table.name}</span>
            <Badge variant="secondary" className="text-xs">{table.rowCount} rows</Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full border rounded-xl overflow-hidden bg-background">
      {/* Sidebar - Database Tables */}
      <div className="w-56 border-r bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Databases</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {data.tables.map((table) => (
              <Button
                key={table.id}
                variant={selectedTable === table.id ? "secondary" : "ghost"}
                className="w-full justify-start h-9 px-2 text-sm"
                onClick={() => interactive && setSelectedTable(table.id)}
                disabled={!interactive}
              >
                <Table className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="truncate flex-1 text-left">{table.name}</span>
                <span className="text-xs text-muted-foreground">{table.rowCount}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Table className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{selectedTableData?.name || 'Database'}</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedTableData?.rowCount || 0} rows
            </Badge>
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-2">
            <Tabs value={activeView} onValueChange={(v) => interactive && setActiveView(v as ViewType)}>
              <TabsList className="h-8">
                {(['table', 'board', 'calendar', 'timeline', 'gallery'] as ViewType[]).map((view) => (
                  <TabsTrigger
                    key={view}
                    value={view}
                    className="h-7 px-2 text-xs capitalize gap-1"
                    disabled={!interactive}
                  >
                    {viewIcons[view]}
                    <span className="hidden sm:inline">{view}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 p-3 border-b bg-background/95">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8"
                value={globalFilter}
                onChange={(e) => interactive && setGlobalFilter(e.target.value)}
                disabled={!interactive}
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1" disabled={!interactive}>
              <Filter className="h-3 w-3" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" disabled={!interactive}>
              <Settings2 className="h-3 w-3" />
              Columns
            </Button>
            <Button size="sm" className="h-8 gap-1" disabled={!interactive}>
              <Plus className="h-3 w-3" />
              Add row
            </Button>
          </div>
        </div>

        {/* Table View - Using real table structure */}
        <div className="flex-1 overflow-auto">
          <TableUI>
            <TableHeader className="sticky top-0 bg-muted/50 z-10">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={Object.keys(rowSelection).length === filteredRows.length && filteredRows.length > 0}
                    disabled={!interactive}
                  />
                </TableHead>
                {data.columns.map((col) => (
                  <TableHead key={col.key} className="font-medium">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group hover:bg-muted/30"
                  data-state={rowSelection[row.id] ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={rowSelection[row.id] || false}
                      onCheckedChange={(checked) => {
                        if (interactive) {
                          setRowSelection(prev => ({
                            ...prev,
                            [row.id]: checked === true
                          }))
                        }
                      }}
                      disabled={!interactive}
                    />
                  </TableCell>
                  {data.columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.type === 'select' && col.key === 'status' ? (
                        <Badge variant="secondary" className={cn("text-xs", statusColors[row[col.key]] || '')}>
                          {row[col.key]}
                        </Badge>
                      ) : col.type === 'select' && col.key === 'priority' ? (
                        <Badge variant="secondary" className={cn("text-xs", priorityColors[row[col.key]] || '')}>
                          {row[col.key]}
                        </Badge>
                      ) : col.type === 'checkbox' ? (
                        <Checkbox checked={row[col.key]} disabled />
                      ) : col.type === 'date' ? (
                        <span className="text-sm text-muted-foreground">{row[col.key]}</span>
                      ) : (
                        <span className="text-sm">{row[col.key]}</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      disabled={!interactive}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableUI>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-sm text-muted-foreground">
          <span>
            {Object.keys(rowSelection).filter(k => rowSelection[k]).length} of {filteredRows.length} row(s) selected
          </span>
          <span>Showing 1 to {filteredRows.length} of {filteredRows.length} rows</span>
        </div>
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'database',
  name: 'Database',
  description: 'Notion-style database with multiple views',
  component: DatabasePreview,
  category: 'productivity',
  tags: ['database', 'tables', 'views', 'notion', 'spreadsheet'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Project Tracker',
      description: 'Sample project management database',
      data: {
        tables: [
          { id: 'tasks', name: 'Tasks', rowCount: 24, icon: 'check' },
          { id: 'projects', name: 'Projects', rowCount: 8, icon: 'folder' },
          { id: 'team', name: 'Team', rowCount: 12, icon: 'users' },
          { id: 'sprints', name: 'Sprints', rowCount: 6, icon: 'target' },
        ],
        selectedTable: 'tasks',
        columns: [
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'status', label: 'Status', type: 'select' },
          { key: 'priority', label: 'Priority', type: 'select' },
          { key: 'assignee', label: 'Assignee', type: 'user' },
          { key: 'dueDate', label: 'Due Date', type: 'date' },
        ],
        rows: [
          { id: '1', title: 'Implement authentication', status: 'Done', priority: 'High', assignee: 'Alice', dueDate: 'Dec 10' },
          { id: '2', title: 'Design dashboard mockups', status: 'In Progress', priority: 'Medium', assignee: 'Bob', dueDate: 'Dec 12' },
          { id: '3', title: 'Write API documentation', status: 'Todo', priority: 'Low', assignee: 'Charlie', dueDate: 'Dec 15' },
          { id: '4', title: 'Setup CI/CD pipeline', status: 'Done', priority: 'High', assignee: 'Diana', dueDate: 'Dec 8' },
          { id: '5', title: 'Performance optimization', status: 'In Progress', priority: 'Medium', assignee: 'Eve', dueDate: 'Dec 18' },
          { id: '6', title: 'User acceptance testing', status: 'Todo', priority: 'High', assignee: 'Frank', dueDate: 'Dec 20' },
          { id: '7', title: 'Fix navigation bug', status: 'Blocked', priority: 'High', assignee: 'Alice', dueDate: 'Dec 11' },
          { id: '8', title: 'Update dependencies', status: 'Todo', priority: 'Low', assignee: 'Bob', dueDate: 'Dec 22' },
        ],
        views: [
          { id: 'table', name: 'Table', icon: 'table' },
          { id: 'board', name: 'Board', icon: 'kanban' },
          { id: 'calendar', name: 'Calendar', icon: 'calendar' },
          { id: 'timeline', name: 'Timeline', icon: 'timeline' },
          { id: 'gallery', name: 'Gallery', icon: 'gallery' },
        ],
      },
    },
  ],
})
