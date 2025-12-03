/**
 * CMS Lite Feature Preview
 * 
 * Mock preview showing content management system interface
 */

"use client"

import * as React from 'react'
import { FileText, Layout, Globe, Eye, EyeOff, Plus, Calendar, Pencil, Check, Clock, Image, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface ContentItem {
  id: string
  title: string
  type: 'page' | 'post' | 'component'
  status: 'published' | 'draft' | 'scheduled'
  author: string
  updatedAt: string
  thumbnail?: boolean
}

interface CMSMockData {
  content: ContentItem[]
  stats: {
    pages: number
    posts: number
    components: number
    published: number
  }
}

const statusConfig = {
  published: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: Check },
  draft: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Pencil },
  scheduled: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
}

const typeIcons = {
  page: <Layout className="h-4 w-4 text-blue-500" />,
  post: <FileText className="h-4 w-4 text-purple-500" />,
  component: <Tag className="h-4 w-4 text-orange-500" />,
}

function CMSPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as CMSMockData
  const [selectedTab, setSelectedTab] = React.useState('all')

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">CMS Lite</span>
          <Badge variant="secondary">{data.stats.published} published</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-sm font-bold">{data.stats.pages}</p>
            <p className="text-[10px] text-muted-foreground">Pages</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-sm font-bold">{data.stats.posts}</p>
            <p className="text-[10px] text-muted-foreground">Posts</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-sm font-bold">{data.stats.components}</p>
            <p className="text-[10px] text-muted-foreground">Blocks</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <h3 className="font-semibold">Content Manager</h3>
        </div>
        <Button size="sm" className="gap-1" disabled={!interactive}>
          <Plus className="h-4 w-4" />
          New Content
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Layout className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.pages}</div>
            <div className="text-[10px] text-muted-foreground">Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <FileText className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.posts}</div>
            <div className="text-[10px] text-muted-foreground">Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Tag className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.components}</div>
            <div className="text-[10px] text-muted-foreground">Blocks</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5">
          <CardContent className="p-3 text-center">
            <Check className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.published}</div>
            <div className="text-[10px] text-muted-foreground">Live</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="pages" className="flex-1">Pages</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content List */}
      <Card>
        <ScrollArea className="h-[220px]">
          <div className="divide-y">
            {data.content.map((item) => {
              const StatusIcon = statusConfig[item.status].icon
              return (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  {item.thumbnail ? (
                    <div className="w-12 h-8 rounded bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                      <Image className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                      {typeIcons[item.type]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {item.author} · {item.updatedAt}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs gap-1", statusConfig[item.status].color)}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {item.status}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    disabled={!interactive}
                  >
                    {item.status === 'published' ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'cms-lite',
  name: 'CMS Lite',
  description: 'Lightweight content management',
  component: CMSPreview,
  category: 'content',
  tags: ['cms', 'content', 'pages', 'posts', 'publishing'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Content',
      description: 'Pages and posts',
      data: {
        stats: { pages: 12, posts: 24, components: 8, published: 28 },
        content: [
          { id: '1', title: 'Home Page', type: 'page', status: 'published', author: 'Alice', updatedAt: '2h ago', thumbnail: true },
          { id: '2', title: 'Getting Started Guide', type: 'post', status: 'published', author: 'Bob', updatedAt: '1d ago' },
          { id: '3', title: 'About Us', type: 'page', status: 'draft', author: 'Charlie', updatedAt: '3d ago', thumbnail: true },
          { id: '4', title: 'Product Announcement', type: 'post', status: 'scheduled', author: 'Diana', updatedAt: '1w ago' },
          { id: '5', title: 'Hero Banner', type: 'component', status: 'published', author: 'Eve', updatedAt: '2w ago' },
        ],
      },
    },
  ],
})
