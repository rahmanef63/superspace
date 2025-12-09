"use client"

import * as React from "react"
import { Bell, HelpCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GlobalCreateMenu } from "./GlobalCreateMenu"

export interface GlobalUtilityButtonsProps {
    className?: string
    onSearchClick?: () => void
    onNotificationsClick?: () => void
    onHelpClick?: () => void
    onCreateClick?: () => void
}

export function GlobalUtilityButtons({
    className,
    onSearchClick,
    onNotificationsClick,
    onHelpClick,
    onCreateClick,
}: GlobalUtilityButtonsProps) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onSearchClick ? onSearchClick() : window.dispatchEvent(new Event("open-command-menu"))
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onSearchClick])

    const handleSearch = () => {
        if (onSearchClick) onSearchClick()
        else window.dispatchEvent(new Event("open-command-menu"))
    }

    const handleNotifications = () => {
        if (onNotificationsClick) onNotificationsClick()
        else window.dispatchEvent(new Event("open-notifications"))
    }

    const handleHelp = () => {
        if (onHelpClick) onHelpClick()
        else window.dispatchEvent(new Event("open-help"))
    }

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Search Trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleSearch}
                title="Search (Cmd+K)"
            >
                <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleNotifications}
                title="Notifications"
            >
                <Bell className="h-4 w-4" />
            </Button>

            {/* Help */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleHelp}
                title="Help & Support"
            >
                <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Primary Create Action */}
            <GlobalCreateMenu />
        </div>
    )
}
