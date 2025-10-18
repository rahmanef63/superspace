"use client"

import React, { useState } from "react"
import { useWiki } from "../hooks/useWiki"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Book, Plus, Search, FileText, Folder, Clock, Users } from "lucide-react"
import FeatureBadge from "@/frontend/shared/components/FeatureBadge"
import FeatureNotReady from "@/frontend/shared/components/FeatureNotReady"

/**
 * Wiki Page Component
 * Knowledge base and documentation
 */
export default function WikiPage() {
  const { isLoading, error } = useWiki()
  const [searchQuery, setSearchQuery] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading wiki...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    )
  }

  // Mock wiki pages for demo
  const mockPages = [
    {
      id: "1",
      title: "Getting Started Guide",
      type: "page",
      icon: FileText,
      lastEdited: "2 hours ago",
      editedBy: "John Doe",
      category: "Documentation"
    },
    {
      id: "2",
      title: "API Reference",
      type: "folder",
      icon: Folder,
      lastEdited: "1 day ago",
      editedBy: "Jane Smith",
      category: "Technical"
    },
    {
      id: "3",
      title: "Team Processes",
      type: "page",
      icon: FileText,
      lastEdited: "3 days ago",
      editedBy: "Bob Johnson",
      category: "Internal"
    },
    {
      id: "4",
      title: "Product Roadmap",
      type: "page",
      icon: FileText,
      lastEdited: "1 week ago",
      editedBy: "Alice Williams",
      category: "Planning"
    },
  ]

  const mockCategories = [
    { name: "Documentation", count: 12, color: "bg-blue-500" },
    { name: "Technical", count: 8, color: "bg-green-500" },
    { name: "Internal", count: 5, color: "bg-purple-500" },
    { name: "Planning", count: 3, color: "bg-orange-500" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Book className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Wiki</h1>
              <p className="text-sm text-muted-foreground">
                Knowledge base and documentation
              </p>
            </div>
          </div>
          <FeatureBadge status="development" />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search wiki pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled
            />
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <FeatureNotReady
          featureName="Wiki"
          featureSlug="wiki"
          status="development"
          message="The wiki feature is currently in development. Coming soon with rich text editing with markdown support, page hierarchies and organization, version history and revisions, collaborative editing, page templates, and full-text search and tagging."
          expectedRelease="Q2 2025"
        />

        {/* Preview UI */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Categories */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {mockCategories.map((category) => (
                <Card key={category.name} className="cursor-not-allowed opacity-75">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Pages */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Preview: Recent Pages</h3>
            <div className="space-y-3">
              {mockPages.map((page) => {
                const Icon = page.icon
                return (
                  <Card key={page.id} className="cursor-not-allowed hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold mb-1">{page.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {page.lastEdited}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {page.editedBy}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {page.category}
                              </Badge>
                              <Badge variant="outline" className="opacity-50 text-xs">
                                Preview
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Active this month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
