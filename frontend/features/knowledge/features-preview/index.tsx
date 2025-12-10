/**
 * Knowledge Feature Preview
 * 
 * Uses the REAL KnowledgeViewTabs layout with mock data
 * showing articles, documents, profile, and workspace context
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  Brain,
  Sparkles,
  BookOpen,
  FileText,
  User,
  Building2,
  Plus,
  Search,
  ArrowUpDown,
  Globe,
  Lock,
  Clock,
  ChevronRight,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Article {
  id: string
  title: string
  isPublic: boolean
  updatedAt: string
  category: string
}

interface KnowledgeMockData {
  stats: { articles: number; documents: number }
  articles: Article[]
  documents: Article[]
  profile: {
    name: string
    role: string
    expertise: string[]
    bio: string
  }
  workspace: {
    description: string
    goals: string[]
    context: string
  }
}

type KnowledgeTab = 'articles' | 'documents' | 'profile' | 'workspace'

function KnowledgePreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as KnowledgeMockData
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('articles')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Knowledge</span>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI Context
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.articles}</p>
            <p className="text-[10px] text-muted-foreground">Articles</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.documents}</p>
            <p className="text-[10px] text-muted-foreground">Documents</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Knowledge Base</h2>
            <p className="text-xs text-muted-foreground">Manage documents, articles, and AI context</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI Context
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => interactive && setActiveTab(v as KnowledgeTab)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-shrink-0 border-b bg-muted/30">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none px-4">
            <TabsTrigger
              value="articles"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
              disabled={!interactive}
            >
              <BookOpen className="h-4 w-4" />
              <span>Articles</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">{data.stats.articles}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
              disabled={!interactive}
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">{data.stats.documents}</Badge>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
              disabled={!interactive}
            >
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="workspace"
              className={cn(
                "relative px-4 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-primary data-[state=active]:bg-background",
                "flex items-center gap-2"
              )}
              disabled={!interactive}
            >
              <Building2 className="h-4 w-4" />
              <span>Workspace</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Articles Tab */}
        <TabsContent value="articles" className="flex-1 m-0 min-h-0 flex">
          <div className="w-72 border-r p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{data.articles.length} Articles</span>
              <Button size="sm" className="h-7 gap-1" disabled={!interactive}>
                <Plus className="h-3 w-3" />
                New
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <div className="space-y-1">
                {data.articles.map((article) => (
                  <button
                    key={article.id}
                    className={cn(
                      "w-full flex items-start gap-2 p-2 rounded-md text-left text-sm transition-colors",
                      selectedId === article.id ? "bg-primary/10" : "hover:bg-muted"
                    )}
                    onClick={() => interactive && setSelectedId(article.id)}
                    disabled={!interactive}
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{article.updatedAt}</p>
                    </div>
                    {article.isPublic ? (
                      <Globe className="h-3 w-3 text-green-500 shrink-0" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Select an article</p>
              <p className="text-sm">Choose from the list to view or edit</p>
            </div>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="flex-1 m-0 min-h-0 flex">
          <div className="w-72 border-r p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{data.documents.length} Documents</span>
              <Button size="sm" className="h-7 gap-1" disabled={!interactive}>
                <Plus className="h-3 w-3" />
                New
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <div className="space-y-1">
                {data.documents.map((doc) => (
                  <button
                    key={doc.id}
                    className="w-full flex items-start gap-2 p-2 rounded-md text-left text-sm hover:bg-muted"
                    disabled={!interactive}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.updatedAt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Select a document</p>
              <p className="text-sm">Choose from the list to view or edit</p>
            </div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="flex-1 m-0 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Profile</CardTitle>
                <CardDescription>Your personal information for AI context</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={data.profile.name} disabled={!interactive} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={data.profile.role} disabled={!interactive} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={data.profile.bio} disabled={!interactive} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Expertise</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.profile.expertise.map((exp, i) => (
                      <Badge key={i} variant="secondary">{exp}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="flex-1 m-0 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workspace Context</CardTitle>
                <CardDescription>Information that helps AI understand your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={data.workspace.description} disabled={!interactive} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Goals</Label>
                  <div className="space-y-2">
                    {data.workspace.goals.map((goal, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </div>
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'knowledge',
  name: 'Knowledge Base',
  description: 'Manage documents, articles, and AI context',
  component: KnowledgePreview,
  category: 'productivity',
  tags: ['knowledge', 'docs', 'articles', 'ai', 'context'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Knowledge Base',
      description: 'Sample knowledge base with articles and documents',
      data: {
        stats: { articles: 12, documents: 8 },
        articles: [
          { id: '1', title: 'Getting Started Guide', isPublic: true, updatedAt: '2 hours ago', category: 'Onboarding' },
          { id: '2', title: 'API Reference', isPublic: true, updatedAt: 'Yesterday', category: 'Technical' },
          { id: '3', title: 'Best Practices', isPublic: true, updatedAt: '3 days ago', category: 'Guides' },
          { id: '4', title: 'FAQ', isPublic: true, updatedAt: '1 week ago', category: 'Support' },
          { id: '5', title: 'Internal Policies', isPublic: false, updatedAt: '2 weeks ago', category: 'Internal' },
        ],
        documents: [
          { id: '1', title: 'Product Roadmap', isPublic: false, updatedAt: 'Today', category: 'Planning' },
          { id: '2', title: 'Meeting Notes', isPublic: false, updatedAt: 'Yesterday', category: 'Notes' },
          { id: '3', title: 'Research Report', isPublic: false, updatedAt: '3 days ago', category: 'Research' },
        ],
        profile: {
          name: 'Alice Johnson',
          role: 'Product Manager',
          expertise: ['Product Strategy', 'User Research', 'Agile'],
          bio: 'Experienced product manager focused on user-centric design and data-driven decisions.'
        },
        workspace: {
          description: 'A collaborative workspace for the product team to plan, build, and ship features.',
          goals: [
            'Launch new feature set by Q1',
            'Improve user engagement by 20%',
            'Reduce customer support tickets'
          ],
          context: 'We are a SaaS company focused on productivity tools.'
        },
      },
    },
  ],
})
