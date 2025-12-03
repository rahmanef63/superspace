/**
 * Database Feature Preview
 * 
 * Mock preview showing the database/tables interface
 */

"use client"

import * as React from 'react'
import { Database, Table, Plus, Search, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

interface TableData {
  id: string
  name: string
  columns: number
  rows: number
  lastModified: string
}

interface TableRow {
  id: string
  [key: string]: string | number
}

interface DatabaseMockData {
  tables: TableData[]
  selectedTable: {
    name: string
    columns: Array<{ key: string; label: string; type: string }>
    rows: TableRow[]
  }
  stats: {
    tables: number
    totalRows: number
    storage: string
  }
}

function DatabasePreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as DatabaseMockData

  if (compact) {
    return (
      <div className="space-y-2">
        {data.tables.slice(0, 3).map((table) => (
          <div key={table.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <Table className="h-4 w-4 text-primary" />
            <span className="text-sm truncate flex-1">{table.name}</span>
            <Badge variant="secondary" className="text-xs">{table.rows} rows</Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-primary/10">
          <CardContent className="p-3 text-center">
            <Database className="h-4 w-4 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{data.stats.tables}</div>
            <div className="text-xs text-muted-foreground">Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Table className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.totalRows}</div>
            <div className="text-xs text-muted-foreground">Total Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Database className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.storage}</div>
            <div className="text-xs text-muted-foreground">Storage</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tables..." className="pl-9 h-9" disabled={!interactive} />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1" disabled={!interactive}>
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button size="sm" className="h-9 gap-1" disabled={!interactive}>
          <Plus className="h-4 w-4" />
          New Table
        </Button>
      </div>

      {/* Table Preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Table className="h-4 w-4" />
              {data.selectedTable.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {data.selectedTable.rows.length} rows
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px]">
            <div className="min-w-full">
              {/* Header */}
              <div className="flex border-b bg-muted/50 sticky top-0">
                {data.selectedTable.columns.map((col) => (
                  <div 
                    key={col.key} 
                    className="flex-1 px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1 min-w-[100px]"
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                ))}
                <div className="w-10" />
              </div>
              {/* Rows */}
              {data.selectedTable.rows.map((row) => (
                <div key={row.id} className="flex border-b hover:bg-muted/30 transition-colors">
                  {data.selectedTable.columns.map((col) => (
                    <div key={col.key} className="flex-1 px-3 py-2 text-sm truncate min-w-[100px]">
                      {row[col.key]}
                    </div>
                  ))}
                  <div className="w-10 flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tables List */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.tables.map((table) => (
          <Button
            key={table.id}
            variant={table.name === data.selectedTable.name ? "secondary" : "outline"}
            size="sm"
            className="flex-shrink-0 gap-1"
            disabled={!interactive}
          >
            <Table className="h-3 w-3" />
            {table.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'database',
  name: 'Database',
  description: 'Structured data storage and tables',
  component: DatabasePreview,
  category: 'productivity',
  tags: ['data', 'tables', 'storage', 'spreadsheet'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Project Database',
      description: 'Sample project management database',
      data: {
        stats: { tables: 5, totalRows: 234, storage: '12 MB' },
        tables: [
          { id: '1', name: 'Tasks', columns: 6, rows: 89, lastModified: '1h ago' },
          { id: '2', name: 'Users', columns: 4, rows: 24, lastModified: '2d ago' },
          { id: '3', name: 'Projects', columns: 5, rows: 12, lastModified: '1w ago' },
          { id: '4', name: 'Comments', columns: 4, rows: 156, lastModified: '30m ago' },
        ],
        selectedTable: {
          name: 'Tasks',
          columns: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'status', label: 'Status', type: 'select' },
            { key: 'priority', label: 'Priority', type: 'select' },
            { key: 'assignee', label: 'Assignee', type: 'user' },
          ],
          rows: [
            { id: '1', title: 'Setup CI/CD pipeline', status: 'Done', priority: 'High', assignee: 'Alice' },
            { id: '2', title: 'Design new landing page', status: 'In Progress', priority: 'Medium', assignee: 'Bob' },
            { id: '3', title: 'Fix login bug', status: 'Todo', priority: 'High', assignee: 'Charlie' },
            { id: '4', title: 'Update documentation', status: 'In Progress', priority: 'Low', assignee: 'Diana' },
            { id: '5', title: 'Performance optimization', status: 'Todo', priority: 'Medium', assignee: 'Eve' },
          ],
        },
      },
    },
  ],
})
