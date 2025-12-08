"use client"

import React from "react"
import { FileText, Plus, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useForms } from "../hooks/useForms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FormsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Forms Page Component
 */
export default function FormsPage({ workspaceId }: FormsPageProps) {
  const { isLoading, forms } = useForms(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view forms
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Forms</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage forms
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Form
        </Button>
      </div>

      {/* Forms Grid */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading forms...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium">No forms yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first form to start collecting data
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form: any) => (
              <Card key={form._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{form.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {form.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={form.isPublished ? "default" : "secondary"}>
                        {form.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {form.fields?.length || 0} fields
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {form.submissionCount || 0} responses
                    </span>
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
