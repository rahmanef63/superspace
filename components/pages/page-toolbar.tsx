"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  ImageIcon,
} from "lucide-react"

interface PageToolbarProps {
  className?: string
}

export function PageToolbar({ className }: PageToolbarProps) {
  return (
    <div className={`flex items-center gap-1 p-2 border-b ${className}`}>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
