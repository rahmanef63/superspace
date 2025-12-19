/**
 * Media Block
 * 
 * Displays Images or Videos with optional captions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Image as ImageIcon, PlayCircle, Maximize2 } from "lucide-react"
import { BlockCard } from "../shared"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

// ============================================================================
// Types
// ============================================================================

export interface MediaBlockProps {
    type: "image" | "video"
    src: string
    alt?: string
    caption?: string
    aspectRatio?: number
    className?: string
    allowFullscreen?: boolean
}

// ============================================================================
// Media Block
// ============================================================================

export function MediaBlock({
    type,
    src,
    alt = "Media content",
    caption,
    aspectRatio = 16 / 9,
    className,
    allowFullscreen = true,
}: MediaBlockProps) {

    const Content = () => (
        <div className="relative w-full h-full group rounded-lg overflow-hidden border bg-muted">
            {type === "image" ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover w-full h-full"
                    unoptimized
                />
            ) : (
                <video
                    src={src}
                    controls
                    className="w-full h-full object-contain bg-black"
                />
            )}
        </div>
    )

    return (
        <div className={className}>
            <figure className="space-y-2">
                <AspectRatio ratio={aspectRatio}>
                    {allowFullscreen && type === "image" ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="cursor-zoom-in relative w-full h-full group">
                                    <Content />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Maximize2 className="text-white drop-shadow-md" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden border-none bg-transparent shadow-none aspect-video relative">
                                <Image src={src} alt={alt} fill className="object-contain rounded-md" unoptimized />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Content />
                    )}
                </AspectRatio>
                {caption && (
                    <figcaption className="text-sm text-muted-foreground text-center italic">
                        {caption}
                    </figcaption>
                )}
            </figure>
        </div>
    )
}
