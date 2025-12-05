"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * Base64-encoded image data
   */
  base64: string
  /**
   * MIME type (e.g., 'image/jpeg', 'image/png')
   */
  mediaType: string
  /**
   * Binary image data array (optional, not used for rendering but kept for API compatibility)
   */
  uint8Array?: Uint8Array
}

/**
 * Image - Display AI-generated images
 * 
 * Takes base64, mediaType from AI image generation and converts
 * to proper img src data URLs. No manual data URL construction needed.
 * 
 * @example
 * ```tsx
 * <Image
 *   base64="valid base64 string"
 *   mediaType="image/jpeg"
 *   alt="Generated image"
 *   className="max-w-md rounded-lg"
 * />
 * ```
 */
function Image({
  base64,
  mediaType,
  uint8Array,
  alt = "AI generated image",
  className,
  ...props
}: ImageProps) {
  // Construct data URL from base64 and mediaType
  const src = React.useMemo(() => {
    if (!base64 || !mediaType) return ""
    return `data:${mediaType};base64,${base64}`
  }, [base64, mediaType])

  if (!src) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground rounded-md",
          className
        )}
        {...props as React.HTMLAttributes<HTMLDivElement>}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      data-slot="ai-image"
      src={src}
      alt={alt}
      className={cn("max-w-full rounded-md", className)}
      {...props}
    />
  )
}

export { Image }
export type { ImageProps }
