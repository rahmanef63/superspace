"use client"

import { useState, useEffect } from "react"
import { BookOpen, Check, Loader2, Search, FileText, Package, Briefcase, Layout, Database, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

// Knowledge source types available in the workspace
export type KnowledgeSourceType = 
  | "wiki"           // Wiki pages / Knowledge Base
  | "posts"          // Blog posts / articles
  | "portfolio"      // Portfolio items
  | "services"       // Services offered
  | "products"       // Products catalog
  | "pages"          // CMS Pages
  | "custom"         // Custom documents

// Icon mapping for source types
const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wiki: BookOpen,
  posts: FileText,
  portfolio: Briefcase,
  services: Package,
  products: Package,
  pages: Layout,
  custom: Database,
}

export interface WikiSelectorProps {
  /** Whether knowledge feature is enabled */
  isEnabled: boolean
  /** Callback when knowledge toggle changes */
  onEnabledChange: (enabled: boolean) => void
  /** Selected knowledge source IDs */
  selectedSources: KnowledgeSourceType[]
  /** Callback when sources selection changes */
  onSourcesChange: (sources: KnowledgeSourceType[]) => void
}

export function WikiSelector({
  isEnabled,
  onEnabledChange,
  selectedSources,
  onSourcesChange,
}: WikiSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tempSelected, setTempSelected] = useState<string[]>(selectedSources)
  
  const { workspaceId } = useWorkspaceContext()

  // Fetch available knowledge sources dynamically from Convex
  const availableSources = useQuery(
    api.features.ai.queries.getAvailableKnowledgeSources,
    workspaceId ? { workspaceId } : {}
  )

  const isLoading = availableSources === undefined

  // Sync temp selection when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelected(selectedSources)
    }
  }, [open, selectedSources])

  // Filter sources that have content or are wiki (always available)
  const sources = (availableSources || []).filter(
    source => source.isAvailable || source.id === "wiki"
  )

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleSource = (sourceId: string) => {
    setTempSelected(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    )
  }

  const handleSelectAll = () => {
    setTempSelected(sources.filter(s => s.isAvailable || s.documentCount > 0).map(s => s.id))
  }

  const handleClearAll = () => {
    setTempSelected([])
  }

  const handleApply = () => {
    onSourcesChange(tempSelected as KnowledgeSourceType[])
    setOpen(false)
  }

  const activeCount = selectedSources.length
  const totalDocs = sources.reduce((sum, s) => sum + s.documentCount, 0)

  return (
    <div className="flex items-center gap-2">
      {/* Knowledge Toggle */}
      <div className="flex items-center gap-1.5">
        <Power className={cn(
          "h-3.5 w-3.5 transition-colors",
          isEnabled ? "text-green-500" : "text-muted-foreground"
        )} />
        <Switch
          checked={isEnabled}
          onCheckedChange={onEnabledChange}
          className="scale-75"
          aria-label="Toggle knowledge"
        />
      </div>

      {/* Knowledge Sources Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!isEnabled}
            className={cn(
              "gap-2 transition-opacity",
              !isEnabled && "opacity-50 cursor-not-allowed",
              isEnabled && activeCount > 0 && "text-primary"
            )}
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Knowledge</span>
            {isEnabled && activeCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Knowledge Sources
            </DialogTitle>
            <DialogDescription>
              Select which workspace data the AI can access. Only sources with content are shown.
            </DialogDescription>
          </DialogHeader>

          {/* Summary */}
          {!isLoading && (
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div>
                <span className="font-medium">{sources.length}</span>
                <span className="text-muted-foreground ml-1">sources available</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <span className="font-medium">{totalDocs}</span>
                <span className="text-muted-foreground ml-1">total documents</span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {tempSelected.length} of {sources.length} selected
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Clear
              </Button>
            </div>
          </div>

          <Separator />

          {/* Sources List */}
          <ScrollArea className="h-[280px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>No sources found</p>
                <p className="text-xs mt-1">Add content to your workspace features</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSources.map((source) => {
                  const Icon = SOURCE_ICONS[source.id] || Database
                  const isSelected = tempSelected.includes(source.id)
                  const hasContent = source.documentCount > 0
                  
                  return (
                    <div
                      key={source.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        !hasContent && "opacity-60",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      )}
                      onClick={() => handleToggleSource(source.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSource(source.id)}
                        className="mt-0.5"
                      />
                      <div className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{source.name}</span>
                          <Badge 
                            variant={hasContent ? "outline" : "secondary"} 
                            className="text-xs"
                          >
                            {source.documentCount} {source.documentCount === 1 ? 'doc' : 'docs'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {source.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="gap-2">
              <Check className="h-4 w-4" />
              Apply ({tempSelected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
