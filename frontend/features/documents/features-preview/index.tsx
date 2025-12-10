/**
 * Documents Feature Preview
 * 
 * Uses the REAL DocumentsView layout structure with mock data
 * to show an authentic document management experience
 */

"use client"

import * as React from 'react'
import { useState, useMemo } from 'react'
import {
  FileText,
  FolderOpen,
  Plus,
  Search,
  Sparkles,
  ArrowUpDown,
  Info,
  ChevronRight,
  ChevronDown,
  Globe,
  Lock,
  MoreHorizontal,
  Clock,
  Tag,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Document {
  id: string
  title: string
  isPublic: boolean
  parentId: string | null
  createdAt: string
  modifiedAt: string
  author: string
  tags: string[]
  content?: string
}

interface DocumentsMockData {
  documents: Document[]
  selectedDocumentId: string | null
  visibility: 'all' | 'private' | 'public'
}

function DocumentsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as DocumentsMockData
  const [selectedId, setSelectedId] = useState(data.selectedDocumentId)
  const [visibility, setVisibility] = useState(data.visibility)
  const [search, setSearch] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [rightPanelMode, setRightPanelMode] = useState<'inspector' | 'ai'>('inspector')

  const selectedDocument = useMemo(() =>
    data.documents.find(d => d.id === selectedId),
    [data.documents, selectedId]
  )

  const filteredDocuments = useMemo(() => {
    let docs = data.documents
    if (visibility === 'public') docs = docs.filter(d => d.isPublic)
    if (visibility === 'private') docs = docs.filter(d => !d.isPublic)
    if (search) {
      docs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    }
    return docs
  }, [data.documents, visibility, search])

  // Build tree structure
  const rootDocuments = filteredDocuments.filter(d => !d.parentId)
  const childDocuments = (parentId: string) =>
    filteredDocuments.filter(d => d.parentId === parentId)

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Documents</span>
          </div>
          <Badge variant="secondary">{data.documents.length} docs</Badge>
        </div>
        {data.documents.slice(0, 3).map((doc) => (
          <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate flex-1">{doc.title}</span>
            {doc.isPublic ? (
              <Globe className="h-3 w-3 text-green-500" />
            ) : (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header - Matching StandardFeatureHeader */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-8 h-8"
            value={search}
            onChange={(e) => interactive && setSearch(e.target.value)}
            disabled={!interactive}
          />
        </div>

        {/* Visibility Toggles */}
        <div className="flex bg-muted/50 p-1 rounded-lg border h-8 items-center shrink-0">
          {(['all', 'private', 'public'] as const).map((option) => (
            <button
              key={option}
              onClick={() => interactive && setVisibility(option)}
              disabled={!interactive}
              className={cn(
                "px-3 py-0.5 text-xs font-medium rounded-md transition-all h-6 flex items-center justify-center",
                visibility === option
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-2 h-8" disabled={!interactive}>
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Document Tree */}
        <div className="w-64 border-r bg-muted/10 flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {filteredDocuments.length} Documents
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-xs" disabled={!interactive}>
                Select
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-0.5">
              {rootDocuments.map((doc) => {
                const children = childDocuments(doc.id)
                const hasChildren = children.length > 0
                const isExpanded = expandedFolders.has(doc.id)

                return (
                  <div key={doc.id}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                        selectedId === doc.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={() => {
                        if (interactive) {
                          setSelectedId(doc.id)
                          if (hasChildren) {
                            setExpandedFolders(prev => {
                              const next = new Set(prev)
                              if (next.has(doc.id)) next.delete(doc.id)
                              else next.add(doc.id)
                              return next
                            })
                          }
                        }
                      }}
                      disabled={!interactive}
                    >
                      {hasChildren ? (
                        isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        )
                      ) : (
                        <div className="w-3 shrink-0" />
                      )}
                      {hasChildren ? (
                        <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="truncate flex-1">{doc.title}</span>
                      {doc.isPublic ? (
                        <Globe className="h-3 w-3 text-green-500 shrink-0" />
                      ) : (
                        <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                      <div className="ml-5 pl-2 border-l border-border/50 space-y-0.5 mt-0.5">
                        {children.map((child) => (
                          <button
                            key={child.id}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                              selectedId === child.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                            onClick={() => interactive && setSelectedId(child.id)}
                            disabled={!interactive}
                          >
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate flex-1">{child.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Center - Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between px-4 py-2 border-b h-12 bg-muted/10">
            {selectedDocument ? (
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Documents</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-foreground font-medium">{selectedDocument.title}</span>
                </div>
                <Button
                  variant={rightPanelMode === 'inspector' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => interactive && setRightPanelMode('inspector')}
                  disabled={!interactive}
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  Inspector
                </Button>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Select a document</span>
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-auto">
            {selectedDocument ? (
              <div className="p-6">
                {/* Title */}
                <div className="border-b pb-4 mb-6">
                  <h1 className="text-2xl font-bold mb-2">{selectedDocument.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedDocument.modifiedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedDocument.author}
                    </span>
                    {selectedDocument.isPublic && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>{selectedDocument.content || 'Start writing your document here...'}</p>
                  <p className="text-muted-foreground">
                    This is a preview of the document editor. In the actual app, you would see a rich text editor with formatting options, tables, images, and more.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 px-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      No document selected
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a document from the sidebar or create a new one
                    </p>
                    <Button disabled={!interactive}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Inspector */}
        {selectedDocument && (
          <div className="w-64 border-l bg-muted/10 flex flex-col hidden lg:flex">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Document Info</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedDocument.isPublic ? (
                      <Badge variant="secondary" className="gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Author */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Author</label>
                  <p className="mt-1 text-sm">{selectedDocument.author}</p>
                </div>

                {/* Created */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Created</label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDocument.createdAt}</p>
                </div>

                {/* Modified */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Modified</label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDocument.modifiedAt}</p>
                </div>

                <Separator />

                {/* Tags */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Tags</label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" disabled={!interactive}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'documents',
  name: 'Documents',
  description: 'Rich document editor with tree navigation',
  component: DocumentsPreview,
  category: 'productivity',
  tags: ['documents', 'editor', 'notes', 'writing', 'wiki'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Documentation',
      description: 'Sample documentation structure',
      data: {
        visibility: 'all',
        selectedDocumentId: 'getting-started',
        documents: [
          {
            id: 'getting-started',
            title: 'Getting Started',
            isPublic: true,
            parentId: null,
            createdAt: 'Dec 1, 2024',
            modifiedAt: '2 hours ago',
            author: 'Alice Johnson',
            tags: ['onboarding', 'guide'],
            content: 'Welcome to the documentation! This guide will help you get started with our platform. We will cover the basics of creating documents, organizing them into folders, and collaborating with your team.'
          },
          {
            id: 'api-docs',
            title: 'API Documentation',
            isPublic: true,
            parentId: null,
            createdAt: 'Nov 20, 2024',
            modifiedAt: 'Yesterday',
            author: 'Bob Smith',
            tags: ['api', 'technical'],
            content: 'This section contains the complete API reference for our platform.'
          },
          {
            id: 'api-auth',
            title: 'Authentication',
            isPublic: true,
            parentId: 'api-docs',
            createdAt: 'Nov 21, 2024',
            modifiedAt: '3 days ago',
            author: 'Bob Smith',
            tags: ['api', 'auth'],
          },
          {
            id: 'api-users',
            title: 'Users API',
            isPublic: true,
            parentId: 'api-docs',
            createdAt: 'Nov 22, 2024',
            modifiedAt: '1 week ago',
            author: 'Bob Smith',
            tags: ['api', 'users'],
          },
          {
            id: 'internal-notes',
            title: 'Internal Notes',
            isPublic: false,
            parentId: null,
            createdAt: 'Dec 5, 2024',
            modifiedAt: '1 hour ago',
            author: 'Charlie Brown',
            tags: ['internal', 'notes'],
            content: 'These are private notes for the team...'
          },
          {
            id: 'roadmap',
            title: 'Product Roadmap',
            isPublic: false,
            parentId: null,
            createdAt: 'Nov 15, 2024',
            modifiedAt: '5 hours ago',
            author: 'Diana Ross',
            tags: ['roadmap', 'planning'],
          },
          {
            id: 'changelog',
            title: 'Changelog',
            isPublic: true,
            parentId: null,
            createdAt: 'Oct 1, 2024',
            modifiedAt: 'Today',
            author: 'Eve Wilson',
            tags: ['changelog', 'updates'],
          },
        ],
      },
    },
  ],
})
