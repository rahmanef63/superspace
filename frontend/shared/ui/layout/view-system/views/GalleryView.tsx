/**
 * Gallery View Component
 * 
 * Image-focused grid view for visual content.
 * Supports large thumbnails and masonry layouts.
 */

"use client"

import React, { useMemo, useState } from "react"
import { ImageIcon, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog"
import type { ViewComponentProps, ViewField } from "../types"

interface GalleryItem {
  id?: string
  _id?: string
  image?: string
  thumbnail?: string
  url?: string
  src?: string
  title?: string
  name?: string
  description?: string
  alt?: string
  [key: string]: any
}

export function GalleryView<T extends GalleryItem>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!state.searchQuery) return data

    const query = state.searchQuery.toLowerCase()
    return data.filter((item) => {
      // Search in title, name, description, alt
      const searchFields = ["title", "name", "description", "alt"]
      return searchFields.some((field) => {
        const value = item[field as keyof T]
        return value != null && String(value).toLowerCase().includes(query)
      })
    })
  }, [data, state.searchQuery])

  // Get unique ID for each item
  const getItemId = (item: T, index: number): string => {
    return String(item.id || item._id || index)
  }

  // Check if item is selected
  const isSelected = (item: T, index: number): boolean => {
    const id = getItemId(item, index)
    return state.selectedIds.has(id)
  }

  // Toggle item selection
  const toggleSelection = (item: T, index: number) => {
    const id = getItemId(item, index)
    if (isSelected(item, index)) {
      actions.deselectItem(id)
    } else {
      actions.selectItem(id)
    }
  }

  // Get image URL from item
  const getImageUrl = (item: T): string | undefined => {
    return item.image || item.thumbnail || item.url || item.src
  }

  // Get image title
  const getImageTitle = (item: T): string => {
    return item.title || item.name || item.alt || "Untitled"
  }

  // Open lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  // Navigate lightbox
  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIndex === null) return
    
    const newIndex = direction === "next"
      ? (lightboxIndex + 1) % filteredData.length
      : (lightboxIndex - 1 + filteredData.length) % filteredData.length
    
    setLightboxIndex(newIndex)
  }

  // Handle keyboard navigation in lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      navigateLightbox("prev")
    } else if (e.key === "ArrowRight") {
      navigateLightbox("next")
    } else if (e.key === "Escape") {
      setLightboxIndex(null)
    }
  }

  if (filteredData.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 gap-4", className)}>
        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No images found</p>
      </div>
    )
  }

  // Get grid columns based on config
  const gridCols = (config.settings as any)?.gridColumns || 4
  const gridColsMap: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
  }
  const gridColsClass = gridColsMap[gridCols as keyof typeof gridColsMap] || "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

  return (
    <>
      <div className={cn("grid gap-4", gridColsClass, className)}>
        {filteredData.map((item, index) => {
          const id = getItemId(item, index)
          const selected = isSelected(item, index)
          const imageUrl = getImageUrl(item)
          const title = getImageTitle(item)

          return (
            <Card
              key={id}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                selected && "ring-2 ring-primary"
              )}
              onClick={() => {
                if (config.settings?.selectable) {
                  toggleSelection(item, index)
                } else {
                  openLightbox(index)
                }
              }}
            >
              {/* Image */}
              <div className="aspect-square bg-muted relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation()
                      openLightbox(index)
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selection checkbox */}
                {config.settings?.selectable && (
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleSelection(item, index)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background/80"
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="p-2">
                <p className="text-sm font-medium truncate">{title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
        <DialogContent 
          className="max-w-[90vw] max-h-[90vh] p-0 gap-0"
          onKeyDown={handleKeyDown}
        >
          {lightboxIndex !== null && (
            <>
              {/* Close button */}
              <DialogClose className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" className="bg-background/80 hover:bg-background">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>

              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                onClick={() => navigateLightbox("prev")}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                onClick={() => navigateLightbox("next")}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Image */}
              <div className="flex items-center justify-center min-h-[60vh] bg-black/95">
                <img
                  src={getImageUrl(filteredData[lightboxIndex]) || ""}
                  alt={getImageTitle(filteredData[lightboxIndex])}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>

              {/* Info bar */}
              <div className="p-4 bg-background">
                <h3 className="font-medium">{getImageTitle(filteredData[lightboxIndex])}</h3>
                {filteredData[lightboxIndex].description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredData[lightboxIndex].description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {lightboxIndex + 1} of {filteredData.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GalleryView
