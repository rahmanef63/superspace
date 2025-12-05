"use client"

/**
 * Shared Chat Bubble Components - WhatsApp Style
 * 
 * Used by both AI chat and regular chat features.
 * Supports:
 * - Text messages
 * - Voice messages
 * - Link previews
 * - Forwarded messages
 * - Reply/Quote
 * - Branches (for AI regeneration)
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Check, 
  CheckCheck,
  Forward,
  Reply,
  MoreVertical,
  Music,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// Types
// ============================================================================

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error"
export type MessageFrom = "user" | "other" | "system"

export interface MessageBranch {
  id: string
  content: string
  timestamp: number
}

export interface LinkPreview {
  url: string
  title: string
  description?: string
  image?: string
  siteName?: string
}

export interface VoiceMessage {
  duration: number // in seconds
  waveform?: number[] // normalized 0-1 values
}

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Who sent the message */
  from: MessageFrom
  /** Sender name (for group chats or AI) */
  senderName?: string
  /** Sender avatar URL */
  senderAvatar?: string
  /** Sender avatar fallback (initials or icon) */
  senderFallback?: React.ReactNode
  /** Avatar color gradient */
  avatarGradient?: string
  /** Message timestamp */
  timestamp?: Date | number
  /** Message status */
  status?: MessageStatus
  /** Is this a forwarded message */
  isForwarded?: boolean
  /** Reply/Quote reference */
  replyTo?: {
    senderName: string
    content: string
  }
  /** Voice message data */
  voiceMessage?: VoiceMessage
  /** Link preview data */
  linkPreview?: LinkPreview
  /** Message branches for AI regeneration */
  branches?: MessageBranch[]
  /** Current branch index */
  currentBranchIndex?: number
  /** Callback when branch changes */
  onBranchChange?: (index: number) => void
  /** Show actions on hover */
  showActions?: boolean
  /** Action menu items */
  actions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }>
  /** Custom renderer for branch content (e.g., for markdown) */
  renderBranchContent?: (content: string) => React.ReactNode
  /** Children (message content) */
  children?: React.ReactNode
}

// ============================================================================
// Chat Bubble Container
// ============================================================================

export function ChatBubble({
  from,
  senderName,
  senderAvatar,
  senderFallback,
  avatarGradient = "from-blue-600 to-purple-600",
  timestamp,
  status,
  isForwarded,
  replyTo,
  voiceMessage,
  linkPreview,
  branches,
  currentBranchIndex = 0,
  onBranchChange,
  showActions = true,
  actions,
  renderBranchContent,
  children,
  className,
  ...props
}: ChatBubbleProps) {
  const isUser = from === "user"
  const isSystem = from === "system"
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [activeBranchIndex, setActiveBranchIndex] = React.useState(
    branches ? branches.length - 1 : 0 // Default to latest branch
  )

  // Update active branch when new branches are added
  React.useEffect(() => {
    if (branches && branches.length > 0) {
      setActiveBranchIndex(branches.length - 1) // Always show latest
    }
  }, [branches?.length])

  const handleBranchChange = (newIndex: number) => {
    setActiveBranchIndex(newIndex)
    onBranchChange?.(newIndex)
  }

  const formatTime = (date: Date | number) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // System message (date divider, etc.)
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {children}
        </div>
      </div>
    )
  }

  const activeBranch = branches?.[activeBranchIndex]
  const hasBranches = branches && branches.length > 1

  return (
    <div
      className={cn(
        "flex gap-2 group px-2 py-1",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      {...props}
    >
      {/* Avatar - only for non-user messages */}
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-auto">
          {senderAvatar ? (
            <AvatarImage src={senderAvatar} alt={senderName || "Sender"} />
          ) : null}
          <AvatarFallback className={cn("bg-gradient-to-br text-white", avatarGradient)}>
            {senderFallback || senderName?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <div className={cn("flex flex-col max-w-[75%] min-w-[100px]", isUser ? "items-end" : "items-start")}>
        {/* Sender name (for group/AI) */}
        {!isUser && senderName && (
          <span className="text-xs font-medium text-primary ml-1 mb-0.5">
            {senderName}
          </span>
        )}

        {/* Bubble content */}
        <div
          className={cn(
            "relative rounded-2xl px-3 py-2 shadow-sm",
            isUser
              ? "bg-[#005c4b] text-white rounded-br-md" // WhatsApp green for user
              : "bg-card text-foreground border border-border rounded-bl-md" // Light bubble for others
          )}
        >
          {/* Forwarded indicator */}
          {isForwarded && (
            <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
              <Forward className="h-3 w-3" />
              <span className="italic">Forwarded</span>
            </div>
          )}

          {/* Reply/Quote */}
          {replyTo && (
            <div className={cn(
              "border-l-2 pl-2 mb-2 py-1 rounded-r text-sm",
              isUser 
                ? "border-white/50 bg-white/10" 
                : "border-primary/50 bg-muted/50"
            )}>
              <div className="font-medium text-xs">{replyTo.senderName}</div>
              <div className="text-xs opacity-80 line-clamp-1">{replyTo.content}</div>
            </div>
          )}

          {/* Voice message */}
          {voiceMessage && (
            <div className="flex items-center gap-2 min-w-[200px]">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                  isUser ? "bg-white/20" : "bg-primary/10"
                )}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>
              
              {/* Waveform visualization */}
              <div className="flex-1 flex items-center gap-0.5 h-8">
                {(voiceMessage.waveform || Array(30).fill(0.3)).map((height, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-all",
                      isUser ? "bg-white/60" : "bg-primary/40"
                    )}
                    style={{ height: `${Math.max(height * 100, 10)}%` }}
                  />
                ))}
              </div>
              
              <span className="text-xs opacity-70 flex items-center gap-1">
                <Music className="h-3 w-3" />
                {formatDuration(voiceMessage.duration)}
              </span>
            </div>
          )}

          {/* Link preview */}
          {linkPreview && (
            <a
              href={linkPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "block rounded-lg overflow-hidden mb-2 hover:opacity-90 transition-opacity",
                isUser ? "bg-white/10" : "bg-muted/50 border border-border"
              )}
            >
              {linkPreview.image && (
                <img 
                  src={linkPreview.image} 
                  alt="" 
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-2">
                <div className="flex items-center gap-2">
                  {!linkPreview.image && (
                    <div className={cn(
                      "h-10 w-10 rounded flex items-center justify-center flex-shrink-0",
                      isUser ? "bg-white/20" : "bg-primary/10"
                    )}>
                      <LinkIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">{linkPreview.title}</div>
                    {linkPreview.description && (
                      <div className="text-xs opacity-70 line-clamp-2">{linkPreview.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-60 mt-1">
                  <ExternalLink className="h-3 w-3" />
                  {linkPreview.siteName || new URL(linkPreview.url).hostname}
                </div>
              </div>
            </a>
          )}

          {/* Main content or active branch content */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {hasBranches 
              ? (renderBranchContent 
                  ? renderBranchContent(activeBranch?.content || '') 
                  : activeBranch?.content)
              : children}
          </div>

          {/* Branch navigation */}
          {hasBranches && (
            <div className={cn(
              "flex items-center justify-center gap-2 mt-2 pt-2 border-t",
              isUser ? "border-white/20" : "border-border"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={activeBranchIndex === 0}
                onClick={() => handleBranchChange(activeBranchIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs opacity-70">
                {activeBranchIndex + 1} / {branches.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={activeBranchIndex === branches.length - 1}
                onClick={() => handleBranchChange(activeBranchIndex + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Timestamp and status */}
          <div className={cn(
            "flex items-center justify-end gap-1 mt-1",
            isUser ? "text-white/70" : "text-muted-foreground"
          )}>
            {timestamp && (
              <span className="text-[10px]">{formatTime(timestamp)}</span>
            )}
            {isUser && status && (
              <MessageStatusIcon status={status} />
            )}
          </div>
        </div>

        {/* Actions menu (on hover) */}
        {showActions && actions && actions.length > 0 && (
          <div className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity mt-1",
            isUser ? "mr-1" : "ml-1"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isUser ? "end" : "start"}>
                {actions.map((action, i) => (
                  <DropdownMenuItem key={i} onClick={action.onClick}>
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* User avatar (optional, usually not shown like WhatsApp) */}
      {isUser && senderAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-auto ring ring-1 ring-border">
          <AvatarImage src={senderAvatar} alt="You" />
          <AvatarFallback>{senderFallback || "Y"}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

// ============================================================================
// Message Status Icon
// ============================================================================

function MessageStatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case "sending":
      return <div className="h-3 w-3 rounded-full border border-current animate-pulse" />
    case "sent":
      return <Check className="h-3 w-3" />
    case "delivered":
      return <CheckCheck className="h-3 w-3" />
    case "read":
      return <CheckCheck className="h-3 w-3 text-blue-400" />
    case "error":
      return <span className="text-red-400 text-[10px]">!</span>
    default:
      return null
  }
}

// ============================================================================
// Chat Container (wrapper with scroll)
// ============================================================================

export interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChatContainer({ children, className, ...props }: ChatContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)

  const scrollToBottom = React.useCallback(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth"
    })
  }, [])

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
  }, [])

  // Auto scroll to bottom on new messages
  React.useEffect(() => {
    scrollToBottom()
  }, [children, scrollToBottom])

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "absolute inset-0 overflow-y-auto",
          "bg-[url('/chat-bg.png')] bg-repeat",
          className
        )}
        {...props}
      >
        <div className="py-4 space-y-1">
          {children}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ChevronLeft className="h-5 w-5 rotate-[-90deg]" />
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// Date Divider
// ============================================================================

export function DateDivider({ date }: { date: Date | string }) {
  const formatDate = (d: Date | string) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateObj.toDateString() === today.toDateString()) {
      return "Today"
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return dateObj.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <div className="flex justify-center my-4">
      <div className="bg-muted/80 text-muted-foreground text-xs px-3 py-1 rounded-lg shadow-sm">
        {formatDate(date)}
      </div>
    </div>
  )
}

// ============================================================================
// Typing Indicator
// ============================================================================

export function TypingIndicator({ 
  senderName,
  senderAvatar,
  senderFallback,
  avatarGradient
}: Pick<ChatBubbleProps, 'senderName' | 'senderAvatar' | 'senderFallback' | 'avatarGradient'>) {
  return (
    <div className="flex gap-2 px-2 py-1">
      <Avatar className="h-8 w-8 flex-shrink-0 mt-auto">
        {senderAvatar ? (
          <AvatarImage src={senderAvatar} alt={senderName || "Typing"} />
        ) : null}
        <AvatarFallback className={cn("bg-gradient-to-br text-white", avatarGradient || "from-blue-600 to-purple-600")}>
          {senderFallback || senderName?.charAt(0).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}

export default ChatBubble
