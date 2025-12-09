/**
 * Message Composer
 * 
 * Rich message input with file upload, emoji picker, and mentions.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    Plus,
    Smile,
    Gift,
    Sticker,
    Image,
    AtSign,
    Hash,
    X,
    Paperclip,
    Send,
    Mic,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { type Message } from "../shared"

interface MessageComposerProps {
    channelName?: string
    channelId?: string
    replyTo?: Message | null
    placeholder?: string
    disabled?: boolean
    onSend?: (content: string, attachments?: File[]) => void
    onTyping?: () => void
    onCancelReply?: () => void
    className?: string
}

export function MessageComposer({
    channelName = "channel",
    channelId,
    replyTo,
    placeholder,
    disabled = false,
    onSend,
    onTyping,
    onCancelReply,
    className,
}: MessageComposerProps) {
    const [content, setContent] = React.useState("")
    const [attachments, setAttachments] = React.useState<File[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Quick emojis
    const quickEmojis = ["😀", "😂", "❤️", "👍", "👎", "🎉", "🔥", "💯", "✨", "🙏", "😊", "🤔"]

    // Auto-resize textarea
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
        }
    }, [content])

    const handleSubmit = () => {
        if (!content.trim() && attachments.length === 0) return
        onSend?.(content, attachments)
        setContent("")
        setAttachments([])
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return
        setAttachments(prev => [...prev, ...Array.from(files)])
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const insertEmoji = (emoji: string) => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart
            const end = textareaRef.current.selectionEnd
            const newContent = content.slice(0, start) + emoji + content.slice(end)
            setContent(newContent)
            // Focus and set cursor position after emoji
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus()
                    textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length)
                }
            }, 0)
        } else {
            setContent(prev => prev + emoji)
        }
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn("relative", className)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Drop zone overlay */}
                {isDragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg">
                        <p className="text-primary font-medium">Drop files here</p>
                    </div>
                )}

                {/* Reply preview */}
                {replyTo && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-l-2 border-primary rounded-t-lg">
                        <span className="text-xs text-muted-foreground">Replying to</span>
                        <span className="text-xs font-medium text-primary">
                            @{replyTo.sender?.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate flex-1">
                            {replyTo.content?.slice(0, 50)}...
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={onCancelReply}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Attachment previews */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 py-2 border-b bg-muted/30">
                        {attachments.map((file, index) => (
                            <div
                                key={index}
                                className="relative flex items-center gap-2 px-2 py-1 bg-background rounded border group"
                            >
                                <Paperclip className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeAttachment(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main input area */}
                <div className={cn(
                    "flex items-end gap-2 px-4 py-3 bg-muted/30 rounded-lg",
                    replyTo && "rounded-t-none",
                    attachments.length > 0 && !replyTo && "rounded-t-none"
                )}>
                    {/* Attach button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-full"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach File</TooltipContent>
                    </Tooltip>

                    {/* Text input */}
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value)
                            onTyping?.()
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || `Message #${channelName}`}
                        disabled={disabled}
                        className={cn(
                            "flex-1 min-h-[40px] max-h-[200px] resize-none",
                            "bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-muted-foreground/60"
                        )}
                        rows={1}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                        {/* GIF button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={disabled}
                                >
                                    <Gift className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>GIFs</TooltipContent>
                        </Tooltip>

                        {/* Sticker button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={disabled}
                                >
                                    <Sticker className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Stickers</TooltipContent>
                        </Tooltip>

                        {/* Emoji picker */}
                        <Popover>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={disabled}
                                        >
                                            <Smile className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Emoji</TooltipContent>
                            </Tooltip>
                            <PopoverContent className="w-auto p-3" align="end">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">Quick Reactions</p>
                                    <div className="grid grid-cols-6 gap-1">
                                        {quickEmojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => insertEmoji(emoji)}
                                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg transition-colors"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Send button (shown when there's content) */}
                        {(content.trim() || attachments.length > 0) && (
                            <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 ml-1"
                                onClick={handleSubmit}
                                disabled={disabled}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Character count (optional) */}
                {content.length > 1800 && (
                    <div className="absolute bottom-1 right-4 text-xs text-muted-foreground">
                        <span className={cn(content.length > 2000 && "text-destructive font-medium")}>
                            {content.length}
                        </span>
                        /2000
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}

export default MessageComposer
