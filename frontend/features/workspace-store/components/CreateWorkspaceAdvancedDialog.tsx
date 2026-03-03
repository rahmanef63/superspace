"use client"

import * as React from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, LayoutTemplate, Settings2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { FeatureCustomizer } from "@/frontend/shared/foundation/workspaces/components/FeatureCustomizer"
import { AvailableFeatureId } from "@/frontend/shared/foundation/workspaces/constants"
import { WorkspaceType } from "../types"

interface CreateWorkspaceAdvancedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    type: WorkspaceType
    parentId?: string
    templateId?: Id<"industryTemplates">
    enabledFeatures?: string[]
  }) => Promise<void>
  parentWorkspaceId?: string
}

export function CreateWorkspaceAdvancedDialog({
  open,
  onOpenChange,
  onSubmit,
  parentWorkspaceId
}: CreateWorkspaceAdvancedDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"custom" | "template">("template")
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<Id<"industryTemplates"> | null>(null)
  const [customFeatures, setCustomFeatures] = React.useState<AvailableFeatureId[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch templates
  const templates = useQuery(api.features.industryTemplates.queries.getTemplates, {
    limit: 50
  })

  const selectedTemplate = React.useMemo(() => 
    templates?.find(t => t._id === selectedTemplateId), 
    [templates, selectedTemplateId]
  )

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        type: "organization", // Default to organization for business templates
        parentId: parentWorkspaceId,
        templateId: activeTab === "template" ? selectedTemplateId || undefined : undefined,
        enabledFeatures: activeTab === "custom" ? customFeatures : undefined
      })
      onOpenChange(false)
      // Reset form
      setName("")
      setDescription("")
      setSelectedTemplateId(null)
      setCustomFeatures([])
      setActiveTab("template")
    } catch (error) {
      console.error("Failed to create workspace", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFeature = (featureId: AvailableFeatureId) => {
    setCustomFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Choose a template or start from scratch with custom features.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-4 shrink-0">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="template">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  From Template
                </TabsTrigger>
                <TabsTrigger value="custom">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Custom Setup
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 relative mt-4">
              <TabsContent value="template" className="absolute inset-0 overflow-hidden px-6 pb-4 m-0 data-[state=active]:flex flex-col gap-4">
                <div className="grid gap-4 shrink-0">
                  <div className="grid gap-2">
                    <Label htmlFor="name-template">Workspace Name</Label>
                    <Input 
                      id="name-template" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. My Business"
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 border rounded-md bg-muted/10">
                  <ScrollArea className="h-full p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templates === undefined ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                          <Loader2 className="h-8 w-8 animate-spin mb-2" />
                          <p>Loading templates...</p>
                        </div>
                      ) : templates.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground">
                          <LayoutTemplate className="h-12 w-12 mb-2 opacity-20" />
                          <p>No templates found.</p>
                          <p className="text-xs mt-1">Please contact your administrator to seed the templates.</p>
                        </div>
                      ) : (
                        templates.map((template) => (
                          <Card 
                            key={template._id}
                            className={cn(
                              "cursor-pointer transition-all hover:border-primary/50",
                              selectedTemplateId === template._id ? "border-primary ring-1 ring-primary bg-primary/5" : ""
                            )}
                            onClick={() => setSelectedTemplateId(template._id)}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start gap-2">
                                <Badge variant="outline" className="capitalize">{template.category.replace('_', ' ')}</Badge>
                                {selectedTemplateId === template._id && (
                                  <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <CardDescription className="line-clamp-3 text-xs">
                                {template.description}
                              </CardDescription>
                              <div className="mt-3 flex flex-wrap gap-1">
                                {template.features.slice(0, 3).map((f: string) => (
                                  <Badge key={f} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                    {f}
                                  </Badge>
                                ))}
                                {template.features.length > 3 && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                    +{template.features.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="absolute inset-0 overflow-hidden px-6 pb-4 m-0 data-[state=active]:flex flex-col gap-4">
                <div className="grid gap-4 shrink-0">
                  <div className="grid gap-2">
                    <Label htmlFor="name-custom">Workspace Name</Label>
                    <Input 
                      id="name-custom" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. My Project"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc-custom">Description (Optional)</Label>
                    <Input 
                      id="desc-custom" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Brief description of your workspace"
                    />
                  </div>
                </div>

                <div className="flex-1 min-h-0 border rounded-md bg-muted/10 flex flex-col">
                  <div className="p-3 border-b bg-muted/20">
                    <h4 className="text-sm font-medium">Select Features</h4>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <FeatureCustomizer 
                      selectedBundleId={null}
                      enabledFeatures={customFeatures}
                      onToggleFeature={handleToggleFeature}
                    />
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting || (activeTab === "template" && !selectedTemplateId)}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
