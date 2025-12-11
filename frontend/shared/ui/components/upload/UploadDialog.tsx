"use client"

import React, { useState, useCallback, useRef } from "react"
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Link as LinkIcon,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ContentType = "image" | "video" | "audio" | "document" | "link"

export interface UploadedFile {
  file: File
  preview?: string
  progress: number
  status: "pending" | "uploading" | "complete" | "error"
  error?: string
  storageId?: string
}

export interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (files: {
    file: File
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
    storageId: string // Storage ID from Convex upload
  }[]) => Promise<void>
  onUploadUrl?: (data: {
    url: string
    name: string
    description?: string
    type: ContentType
    tags?: string[]
    folder?: string
  }) => Promise<void>
  generateUploadUrl: () => Promise<string>
  acceptedTypes?: ContentType[]
  maxFiles?: number
  maxFileSize?: number // in bytes
  folders?: string[]
  availableTags?: string[]
}

const typeIcons: Record<ContentType, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  link: LinkIcon,
}

const typeAccept: Record<ContentType, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  document: ".pdf,.doc,.docx,.txt,.md,.xls,.xlsx,.ppt,.pptx",
  link: "",
}

function getContentType(file: File): ContentType {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  if (file.type.startsWith("audio/")) return "audio"
  return "document"
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function UploadDialog({
  open,
  onOpenChange,
  onUpload,
  onUploadUrl,
  generateUploadUrl,
  acceptedTypes = ["image", "video", "audio", "document"],
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  folders = [],
  availableTags = [],
}: UploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"files" | "url">("files")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // URL upload state
  const [urlInput, setUrlInput] = useState("")
  const [urlName, setUrlName] = useState("")
  const [urlDescription, setUrlDescription] = useState("")
  const [urlType, setUrlType] = useState<ContentType>("link")
  
  // Common state
  const [selectedFolder, setSelectedFolder] = useState<string>("__none__")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const acceptString = acceptedTypes
    .map((t) => typeAccept[t])
    .filter(Boolean)
    .join(",")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = []
    const fileArray = Array.from(fileList)

    for (const file of fileArray) {
      if (files.length + newFiles.length >= maxFiles) {
        break
      }

      if (file.size > maxFileSize) {
        newFiles.push({
          file,
          progress: 0,
          status: "error",
          error: `File too large (max ${formatFileSize(maxFileSize)})`,
        })
        continue
      }

      const type = getContentType(file)
      if (!acceptedTypes.includes(type)) {
        newFiles.push({
          file,
          progress: 0,
          status: "error",
          error: `File type not allowed`,
        })
        continue
      }

      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
      }

      newFiles.push({
        file,
        preview,
        progress: 0,
        status: "pending",
      })
    }

    setFiles((prev) => [...prev, ...newFiles])
  }, [files.length, maxFiles, maxFileSize, acceptedTypes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }, [])

  const handleUploadFiles = useCallback(async () => {
    const validFiles = files.filter((f) => f.status === "pending")
    if (validFiles.length === 0) return

    setIsUploading(true)

    // Track uploaded files with their storage IDs
    const uploadResults: Array<{ file: File; storageId: string; index: number }> = []

    try {
      // Upload each file to storage
      for (let i = 0; i < files.length; i++) {
        if (files[i].status !== "pending") continue

        setFiles((prev) => {
          const newFiles = [...prev]
          newFiles[i] = { ...newFiles[i], status: "uploading", progress: 0 }
          return newFiles
        })

        try {
          // Get upload URL
          const uploadUrl = await generateUploadUrl()

          // Upload file
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": files[i].file.type },
            body: files[i].file,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const { storageId } = await response.json()

          // Track successful upload
          uploadResults.push({ file: files[i].file, storageId, index: i })

          setFiles((prev) => {
            const newFiles = [...prev]
            newFiles[i] = { ...newFiles[i], status: "complete", progress: 100, storageId }
            return newFiles
          })
        } catch (error) {
          setFiles((prev) => {
            const newFiles = [...prev]
            newFiles[i] = {
              ...newFiles[i],
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
            }
            return newFiles
          })
        }
      }

      // Create content records for successfully uploaded files
      if (uploadResults.length > 0) {
        const uploadedFiles = uploadResults.map((result) => ({
          file: result.file,
          name: result.file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          type: getContentType(result.file),
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          folder: selectedFolder && selectedFolder !== "__none__" ? selectedFolder : undefined,
          storageId: result.storageId,
        }))

        await onUpload(uploadedFiles)
      }

      // Close dialog and reset
      onOpenChange(false)
      setFiles([])
      setSelectedTags([])
      setSelectedFolder("__none__")
    } finally {
      setIsUploading(false)
    }
  }, [files, generateUploadUrl, onUpload, onOpenChange, selectedTags, selectedFolder])

  const handleUploadUrl = useCallback(async () => {
    if (!urlInput || !onUploadUrl) return

    setIsUploading(true)
    try {
      await onUploadUrl({
        url: urlInput,
        name: urlName || new URL(urlInput).hostname,
        description: urlDescription || undefined,
        type: urlType,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        folder: selectedFolder && selectedFolder !== "__none__" ? selectedFolder : undefined,
      })
      onOpenChange(false)
      setUrlInput("")
      setUrlName("")
      setUrlDescription("")
      setSelectedTags([])
      setSelectedFolder("__none__")
    } finally {
      setIsUploading(false)
    }
  }, [urlInput, urlName, urlDescription, urlType, onUploadUrl, onOpenChange, selectedTags, selectedFolder])

  const addTag = useCallback(() => {
    if (tagInput && !selectedTags.includes(tagInput)) {
      setSelectedTags((prev) => [...prev, tagInput])
      setTagInput("")
    }
  }, [tagInput, selectedTags])

  const removeTag = useCallback((tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
          <DialogDescription>
            Upload files or add a URL to your content library
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "files" | "url")} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="url" disabled={!onUploadUrl}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Add URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="flex-1 min-h-0 overflow-auto mt-4">
            {/* Drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                files.length > 0 && "p-4"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={acceptString}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {files.length === 0 ? (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Drop more files or click to add ({files.length}/{maxFiles})
                </p>
              )}
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                {files.map((file, index) => {
                  const Icon = typeIcons[getContentType(file.file)]
                  return (
                    <div
                      key={`${file.file.name}-${index}`}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file.size)}
                        </p>
                        {file.status === "uploading" && (
                          <Progress value={file.progress} className="h-1 mt-1" />
                        )}
                        {file.status === "error" && (
                          <p className="text-xs text-destructive">{file.error}</p>
                        )}
                      </div>
                      {file.status === "complete" ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : file.status === "error" ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : file.status === "uploading" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tags & Folder */}
            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-xs">Folder (optional)</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tags (optional)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="flex-1 min-h-0 overflow-auto mt-4 space-y-4">
            <div>
              <Label>URL</Label>
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/file.pdf"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Name</Label>
              <Input
                value={urlName}
                onChange={(e) => setUrlName(e.target.value)}
                placeholder="Content name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={urlDescription}
                onChange={(e) => setUrlDescription(e.target.value)}
                placeholder="Brief description..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label>Content Type</Label>
              <Select value={urlType} onValueChange={(v) => setUrlType(v as ContentType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {acceptedTypes.map((type) => {
                    const Icon = typeIcons[type]
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">{type}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={activeTab === "files" ? handleUploadFiles : handleUploadUrl}
            disabled={
              isUploading ||
              (activeTab === "files" && files.filter((f) => f.status === "pending").length === 0) ||
              (activeTab === "url" && !urlInput)
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
