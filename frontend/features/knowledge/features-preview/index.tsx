/**
 * Knowledge Feature Preview
 * 
 * Mock preview showing the knowledge base interface
 */

"use client"

import * as React from 'react'
import { BookOpen, Search, FileText, Folder, Star, Clock, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  updatedAt: string
  views: number
  isStarred: boolean
}

interface KnowledgeMockData {
  categories: Array<{ id: string; name: string; count: number; icon: string }>
  recentArticles: Article[]
  popularTags: string[]
}

function KnowledgePreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as KnowledgeMockData

  if (compact) {
    return (
      <div className="space-y-2">
        {data.recentArticles.slice(0, 3).map((article) => (
          <div key={article.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate flex-1">{article.title}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search knowledge base..." 
          className="pl-9"
          disabled={!interactive}
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-2">
        {data.categories.map((cat) => (
          <Card key={cat.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Folder className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.count} articles</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px]">
            <div className="space-y-3">
              {data.recentArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">{article.title}</h4>
                        {article.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {article.views} views
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {article.updatedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <div className="flex flex-wrap gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        {data.popularTags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-muted">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'knowledge',
  name: 'Knowledge Base',
  description: 'Centralized documentation and articles',
  component: KnowledgePreview,
  category: 'productivity',
  tags: ['docs', 'wiki', 'articles', 'documentation'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Team Wiki',
      description: 'Standard team knowledge base',
      data: {
        categories: [
          { id: '1', name: 'Getting Started', count: 12, icon: 'rocket' },
          { id: '2', name: 'API Reference', count: 34, icon: 'code' },
          { id: '3', name: 'Best Practices', count: 8, icon: 'star' },
          { id: '4', name: 'Troubleshooting', count: 15, icon: 'wrench' },
        ],
        recentArticles: [
          { id: '1', title: 'Quick Start Guide', excerpt: 'Get up and running in minutes with our comprehensive guide...', category: 'Getting Started', tags: ['beginner', 'setup'], updatedAt: '2h ago', views: 234, isStarred: true },
          { id: '2', title: 'Authentication API', excerpt: 'Learn how to implement secure authentication in your app...', category: 'API Reference', tags: ['api', 'auth'], updatedAt: '1d ago', views: 156, isStarred: false },
          { id: '3', title: 'Code Review Guidelines', excerpt: 'Best practices for conducting effective code reviews...', category: 'Best Practices', tags: ['review', 'quality'], updatedAt: '3d ago', views: 89, isStarred: true },
        ],
        popularTags: ['api', 'setup', 'security', 'performance', 'testing'],
      },
    },
    {
      id: 'product',
      name: 'Product Docs',
      description: 'Product documentation hub',
      data: {
        categories: [
          { id: '1', name: 'Features', count: 24, icon: 'star' },
          { id: '2', name: 'Integrations', count: 18, icon: 'plug' },
          { id: '3', name: 'Release Notes', count: 42, icon: 'tag' },
          { id: '4', name: 'FAQ', count: 31, icon: 'help' },
        ],
        recentArticles: [
          { id: '1', title: 'New Dashboard Features', excerpt: 'Explore the latest additions to your dashboard...', category: 'Features', tags: ['new', 'dashboard'], updatedAt: '1h ago', views: 567, isStarred: true },
          { id: '2', title: 'Slack Integration Guide', excerpt: 'Connect your workspace with Slack for seamless notifications...', category: 'Integrations', tags: ['slack', 'integration'], updatedAt: '5h ago', views: 234, isStarred: false },
        ],
        popularTags: ['features', 'integration', 'updates', 'how-to', 'tips'],
      },
    },
  ],
})
