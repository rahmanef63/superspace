/**
 * Archived Feature Preview
 * 
 * Mock preview showing archived items interface
 */

"use client"

import * as React from 'react'
import { Archive, Search, RotateCcw, Trash2, FileText, MessageSquare, FolderOpen, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface ArchivedItem {
  id: string
  name: string
  type: 'document' | 'channel' | 'folder' | 'project'
  archivedAt: string
  archivedBy: string
  size?: string
}

interface ArchivedMockData {
  items: ArchivedItem[]
  stats: {
    total: number
    documents: number
    channels: number
    storage: string
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4 text-blue-500" />,
  channel: <MessageSquare className="h-4 w-4 text-green-500" />,
  folder: <FolderOpen className="h-4 w-4 text-yellow-500" />,
  project: <Archive className="h-4 w-4 text-purple-500" />,
}

function ArchivedPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as ArchivedMockData
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Archive className="h-4 w-4" />
          <span className="text-sm">{data.stats.total} archived items</span>
        </div>
        {data.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md opacity-60">
            {typeIcons[item.type]}
            <span className="text-sm truncate flex-1">{item.name}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-muted/50">
          <CardContent className="p-3 text-center">
            <Archive className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{data.stats.total}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.documents}</div>
            <div className="text-[10px] text-muted-foreground">Docs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <MessageSquare className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.channels}</div>
            <div className="text-[10px] text-muted-foreground">Channels</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.storage}</div>
            <div className="text-[10px] text-muted-foreground">Storage</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search archived..." className="pl-9 h-9" disabled={!interactive} />
        </div>
        {selectedIds.size > 0 && (
          <>
            <Button variant="outline" size="sm" className="h-9 gap-1" disabled={!interactive}>
              <RotateCcw className="h-4 w-4" />
              Restore ({selectedIds.size})
            </Button>
            <Button variant="destructive" size="sm" className="h-9 gap-1" disabled={!interactive}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Archive Info */}
      <div className="p-3 bg-muted/30 rounded-md border border-dashed">
        <p className="text-xs text-muted-foreground">
          <Archive className="h-3 w-3 inline mr-1" />
          Items in archive are kept for 30 days before permanent deletion.
        </p>
      </div>

      {/* Items */}
      <Card>
        <ScrollArea className="h-[220px]">
          <div className="divide-y">
            {data.items.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors",
                  selectedIds.has(item.id) && "bg-muted/30"
                )}
              >
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  disabled={!interactive}
                />
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center opacity-60">
                  {typeIcons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate opacity-75">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Archived {item.archivedAt} by {item.archivedBy}
                  </p>
                </div>
                {item.size && (
                  <span className="text-xs text-muted-foreground">{item.size}</span>
                )}
                <Badge variant="secondary" className="text-xs capitalize opacity-60">
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'archived',
  name: 'Archived',
  description: 'View and manage archived items',
  component: ArchivedPreview,
  category: 'administration',
  tags: ['archive', 'deleted', 'restore', 'cleanup'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Archive',
      description: 'Recently archived items',
      data: {
        stats: { total: 18, documents: 10, channels: 5, storage: '234 MB' },
        items: [
          { id: '1', name: 'Old Project Proposal', type: 'document', archivedAt: '2d ago', archivedBy: 'Alice', size: '2.4 MB' },
          { id: '2', name: '#deprecated-features', type: 'channel', archivedAt: '1w ago', archivedBy: 'Bob' },
          { id: '3', name: 'Legacy Documentation', type: 'folder', archivedAt: '2w ago', archivedBy: 'Charlie', size: '156 MB' },
          { id: '4', name: 'Q2 Reports', type: 'document', archivedAt: '1mo ago', archivedBy: 'Diana', size: '8.2 MB' },
          { id: '5', name: 'Old Marketing Campaign', type: 'project', archivedAt: '1mo ago', archivedBy: 'Eve', size: '45 MB' },
        ],
      },
    },
  ],
})
