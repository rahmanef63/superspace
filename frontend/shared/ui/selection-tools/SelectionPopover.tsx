"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface SelectionItem {
  id: string
  label: string
  hint?: string
}

interface SelectionPopoverProps {
  items: SelectionItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  label?: string
  className?: string
}

export function SelectionPopover({
  items,
  selectedIds,
  onChange,
  label = "Select",
  className,
}: SelectionPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return items
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.hint && item.hint.toLowerCase().includes(q))
    )
  }, [items, query])

  const toggle = (id: string) => {
    const isSelected = selectedIds.includes(id)
    const next = isSelected
      ? selectedIds.filter(itemId => itemId !== id)
      : [...selectedIds, id]
    onChange(next)
  }

  const selectAll = () => onChange(items.map(item => item.id))
  const clearAll = () => onChange([])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          {label}
          <Badge variant="secondary" className="ml-1">
            {selectedIds.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="bottom" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Select documents
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="xs" onClick={clearAll}>
                Clear
              </Button>
              <Button variant="ghost" size="xs" onClick={selectAll}>
                All
              </Button>
            </div>
          </div>

          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />

          <ScrollArea className="h-52 rounded-md border">
            <div className="p-2 space-y-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-2">
                  No documents match your search.
                </p>
              ) : filtered.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-tight">{item.label}</p>
                    {item.hint && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.hint}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
