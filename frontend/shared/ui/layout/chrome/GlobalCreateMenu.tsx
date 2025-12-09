"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAllCreateActions } from "@/frontend/shared/foundation/registries/create-registry"
import { cn } from "@/lib/utils"

export function GlobalCreateMenu({ className }: { className?: string }) {
    const actions = getAllCreateActions()

    return (
        <div className={cn("ml-1 pl-1 border-l border-border/50", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        className="h-8 gap-2 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline-block font-medium">Create</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Create New</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actions.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                            No actions registered
                        </div>
                    ) : (
                        actions.map((action) => (
                            <DropdownMenuItem
                                key={action.id}
                                onClick={action.onClick}
                                className="gap-2"
                            >
                                <action.icon className="h-4 w-4" />
                                <span className="flex-1">{action.label}</span>
                                {action.shortcut && (
                                    <span className="text-xs text-muted-foreground">{action.shortcut}</span>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
