"use client"

import React, { useState } from "react"
import { FileText, Plus, Eye, Edit, Trash2, MoreHorizontal, ArrowLeft, Save, Send } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useForms } from "../hooks/useForms"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import FormBuilder from "../components/FormBuilder"
import FormPreview from "../components/FormPreview"

interface FormsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

type ViewMode = "list" | "create" | "edit"

interface FormField {
  id: string
  type: any
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  validation?: any
  options?: { label: string; value: string }[]
  defaultValue?: any
  order: number
}

/**
 * Forms Page Component
 * Complete form builder with drag & drop, preview and management
 */
export default function FormsPage({ workspaceId }: FormsPageProps) {
  const { isLoading, forms, createForm, updateForm, deleteForm } = useForms(workspaceId)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [activeTab, setActiveTab] = useState("build")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view forms
          </p>
        </div>
      </div>
    )
  }

  const handleCreateNew = () => {
    setFormTitle("")
    setFormDescription("")
    setFormFields([])
    setSelectedForm(null)
    setViewMode("create")
    setActiveTab("build")
  }

  const handleEdit = (form: any) => {
    setFormTitle(form.title || form.name || "")
    setFormDescription(form.description || "")
    setFormFields(form.fields || [])
    setSelectedForm(form)
    setViewMode("edit")
    setActiveTab("build")
  }

  const handleBack = () => {
    setViewMode("list")
    setSelectedForm(null)
    setFormFields([])
  }

  const handleSave = async (publish = false) => {
    if (!workspaceId) return
    setIsSaving(true)

    try {
      if (viewMode === "create") {
        await createForm({
          workspaceId,
          title: formTitle || "Untitled Form",
          description: formDescription,
          fields: formFields,
        })
      } else if (selectedForm) {
        await updateForm({
          workspaceId,
          formId: selectedForm._id,
          title: formTitle,
          description: formDescription,
          fields: formFields,
          status: publish ? "published" : undefined,
        })
      }
      handleBack()
    } catch (error) {
      console.error("Failed to save form:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!workspaceId || !formToDelete) return
    try {
      await deleteForm({ workspaceId, formId: formToDelete._id })
      setDeleteDialogOpen(false)
      setFormToDelete(null)
    } catch (error) {
      console.error("Failed to delete form:", error)
    }
  }

  const confirmDelete = (form: any) => {
    setFormToDelete(form)
    setDeleteDialogOpen(true)
  }

  // Form Builder/Editor View
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Form title"
                className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* Form Builder Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="build" className="flex-1 overflow-auto p-4 m-0">
              <FormBuilder fields={formFields} onChange={setFormFields} />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-auto p-4 m-0">
              <FormPreview
                title={formTitle || "Untitled Form"}
                description={formDescription}
                fields={formFields}
                isPreview={true}
              />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-auto p-4 m-0">
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>Form Settings</CardTitle>
                  <CardDescription>Configure your form settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Form Title</Label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Enter form title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe what this form is for"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Forms List View
  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={FileText}
        title="Forms"
        subtitle="Create and manage forms for data collection"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Create Form",
          icon: Plus,
          onClick: handleCreateNew,
        }}
      />

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
            <Button className="gap-2" onClick={handleCreateNew}>
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form: any) => (
              <Card key={form._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {form.title || form.name || "Untitled Form"}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {form.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(form)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(form)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(form)}
                          className="text-destructive"
                        >
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
                      <Badge variant={form.status === "published" ? "default" : "secondary"}>
                        {form.status === "published" ? "Published" : "Draft"}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formToDelete?.title || formToDelete?.name}"?
              This action cannot be undone and all responses will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
