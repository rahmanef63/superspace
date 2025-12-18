/**
 * Kanban Block
 * 
 * Displays items in columns by status.
 */

"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Kanban, MoreHorizontal, Plus } from "lucide-react"
import { BlockCard, getTypeColor } from "../shared"
import { Button } from "@/components/ui/button"

// ============================================================================
// Types
// ============================================================================

export interface KanbanItem {
    id: string
    title: string
    status: string
    priority?: "low" | "medium" | "high"
    tags?: string[]
}

export interface KanbanColumn {
    id: string
    title: string
    items: KanbanItem[]
}

export interface KanbanBlockProps {
    columns: KanbanColumn[]
    title?: string
    description?: string
    height?: string
    className?: string
    loading?: boolean
    onAddItem?: (columnId: string) => void
    onItemClick?: (item: KanbanItem) => void
}

// ============================================================================
// Kanban Block
// ============================================================================

export function KanbanBlock({
    columns,
    title = "Kanban Board",
    description = "Project Status",
    height = "400px",
    className,
    loading = false,
    onAddItem,
    onItemClick,
}: KanbanBlockProps) {
    const isEmpty = !columns || columns.length === 0 || columns.every(c => c.items.length === 0)

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: Kanban,
            }}
            loading={loading}
            isEmpty={isEmpty}
            emptyState={{
                icon: Kanban,
                title: "No items",
                description: "Add items to get started",
            }}
            className={className}
        >
            <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4 px-1 min-w-full" style={{ height }}>
                    {columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-72 flex flex-col bg-muted/30 rounded-lg border">
                            {/* Column Header */}
                            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-sm">{column.title}</h3>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 rounded-full">
                                        {column.items.length}
                                    </Badge>
                                </div>
                                {onAddItem && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddItem(column.id)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>

                            {/* Column Items */}
                            <ScrollArea className="flex-1 p-2">
                                <div className="flex flex-col gap-2">
                                    {column.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3 bg-background border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-2 group"
                                            onClick={() => onItemClick?.(item)}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="text-sm font-medium leading-tight">{item.title}</span>
                                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 -mr-1 -mt-1">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {item.priority && (
                                                    <Badge
                                                        variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"}
                                                        className="text-[10px] h-5 font-normal"
                                                    >
                                                        {item.priority}
                                                    </Badge>
                                                )}
                                                {item.tags?.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-[10px] h-5 font-normal text-muted-foreground border-muted-foreground/30">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </BlockCard>
    )
}
