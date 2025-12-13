
import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Edit2, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface EventDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    event: any
    onEdit: (event: any) => void
    onDelete: (eventId: string) => void
}

export function EventDetailsDialog({
    open,
    onOpenChange,
    event,
    onEdit,
    onDelete
}: EventDetailsDialogProps) {
    if (!event) return null

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl leading-none">{event.title}</DialogTitle>
                            {event.type && (
                                <Badge variant="secondary" className="mt-2 capitalize bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                    {event.type}
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Time & Date */}
                    <div className="flex items-start gap-3 text-sm">
                        <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="grid gap-0.5">
                            <span className="font-medium text-foreground">
                                {formatDate(event.startsAt)}
                            </span>
                            {!event.allDay && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                    {formatTime(event.startsAt)}
                                    {event.endsAt && ` - ${formatTime(event.endsAt)}`}
                                </span>
                            )}
                            {event.allDay && (
                                <span className="text-muted-foreground">All Day</span>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    {event.location && (
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <span className="text-foreground">{event.location}</span>
                        </div>
                    )}

                    <Separator />

                    {/* Description */}
                    {event.description && (
                        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {event.description}
                        </div>
                    )}

                    {!event.description && (
                        <div className="text-sm text-muted-foreground italic">
                            No description provided.
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-2 sm:gap-0">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            onDelete(event._id)
                            onOpenChange(false)
                        }}
                        className="gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                onEdit(event)
                                onOpenChange(false)
                            }}
                            className="gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
