/**
 * Documents Feature Preview
 * 
 * Mock preview showing the documents/files interface
 */

"use client"

import * as React from 'react'
import { 
  FileText, FolderOpen, Search, Grid, List, 
  MoreHorizontal, Download, Share, Trash2,
  File, FileImage, FileVideo, FilePlus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface DocFile {
  id: string
  name: string
  type: 'document' | 'image' | 'video' | 'folder' | 'other'
  size: string
  modifiedAt: string
  modifiedBy: string
  shared: boolean
}

interface DocumentsMockData {
  currentPath: string[]
  files: DocFile[]
  stats: {
    totalFiles: number
    totalSize: string
    shared: number
  }
}

const fileIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-5 w-5 text-blue-500" />,
  image: <FileImage className="h-5 w-5 text-green-500" />,
  video: <FileVideo className="h-5 w-5 text-purple-500" />,
  folder: <FolderOpen className="h-5 w-5 text-yellow-500" />,
  other: <File className="h-5 w-5 text-gray-500" />,
}

function DocumentsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as DocumentsMockData
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list')

  if (compact) {
    return (
      <div className="space-y-2">
        {data.files.slice(0, 4).map((file) => (
          <div key={file.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            {fileIcons[file.type]}
            <span className="text-sm truncate flex-1">{file.name}</span>
            <span className="text-xs text-muted-foreground">{file.size}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-lg font-bold">{data.stats.totalFiles}</div>
            <div className="text-xs text-muted-foreground">Files</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Download className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.totalSize}</div>
            <div className="text-xs text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Share className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.shared}</div>
            <div className="text-xs text-muted-foreground">Shared</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files..." className="pl-9 h-9" disabled={!interactive} />
        </div>
        <div className="flex border rounded-md">
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" className="h-9 gap-1" disabled={!interactive}>
          <FilePlus className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        {data.currentPath.map((folder, i) => (
          <React.Fragment key={i}>
            <span className="text-muted-foreground">/</span>
            <Button variant="link" className="h-auto p-0 text-sm" disabled={!interactive}>
              {folder}
            </Button>
          </React.Fragment>
        ))}
      </div>

      {/* File List */}
      <Card>
        <ScrollArea className="h-[250px]">
          {viewMode === 'list' ? (
            <div className="divide-y">
              {data.files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    {fileIcons[file.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{file.name}</span>
                      {file.shared && <Badge variant="secondary" className="text-[10px]">Shared</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Modified {file.modifiedAt} by {file.modifiedBy}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{file.size}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 p-3">
              {data.files.map((file) => (
                <Card key={file.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3 text-center">
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center mx-auto mb-2">
                      {fileIcons[file.type]}
                    </div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'documents',
  name: 'Documents',
  description: 'File management and document storage',
  component: DocumentsPreview,
  category: 'productivity',
  tags: ['files', 'storage', 'documents', 'upload'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Project Files',
      description: 'Standard project file structure',
      data: {
        currentPath: ['Projects', 'Website Redesign'],
        stats: { totalFiles: 48, totalSize: '1.2 GB', shared: 12 },
        files: [
          { id: '1', name: 'Design Assets', type: 'folder', size: '234 MB', modifiedAt: '2h ago', modifiedBy: 'Alice', shared: true },
          { id: '2', name: 'Project Brief.pdf', type: 'document', size: '2.4 MB', modifiedAt: '1d ago', modifiedBy: 'Bob', shared: true },
          { id: '3', name: 'Homepage Mockup.png', type: 'image', size: '4.8 MB', modifiedAt: '3d ago', modifiedBy: 'Charlie', shared: false },
          { id: '4', name: 'Demo Video.mp4', type: 'video', size: '156 MB', modifiedAt: '1w ago', modifiedBy: 'Diana', shared: true },
          { id: '5', name: 'Requirements.docx', type: 'document', size: '128 KB', modifiedAt: '2w ago', modifiedBy: 'Eve', shared: false },
        ],
      },
    },
    {
      id: 'empty',
      name: 'Empty Folder',
      description: 'New folder with no files',
      data: {
        currentPath: ['New Folder'],
        stats: { totalFiles: 0, totalSize: '0 B', shared: 0 },
        files: [],
      },
    },
  ],
})
