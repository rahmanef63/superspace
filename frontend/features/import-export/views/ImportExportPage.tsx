"use client"

import React, { useState, useRef } from "react"
import { 
  ArrowUpDown, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Database,
  Users,
  FolderKanban,
  Package,
  AlertCircle,
  X,
  FileUp
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useImportExport } from "../hooks/useImportExport"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ImportExportPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const ENTITY_TYPES = [
  { value: "contacts", label: "Contacts", icon: Users },
  { value: "tasks", label: "Tasks", icon: FileText },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "inventory", label: "Inventory", icon: Package },
]

const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", description: "Comma-separated values" },
  { value: "xlsx", label: "Excel", description: "Microsoft Excel format" },
  { value: "json", label: "JSON", description: "JavaScript Object Notation" },
]

/**
 * Import/Export Page Component
 * Complete data import and export functionality
 */
export default function ImportExportPage({ workspaceId }: ImportExportPageProps) {
  const { isLoading, history, startImport, startExport } = useImportExport(workspaceId)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedEntityType, setSelectedEntityType] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("csv")
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use import/export
          </p>
        </div>
      </div>
    )
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!workspaceId || !selectedFile || !selectedEntityType) return
    setIsProcessing(true)

    try {
      const format = selectedFile.name.endsWith(".csv") ? "csv" : 
                     selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls") ? "xlsx" : "json"
      
      await startImport({
        workspaceId,
        entityType: selectedEntityType,
        format,
        fileName: selectedFile.name,
      })
      
      setImportDialogOpen(false)
      setSelectedFile(null)
      setSelectedEntityType("")
    } catch (error) {
      console.error("Import failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async (entityType: string, format: string) => {
    if (!workspaceId) return
    setIsProcessing(true)

    try {
      await startExport({
        workspaceId,
        entityType,
        format,
      })
      setExportDialogOpen(false)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const openExportDialog = (entityType: string) => {
    setSelectedEntityType(entityType)
    setSelectedFormat("csv")
    setExportDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={ArrowUpDown}
        title="Import / Export"
        subtitle="Manage your workspace data"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Import Data",
          icon: Upload,
          onClick: () => setImportDialogOpen(true),
        }}
      />

      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="import" className="space-y-4">
          <TabsList>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            {/* Import Options */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${dragActive ? "border-primary border-2" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => setImportDialogOpen(true)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-full bg-green-100 dark:bg-green-900/30 w-fit">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="mt-3">CSV Import</CardTitle>
                  <CardDescription>
                    Import data from CSV files
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setImportDialogOpen(true)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 w-fit">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="mt-3">Excel Import</CardTitle>
                  <CardDescription>
                    Import from .xlsx or .xls files
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Supports multiple sheets
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setImportDialogOpen(true)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 w-fit">
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="mt-3">JSON Import</CardTitle>
                  <CardDescription>
                    Import from JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Structured data import
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tips */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Import Tips</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Ensure your file has headers in the first row</li>
                      <li>• Date formats should be YYYY-MM-DD or MM/DD/YYYY</li>
                      <li>• Maximum file size is 10MB</li>
                      <li>• Review the mapping before confirming import</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {ENTITY_TYPES.map((entity) => (
                <Card key={entity.value} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <entity.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{entity.label}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      Export all {entity.label.toLowerCase()} data
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleExport(entity.value, "csv")}
                    >
                      CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleExport(entity.value, "xlsx")}
                    >
                      Excel
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openExportDialog(entity.value)}
                    >
                      More
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-medium">No history yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your import and export history will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.map((item: any) => (
                  <Card key={item._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${item.type === "import" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                          {item.type === "import" ? (
                            <Upload className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Download className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {item.type === "import" ? "Import" : "Export"}: {item.entityType}
                            </p>
                            {item.fileName && (
                              <span className="text-xs text-muted-foreground truncate">
                                ({item.fileName})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{new Date(item.startedAt).toLocaleString()}</span>
                            {item.recordCount !== undefined && (
                              <span>{item.recordCount} records</span>
                            )}
                            {item.successCount !== undefined && item.errorCount !== undefined && (
                              <span className="text-xs">
                                ✓ {item.successCount} success, ✗ {item.errorCount} errors
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <Badge 
                            variant={
                              item.status === "completed" ? "default" :
                              item.status === "failed" ? "destructive" : 
                              item.status === "processing" ? "secondary" : "outline"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      {item.status === "processing" && (
                        <Progress value={50} className="mt-3 h-1" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a file to import data into your workspace
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              } ${selectedFile ? "bg-muted/50" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileUp className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop your file here, or
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <p className="text-xs text-muted-foreground mt-3">
                    Supports CSV, Excel, and JSON files up to 10MB
                  </p>
                </>
              )}
            </div>

            {/* Entity Type Selection */}
            <div className="space-y-2">
              <Label>Import to</Label>
              <Select
                value={selectedEntityType}
                onValueChange={setSelectedEntityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((entity) => (
                    <SelectItem key={entity.value} value={entity.value}>
                      <div className="flex items-center gap-2">
                        <entity.icon className="h-4 w-4" />
                        {entity.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || !selectedEntityType || isProcessing}
            >
              {isProcessing ? "Importing..." : "Start Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export {ENTITY_TYPES.find(e => e.value === selectedEntityType)?.label}</DialogTitle>
            <DialogDescription>
              Choose your export format and options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="grid gap-2">
                {EXPORT_FORMATS.map((format) => (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${selectedFormat === format.value ? "border-primary" : ""}`}
                    onClick={() => setSelectedFormat(format.value)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${selectedFormat === format.value ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-sm">{format.label}</p>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleExport(selectedEntityType, selectedFormat)}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              {isProcessing ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
