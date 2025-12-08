"use client"

import React, { useState } from "react"
import { Tags as TagsIcon, Plus, Edit, Trash2, Hash } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useTags } from "../hooks/useTags"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TagsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const TAG_COLORS = [
  { name: "gray", class: "bg-gray-500" },
  { name: "red", class: "bg-red-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "yellow", class: "bg-yellow-500" },
  { name: "green", class: "bg-green-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "pink", class: "bg-pink-500" },
]

/**
 * Tags Page Component
 */
export default function TagsPage({ workspaceId }: TagsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { isLoading, tags, createTag, deleteTag } = useTags(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to manage tags
          </p>
        </div>
      </div>
    )
  }

  const filteredTags = tags.filter((tag: any) =>
    tag.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTag = async () => {
    const name = prompt("Enter tag name:")
    if (name) {
      await createTag({ workspaceId, name, color: "blue" })
    }
  }

  const handleDeleteTag = async (tagId: Id<"tags">) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      await deleteTag({ workspaceId, tagId })
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <TagsIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Tags</h1>
            <p className="text-sm text-muted-foreground">
              {tags.length} tags
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleCreateTag}>
          <Plus className="h-4 w-4" />
          Create Tag
        </Button>
      </div>

      {/* Search */}
      <div className="border-b p-4">
        <Input
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tags List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading tags...</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <TagsIcon className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium">No tags found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search" : "Create your first tag"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTags.map((tag: any) => (
              <Card key={tag._id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`h-4 w-4 rounded ${
                        TAG_COLORS.find(c => c.name === tag.color)?.class || "bg-gray-500"
                      }`} 
                    />
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tag.usageCount || 0} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteTag(tag._id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
