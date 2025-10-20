"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Archive, Search, ArchiveRestore, Trash2, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ArchivedViewProps {
  workspaceId?: Id<"workspaces"> | null
}

export function ArchivedView({ workspaceId }: ArchivedViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock archived conversations (replace with real Convex query)
  const archivedConversations = [
    {
      id: "1",
      type: "group",
      name: "Old Project Team",
      lastMessage: "Thanks everyone for the great work!",
      avatar: "👥",
      archivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      messageCount: 342,
    },
    {
      id: "2",
      type: "direct",
      name: "Former Colleague",
      lastMessage: "Good luck with your new role!",
      avatar: "👤",
      archivedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      messageCount: 89,
    },
    {
      id: "3",
      type: "group",
      name: "2023 Q4 Planning",
      lastMessage: "Meeting notes uploaded",
      avatar: "📋",
      archivedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      messageCount: 156,
    },
    {
      id: "4",
      type: "direct",
      name: "Client Project",
      lastMessage: "Project delivered successfully",
      avatar: "🎯",
      archivedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      messageCount: 423,
    },
  ]

  const filteredConversations = archivedConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUnarchive = (id: string) => {
    console.log("Unarchiving conversation:", id)
    // TODO: Implement unarchive mutation
    // await unarchive({ conversationId: id })
  }

  const handleDelete = (id: string) => {
    console.log("Deleting conversation:", id)
    // TODO: Implement delete mutation
    // await deleteConversation({ conversationId: id })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Archive className="h-6 w-6" />
              Archived Chats
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Conversations you've archived for later reference
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredConversations.length} {filteredConversations.length === 1 ? "chat" : "chats"}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archived chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Archived Chats List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">
                {searchQuery ? "No chats found" : "No archived chats"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Archived chats will appear here"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {conversation.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{conversation.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {conversation.messageCount} messages
                      </span>
                      <span>•</span>
                      <span>
                        Archived {formatDistanceToNow(conversation.archivedAt, { addSuffix: true })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchive(conversation.id)}
                        className="flex-1"
                      >
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Unarchive
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(conversation.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      {filteredConversations.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Unarchive chats to move them back to your active conversations
          </p>
        </div>
      )}
    </div>
  )
}
