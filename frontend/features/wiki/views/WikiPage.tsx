"use client"

import React, { useMemo, useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import {
  Book,
  Search,
  Trash2,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FeatureBadge from "@/frontend/shared/ui/components/FeatureBadge"
import { useWiki } from "../hooks/useWiki"
import type { WikiCategory, WikiPageRecord } from "../types"

interface WikiPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const CATEGORY_OPTIONS: { value: WikiCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "product", label: "Product" },
  { value: "engineering", label: "Engineering" },
  { value: "operations", label: "Operations" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
]

const categoryLabels = CATEGORY_OPTIONS.reduce<Record<WikiCategory, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {} as Record<WikiCategory, string>)

const getSnippet = (page: WikiPageRecord) => {
  const source = page.summary ?? page.content
  if (source.length <= 180) return source
  return `${source.slice(0, 180)}...`
}

const NEW_PAGE_DEFAULT = {
  title: "",
  summary: "",
  content: "",
  category: "general" as WikiCategory,
  isPublished: true,
}

export default function WikiPage({ workspaceId }: WikiPageProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<WikiCategory | "all">("all")
  const [publishedOnly, setPublishedOnly] = useState(false)
  const [newPage, setNewPage] = useState(NEW_PAGE_DEFAULT)

  const searchQuery = search.trim() || undefined

  const {
    pages,
    stats,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isRemoving,
    createPage,
    updatePage,
    deletePage,
  } = useWiki(workspaceId, {
    category: categoryFilter,
    search: searchQuery,
    publishedOnly,
  })

  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [pages])

  const categoryBreakdown = useMemo(() => {
    return CATEGORY_OPTIONS.map(({ value, label }) => ({
      value,
      label,
      count: stats.categories[value] ?? 0,
    })).sort((a, b) => b.count - a.count)
  }, [stats.categories])

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Choose a workspace to unlock the knowledge base.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading wiki...</div>
      </div>
    )
  }

  const handleCreatePage = async () => {
    const title = newPage.title.trim()
    const content = newPage.content.trim()

    if (!title || !content) {
      toast.error("Title and content are required")
      return
    }

    try {
      await createPage({
        title,
        content,
        summary: newPage.summary.trim() || undefined,
        category: newPage.category,
        isPublished: newPage.isPublished,
      })
      toast.success("Page created")
      setNewPage(NEW_PAGE_DEFAULT)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create page")
    }
  }

  const handleTogglePublished = async (page: WikiPageRecord) => {
    try {
      await updatePage(page.id, { isPublished: !page.isPublished })
      toast.success(page.isPublished ? "Page unpublished" : "Page published")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update page")
    }
  }

  const handleDeletePage = async (page: WikiPageRecord) => {
    const confirmed = window.confirm(`Delete "${page.title}"?`)
    if (!confirmed) return

    try {
      await deletePage(page.id)
      toast.success("Page deleted")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete page")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Wiki</h1>
              <p className="text-sm text-muted-foreground">
                Share playbooks, documentation, and institutional knowledge with your team.
              </p>
            </div>
          </div>
            <FeatureBadge status="beta" />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pages, categories, or keywords..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value: WikiCategory | "all") => setCategoryFilter(value)}
          >
            <SelectTrigger className="md:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
            <Switch
              id="wiki-published-only"
              checked={publishedOnly}
              onCheckedChange={setPublishedOnly}
            />
            <Label htmlFor="wiki-published-only" className="cursor-pointer text-sm">
              Published only
            </Label>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 pb-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-emerald-500">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-amber-500">{stats.drafts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Category Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryBreakdown.slice(0, 3).map((item) => (
                <div key={item.value} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create a page</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="wiki-title">Title</Label>
              <Input
                id="wiki-title"
                value={newPage.title}
                onChange={(event) => setNewPage((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g. Incident response handbook"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="wiki-summary">Summary</Label>
              <Textarea
                id="wiki-summary"
                rows={2}
                value={newPage.summary}
                onChange={(event) =>
                  setNewPage((prev) => ({ ...prev, summary: event.target.value }))
                }
                placeholder="Short digest that appears in lists and search results"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="wiki-content">Content</Label>
              <Textarea
                id="wiki-content"
                rows={6}
                value={newPage.content}
                onChange={(event) =>
                  setNewPage((prev) => ({ ...prev, content: event.target.value }))
                }
                placeholder="Write the full content of your page here..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={newPage.category}
                onValueChange={(value: WikiCategory) =>
                  setNewPage((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="wiki-is-published"
                checked={newPage.isPublished}
                onCheckedChange={(checked) =>
                  setNewPage((prev) => ({ ...prev, isPublished: checked }))
                }
              />
              <Label htmlFor="wiki-is-published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <div className="md:col-span-2">
              <Button onClick={handleCreatePage} disabled={isCreating}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isCreating ? "Publishing..." : "Publish Page"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {sortedPages.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground">No pages yet</h3>
            <p className="mt-2 text-sm">
              Create your first page to share knowledge with the team.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPages.map((page) => (
              <Card key={page.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold">{page.title}</h4>
                      {page.category ? (
                        <Badge variant="outline">{categoryLabels[page.category]}</Badge>
                      ) : null}
                      <Badge className={page.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                        {page.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{getSnippet(page)}</p>
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(page.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleTogglePublished(page)}
                      disabled={isUpdating}
                    >
                      {page.isPublished ? "Convert to draft" : "Publish"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePage(page)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete page</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
