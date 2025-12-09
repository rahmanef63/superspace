"use client"

import * as React from "react"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { MessageSquare, UserMinus, User, Ban } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

interface ContactContextMenuProps {
    children: React.ReactNode
    contactId: Id<"users">
    contactName: string
    onRemove?: () => void
    onMessage?: () => void
    onViewProfile?: () => void
}

export function ContactContextMenu({
    children,
    contactId,
    contactName,
    onRemove,
    onMessage,
    onViewProfile,
}: ContactContextMenuProps) {
    const router = useRouter()

    // Chat mutations removed as we rely on parent callbacks

    const handleMessage = () => {
        if (onMessage) {
            onMessage();
        } else {
            // Fallback or just log
            console.log("Start chat with", contactId)
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={handleMessage}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                    <ContextMenuShortcut>⌘M</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={onViewProfile}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onRemove}
                >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Contact
                    <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem disabled className="text-destructive focus:text-destructive">
                    <Ban className="mr-2 h-4 w-4" />
                    Block
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
