/**
 * Message Area
 * 
 * Main message display and input area for channels and DMs.
 * Uses premium UI components with date separators and typing indicators.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Hash, ArrowDown } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Components
import { ChannelHeader } from "../components/ChannelHeader"
import { MessageItem } from "../components/MessageItem"
import { MessageComposer } from "../components/MessageComposer"

// Store
import {
  useCommunicationsStore,
  useSelectedChannel,
  useChannelMessages,
  useSelectedChannelId,
  useTypingIndicators,
  useRightPanelOpen,
  type Message,
} from "../shared"

interface MessageAreaProps {
  type: "channel" | "direct"
  className?: string
}

export function MessageArea({ type, className }: MessageAreaProps) {
  const selectedChannel = useSelectedChannel()
  const selectedChannelId = useSelectedChannelId()
  const messages = useChannelMessages(selectedChannelId || "")
  const typingUsers = useTypingIndicators(selectedChannelId || "")
  const rightPanelOpen = useRightPanelOpen()

  const setRightPanelContent = useCommunicationsStore(state => state.setRightPanelContent)
  const toggleRightPanel = useCommunicationsStore(state => state.toggleRightPanel)
  const addMessage = useCommunicationsStore(state => state.addMessage)
  const setActiveCall = useCommunicationsStore(state => state.setActiveCall)
  const setViewMode = useCommunicationsStore(state => state.setViewMode)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null)

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentGroup: { date: string; messages: Message[] } | null = null

    for (const message of messages) {
      const messageDate = new Date(message.createdAt).toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] }
        groups.push(currentGroup)
      }

      currentGroup.messages.push(message)
    }

    return groups
  }, [messages])

  // Check if consecutive messages should be grouped
  const shouldGroupMessage = (messages: Message[], index: number): boolean => {
    if (index === 0) return false
    const current = messages[index]
    const previous = messages[index - 1]

    if (current.senderId !== previous.senderId) return false

    const currentTime = new Date(current.createdAt).getTime()
    const previousTime = new Date(previous.createdAt).getTime()
    const diffMinutes = (currentTime - previousTime) / 60000

    return diffMinutes < 5
  }

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle scroll to show/hide jump button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setShowScrollButton(!isAtBottom)
  }

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle message send
  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!selectedChannelId) return

    const createdAt = new Date().toISOString()

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannelId,
      content,
      senderId: "user-current",
      senderType: "user",
      sender: {
        id: "user-current",
        name: "You",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      },
      type: "text",
      createdAt,
      timestamp: new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      attachments: attachments?.map((file, i) => ({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        type: (file.type.startsWith("image/") ? "image" :
          file.type.startsWith("video/") ? "video" :
            file.type.startsWith("audio/") ? "audio" : "file") as "image" | "video" | "audio" | "file",
        size: file.size,
      })) || [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      replyToId: replyingTo?.id,
      replyTo: replyingTo || undefined,
    }

    addMessage(selectedChannelId, newMessage)
    setReplyingTo(null)
  }

  // Start a call
  const handleStartCall = (isVideo = false) => {
    if (!selectedChannel) return

    setActiveCall({
      id: `call-${Date.now()}`,
      channelId: selectedChannel.id,
      workspaceId: "ws-default",
      type: isVideo ? "video" : "audio",
      status: "active",
      initiatorId: "user-current",
      title: `${selectedChannel.name} Call`,
      startedAt: new Date().toISOString(),
    })
    setViewMode("call")
  }

  if (!selectedChannel) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <Hash className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Channel Selected</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Select a {type === "channel" ? "channel" : "conversation"} from the sidebar to start chatting
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <ChannelHeader
        channel={selectedChannel}
        memberCount={5}
        pinnedCount={2}
        onMembersClick={() => {
          toggleRightPanel()
          setRightPanelContent("members")
        }}
        onStartCall={() => handleStartCall(false)}
        onStartVideoCall={() => handleStartCall(true)}
      />

      {/* Messages */}
      <ScrollArea
        className="flex-1 relative"
        onScroll={handleScroll}
        ref={scrollContainerRef as any}
      >
        <div className="min-h-full flex flex-col justify-end">
          {/* Welcome message for empty channels */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Hash className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-2xl mb-2">
                Welcome to #{selectedChannel.name}!
              </h3>
              <p className="text-muted-foreground max-w-md">
                This is the start of the #{selectedChannel.name} channel.
                {selectedChannel.description && ` ${selectedChannel.description}`}
              </p>
            </div>
          ) : (
            <div className="py-4">
              {groupedMessages.map((group, groupIndex) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-4 px-4 py-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.date}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Messages */}
                  {group.messages.map((message, index) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isGrouped={shouldGroupMessage(group.messages, index)}
                      onReply={setReplyingTo}
                      onReact={(msg, emoji) => {
                        // Handle reaction - would update store
                        console.log("React:", msg.id, emoji)
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Jump to present button */}
        {showScrollButton && (
          <Button
            size="sm"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-lg gap-1"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-3 w-3" />
            Jump to Present
          </Button>
        )}
      </ScrollArea>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {typingUsers.map(t => t.user?.name || "Someone").join(", ")}
              </span>
              {" "}is typing...
            </span>
          </span>
        </div>
      )}

      {/* Message Input */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <MessageComposer
          channelName={selectedChannel.name}
          channelId={selectedChannelId || ""}
          replyTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  )
}

export default MessageArea
