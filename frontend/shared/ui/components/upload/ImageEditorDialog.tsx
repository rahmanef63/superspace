"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Download,
  Check,
  Loader2,
  SlidersHorizontal,
  Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ImageCrop,
  ImageCropContent,
  ImageCropApply,
  ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop"
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom"

export interface ImageEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onSave: (editedImage: Blob, changes: ImageEditChanges) => Promise<void>
  aspectRatios?: { label: string; value: number | undefined }[]
}

export interface ImageEditChanges {
  rotation: number
  flipH: boolean
  flipV: boolean
  brightness: number
  contrast: number
  saturation: number
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  zoom: number
}

const defaultChanges: ImageEditChanges = {
  rotation: 0,
  flipH: false,
  flipV: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  zoom: 1,
}

const defaultAspectRatios = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:2", value: 3 / 2 },
  { label: "2:3", value: 2 / 3 },
]

type EditorMode = "transform" | "adjust" | "crop" | "preview"

export function ImageEditorDialog({
  open,
  onOpenChange,
  imageSrc,
  onSave,
  aspectRatios = defaultAspectRatios,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [changes, setChanges] = useState<ImageEditChanges>(defaultChanges)
  const [history, setHistory] = useState<ImageEditChanges[]>([defaultChanges])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [activeMode, setActiveMode] = useState<EditorMode>("transform")
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | undefined>(undefined)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [croppedImageSrc, setCroppedImageSrc] = useState<string | null>(null)

  // Load image and convert to File for crop component
  useEffect(() => {
    if (!open || !imageSrc) return

    setImageLoaded(false)
    setCroppedImageSrc(null)
    setChanges(defaultChanges)
    setHistory([defaultChanges])
    setHistoryIndex(0)
    setActiveMode("transform")
    setImageFile(null)

    const img = new Image()
    img.crossOrigin = "anonymous"

    const createFileFromImage = (sourceImg: HTMLImageElement) => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = sourceImg.naturalWidth
        canvas.height = sourceImg.naturalHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(sourceImg, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "image.png", { type: "image/png" })
              setImageFile(file)
              console.log("Image file created from canvas:", file.size, "bytes")
            } else {
              console.error("Canvas toBlob returned null - trying fetch fallback")
              fetchImageAsFile()
            }
          }, "image/png")
        }
      } catch (err) {
        console.error("Canvas conversion failed:", err)
        fetchImageAsFile()
      }
    }

    const fetchImageAsFile = () => {
      fetch(imageSrc, { mode: "cors" })
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "image.png", { type: blob.type || "image/png" })
          setImageFile(file)
          console.log("Image file created from fetch:", file.size, "bytes")
        })
        .catch((fetchErr) => {
          console.error("Fetch fallback also failed:", fetchErr)
          // Last resort: try without CORS mode
          fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], "image.png", { type: blob.type || "image/png" })
              setImageFile(file)
              console.log("Image file created from non-cors fetch:", file.size, "bytes")
            })
            .catch((e) => console.error("All methods failed to create file:", e))
        })
    }

    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      renderCanvas()
      createFileFromImage(img)
    }
    img.onerror = () => {
      console.error("Failed to load image with CORS, trying direct fetch")
      // If CORS load fails, try fetching directly
      fetchImageAsFile()
      // Still try to load image for canvas preview
      const fallbackImg = new Image()
      fallbackImg.onload = () => {
        imageRef.current = fallbackImg
        setImageLoaded(true)
        renderCanvas()
      }
      fallbackImg.src = imageSrc
    }
    img.src = imageSrc

    return () => {
      imageRef.current = null
      setImageLoaded(false)
      setImageFile(null)
    }
  }, [open, imageSrc])

  // Re-render when changes update
  useEffect(() => {
    if (imageLoaded && activeMode !== "crop") {
      renderCanvas()
    }
  }, [changes, imageLoaded, activeMode])

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate dimensions based on rotation
    const isRotated = changes.rotation === 90 || changes.rotation === 270
    const sourceWidth = isRotated ? img.height : img.width
    const sourceHeight = isRotated ? img.width : img.height

    // Set canvas size (with zoom)
    const zoom = changes.zoom
    canvas.width = sourceWidth * zoom
    canvas.height = sourceHeight * zoom

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((changes.rotation * Math.PI) / 180)
    ctx.scale(changes.flipH ? -1 : 1, changes.flipV ? -1 : 1)

    // Apply filters
    ctx.filter = `brightness(${changes.brightness}%) contrast(${changes.contrast}%) saturate(${changes.saturation}%)`

    // Draw image centered
    const drawWidth = img.width * zoom
    const drawHeight = img.height * zoom
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

    ctx.restore()
  }, [changes])

  const updateChanges = useCallback((newChanges: Partial<ImageEditChanges>) => {
    setChanges((prev) => {
      const updated = { ...prev, ...newChanges }
      // Add to history (trim future history if we're not at the end)
      setHistory((prevHistory) => {
        const trimmed = prevHistory.slice(0, historyIndex + 1)
        return [...trimmed, updated]
      })
      setHistoryIndex((prev) => prev + 1)
      return updated
    })
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      setChanges(history[historyIndex - 1])
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      setChanges(history[historyIndex + 1])
    }
  }, [historyIndex, history])

  const reset = useCallback(() => {
    setChanges(defaultChanges)
    setHistory([defaultChanges])
    setHistoryIndex(0)
    setCroppedImageSrc(null)
    // Reset image from original source
    if (imageSrc) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        imageRef.current = img
        setImageLoaded(true)
        renderCanvas()
      }
      img.src = imageSrc

      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "image.png", { type: blob.type || "image/png" })
          setImageFile(file)
        })
    }
  }, [imageSrc, renderCanvas])

  const rotate = useCallback((direction: "cw" | "ccw") => {
    const delta = direction === "cw" ? 90 : -90
    updateChanges({
      rotation: ((changes.rotation + delta) % 360 + 360) % 360,
    })
  }, [changes.rotation, updateChanges])

  const flip = useCallback((axis: "h" | "v") => {
    if (axis === "h") {
      updateChanges({ flipH: !changes.flipH })
    } else {
      updateChanges({ flipV: !changes.flipV })
    }
  }, [changes.flipH, changes.flipV, updateChanges])

  const handleCropComplete = useCallback((croppedDataUrl: string) => {
    setCroppedImageSrc(croppedDataUrl)
    // Update the image ref with cropped image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      // Reset changes after crop but keep the cropped image
      setChanges(defaultChanges)
      setHistory([defaultChanges])
      setHistoryIndex(0)
    }
    img.src = croppedDataUrl
    // Also update the file for potential re-cropping
    fetch(croppedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "cropped-image.png", { type: "image/png" })
        setImageFile(file)
      })
    setActiveMode("transform")
  }, [])

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSaving(true)
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error("Failed to create image blob"))
          },
          "image/png",
          0.95
        )
      })

      await onSave(blob, changes)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save image:", error)
    } finally {
      setIsSaving(false)
    }
  }, [changes, onSave, onOpenChange])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "edited-image.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }, [])

  const getCurrentPreviewUrl = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      return canvas.toDataURL("image/png")
    }
    return croppedImageSrc || imageSrc
  }, [croppedImageSrc, imageSrc])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] sm:max-w-[98vw] overflow-hidden flex flex-col p-4 md:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            {activeMode === "crop"
              ? "Select the area you want to keep"
              : activeMode === "preview"
                ? "Preview your edited image (click to zoom)"
                : "Make adjustments to your image"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Main Content Area - Much larger */}
          {/* Main Content Area - Each mode takes full height */}
          <div
            ref={containerRef}
            className="flex-1 min-w-0 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden p-4 relative"
          >
            {activeMode === "crop" ? (
              imageFile ? (
                <div className="w-full h-full flex flex-col overflow-hidden">
                  <ImageCrop
                    file={imageFile}
                    aspect={selectedAspectRatio}
                    onCrop={handleCropComplete}
                    maxImageSize={1024 * 1024 * 10}
                  >
                    <div className="flex flex-col items-center gap-4 h-full">
                      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
                        <ImageCropContent className="max-h-[calc(100%-60px)] w-auto object-contain" />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 py-3 bg-background/80 backdrop-blur-sm rounded-lg px-4">
                        <ImageCropReset asChild>
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                          </Button>
                        </ImageCropReset>
                        <ImageCropApply asChild>
                          <Button variant="default" size="sm">
                            <Crop className="h-4 w-4 mr-1" />
                            Apply Crop
                          </Button>
                        </ImageCropApply>
                      </div>
                    </div>
                  </ImageCrop>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">Loading image for cropping...</p>
                </div>
              )
            ) : activeMode === "preview" ? (
              <ImageZoom>
                <img
                  src={getCurrentPreviewUrl()}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded"
                  style={{ maxHeight: "calc(95vh - 200px)" }}
                />
              </ImageZoom>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: "auto", maxHeight: "calc(95vh - 200px)" }}
              />
            )}
          </div>

          {/* Controls Sidebar - Scrollable on mobile */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col max-h-[30vh] lg:max-h-full overflow-auto">
            {/* Mode Tabs */}
            <div className="flex gap-1 mb-4">
              <Button
                variant={activeMode === "transform" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveMode("transform")}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Transform
              </Button>
              <Button
                variant={activeMode === "adjust" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveMode("adjust")}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                Adjust
              </Button>
              <Button
                variant={activeMode === "crop" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveMode("crop")}
              >
                {imageFile ? (
                  <Crop className="h-4 w-4 mr-1" />
                ) : (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                )}
                Crop
              </Button>
              <Button
                variant={activeMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveMode("preview")}
                title="Preview with zoom"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              {activeMode === "transform" && (
                <div className="space-y-4">
                  {/* Rotation */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Rotation</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => rotate("ccw")}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        -90°
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => rotate("cw")}
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                        +90°
                      </Button>
                    </div>
                  </div>

                  {/* Flip */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Flip</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={changes.flipH ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => flip("h")}
                      >
                        <FlipHorizontal className="h-4 w-4 mr-1" />
                        Horizontal
                      </Button>
                      <Button
                        variant={changes.flipV ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => flip("v")}
                      >
                        <FlipVertical className="h-4 w-4 mr-1" />
                        Vertical
                      </Button>
                    </div>
                  </div>

                  {/* Zoom */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">Zoom</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(changes.zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateChanges({ zoom: Math.max(0.25, changes.zoom - 0.25) })}
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Slider
                        value={[changes.zoom]}
                        min={0.25}
                        max={3}
                        step={0.05}
                        onValueChange={([v]) => updateChanges({ zoom: v })}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateChanges({ zoom: Math.min(3, changes.zoom + 0.25) })}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeMode === "adjust" && (
                <div className="space-y-4">
                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">Brightness</Label>
                      <span className="text-xs text-muted-foreground">{changes.brightness}%</span>
                    </div>
                    <Slider
                      value={[changes.brightness]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([v]) => updateChanges({ brightness: v })}
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">Contrast</Label>
                      <span className="text-xs text-muted-foreground">{changes.contrast}%</span>
                    </div>
                    <Slider
                      value={[changes.contrast]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([v]) => updateChanges({ contrast: v })}
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">Saturation</Label>
                      <span className="text-xs text-muted-foreground">{changes.saturation}%</span>
                    </div>
                    <Slider
                      value={[changes.saturation]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([v]) => updateChanges({ saturation: v })}
                    />
                  </div>

                  {/* Reset adjustments */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => updateChanges({ brightness: 100, contrast: 100, saturation: 100 })}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Reset Adjustments
                  </Button>
                </div>
              )}

              {activeMode === "crop" && (
                <div className="space-y-4">
                  {/* Aspect Ratio Selection */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Aspect Ratio
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {aspectRatios.map((ratio) => (
                        <Button
                          key={ratio.label}
                          variant={selectedAspectRatio === ratio.value ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedAspectRatio(ratio.value)}
                        >
                          {ratio.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Drag to select the crop area</p>
                    <p>• Drag corners to resize</p>
                    <p>• Click "Apply Crop" when done</p>
                  </div>
                </div>
              )}

              {activeMode === "preview" && (
                <div className="space-y-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Click on the image to zoom in</p>
                    <p>• Click again to zoom out</p>
                    <p>• This is how your final image will look</p>
                  </div>
                </div>
              )}
            </div>

            {/* Undo/Redo - Always visible */}
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={undo}
                disabled={historyIndex === 0}
              >
                <Undo className="h-4 w-4 mr-1" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={redo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo className="h-4 w-4 mr-1" />
                Redo
              </Button>
            </div>

            {/* Reset All */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground"
              onClick={reset}
            >
              Reset All
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}