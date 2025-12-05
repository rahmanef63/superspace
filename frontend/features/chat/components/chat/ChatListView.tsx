"use client"

import { useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatListItem } from "./ChatListItem"
import { SearchBar } from "../ui/SearchBar"
import { useWhatsAppStore } from "../../shared/hooks"
import { PLACEHOLDERS } from "../../shared/constants"
import type { Chat } from "@/frontend/features/chat/shared/types/core"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { CreateConversationModal } from "./CreateConversationModal"
import { EditChatDialog, LeaveChatDialog, DeleteChatDialog } from "./ChatDialogs"
import { GlobalModeToggle } from "@/frontend/shared/ui/components/controls"
import { toast } from "sonner"

type ChatListViewVariant = "standalone" | "layout"

interface ChatListViewProps {
  showArchived?: boolean
  variant?: ChatListViewVariant
}

export function ChatListView({ showArchived = false, variant = "standalone" }: ChatListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [openNewChat, setOpenNewChat] = useState(false)
  const isMobile = useIsMobile()
  
  // Use individual selectors to prevent unnecessary re-renders
  const chats = useWhatsAppStore((s) => s.chats)
  const selectedChatId = useWhatsAppStore((s) => s.selectedChatId)
  const setSelectedChat = useWhatsAppStore((s) => s.setSelectedChat)
  const globalMode = useWhatsAppStore((s) => s.globalMode)
  const setGlobalMode = useWhatsAppStore((s) => s.setGlobalMode)
  const loadChats = useWhatsAppStore((s) => s.loadChats)
  const loadMessages = useWhatsAppStore((s) => s.loadMessages)
  
  const { workspaceId } = useWorkspaceContext()
  const friends = useQuery(api.user.friends.getUserFriends) as any[] | undefined
  const me = useQuery(api.auth.auth.loggedInUser) as any
  
  // Mutations for CRUD operations
  const createConv = useMutation((api as any)["features/chat/conversations"].createConversation)
  const createGlobalDirect = useMutation((api as any)["features/chat/conversations"].createOrGetDirectGlobal)
  const updateConversation = useMutation((api as any)["features/chat/conversations"].updateConversation)
  const leaveConversation = useMutation((api as any)["features/chat/conversations"].leaveConversation)
  
  // CRUD Dialog states
  const [editingChat, setEditingChat] = useState<Chat | null>(null)
  const [leavingChat, setLeavingChat] = useState<Chat | null>(null)
  const [deletingChat, setDeletingChat] = useState<Chat | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Filter chats
  const filteredChats = chats.filter((chat: Chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    if (showArchived) {
      return matchesSearch && chat.isArchived
    }
    return matchesSearch && !chat.isArchived
  })
  
  // CRUD Handlers
  const handleEditChat = useCallback((chat: Chat) => {
    setEditingChat(chat)
  }, [])
  
  const handleSaveChat = useCallback(async (chatId: string, data: { name?: string; description?: string }) => {
    setIsUpdating(true)
    try {
      await updateConversation({
        conversationId: chatId as Id<"conversations">,
        name: data.name,
        metadata: data.description ? { description: data.description } : undefined,
      })
      await loadChats()
      toast.success("Chat updated successfully")
    } catch (e) {
      console.error("Failed to update chat:", e)
      toast.error((e as any)?.message || "Failed to update chat")
    } finally {
      setIsUpdating(false)
    }
  }, [updateConversation, loadChats])
  
  const handlePinChat = useCallback(async (chatId: string, isPinned: boolean) => {
    try {
      await updateConversation({
        conversationId: chatId as Id<"conversations">,
        metadata: { isPinned },
      })
      await loadChats()
      toast.success(isPinned ? "Chat pinned" : "Chat unpinned")
    } catch (e) {
      console.error("Failed to pin/unpin chat:", e)
      toast.error((e as any)?.message || "Failed to update chat")
    }
  }, [updateConversation, loadChats])
  
  const handleMuteChat = useCallback(async (chatId: string, isMuted: boolean) => {
    try {
      await updateConversation({
        conversationId: chatId as Id<"conversations">,
        metadata: { isMuted },
      })
      await loadChats()
      toast.success(isMuted ? "Notifications muted" : "Notifications unmuted")
    } catch (e) {
      console.error("Failed to mute/unmute chat:", e)
      toast.error((e as any)?.message || "Failed to update chat")
    }
  }, [updateConversation, loadChats])
  
  const handleFavoriteChat = useCallback(async (chatId: string, isFavorite: boolean) => {
    try {
      await updateConversation({
        conversationId: chatId as Id<"conversations">,
        metadata: { isFavorite },
      })
      await loadChats()
      toast.success(isFavorite ? "Added to favorites" : "Removed from favorites")
    } catch (e) {
      console.error("Failed to favorite chat:", e)
      toast.error((e as any)?.message || "Failed to update chat")
    }
  }, [updateConversation, loadChats])
  
  const handleArchiveChat = useCallback(async (chatId: string, isArchived: boolean) => {
    try {
      await updateConversation({
        conversationId: chatId as Id<"conversations">,
        metadata: { isArchived },
      })
      await loadChats()
      toast.success(isArchived ? "Chat archived" : "Chat unarchived")
    } catch (e) {
      console.error("Failed to archive chat:", e)
      toast.error((e as any)?.message || "Failed to update chat")
    }
  }, [updateConversation, loadChats])
  
  const handleLeaveChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setLeavingChat(chat)
    }
  }, [chats])
  
  const handleConfirmLeave = useCallback(async (chatId: string) => {
    setIsUpdating(true)
    try {
      await leaveConversation({ conversationId: chatId as Id<"conversations"> })
      if (selectedChatId === chatId) {
        setSelectedChat(null)
      }
      await loadChats()
      toast.success("Left conversation")
    } catch (e) {
      console.error("Failed to leave conversation:", e)
      toast.error((e as any)?.message || "Failed to leave conversation")
    } finally {
      setIsUpdating(false)
    }
  }, [leaveConversation, selectedChatId, setSelectedChat, loadChats])
  
  // Note: Delete functionality would require a backend mutation to fully delete
  // For now, we use "leave" as the primary removal action
  const handleDeleteChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setDeletingChat(chat)
    }
  }, [chats])
  
  const handleConfirmDelete = useCallback(async (chatId: string) => {
    // For now, delete = leave (full delete requires admin mutation)
    await handleConfirmLeave(chatId)
    setDeletingChat(null)
  }, [handleConfirmLeave])
  
  const containerClasses = cn(
    "flex h-full flex-col",
    variant === "standalone"
      ? "w-full border-r border-border bg-card lg:w-[320px]"
      : "bg-background/60",
  )

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{showArchived ? "Archived" : "Chats"}</h1>
          </div>
          {!showArchived && (
            <div className="flex items-center gap-3">
              <GlobalModeToggle
                isGlobal={Boolean(globalMode)}
                onToggle={(v) => {
                  setGlobalMode(Boolean(v))
                  loadChats()
                }}
                label="Global"
                size="sm"
              />
              <Button
                onClick={() => setOpenNewChat(true)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
        <SearchBar
          placeholder={showArchived ? "Search archived chats" : PLACEHOLDERS.SEARCH_CHATS}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No chats found" : showArchived ? "No archived chats" : "No chats yet"}
          </div>
        ) : (
          <div>
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                {...chat}
                isActive={chat.id === selectedChatId}
                onClick={() => {
                  setSelectedChat(chat.id)
                  // Prefetch messages for selected chat
                  loadMessages?.(chat.id)
                }}
                // CRUD callbacks
                onEdit={handleEditChat}
                onPin={handlePinChat}
                onMute={handleMuteChat}
                onFavorite={handleFavoriteChat}
                onArchive={handleArchiveChat}
                onLeave={handleLeaveChat}
              />
            ))}
          </div>
        )}
      </div>

      {/* CRUD Dialogs */}
      <EditChatDialog
        chat={editingChat}
        isOpen={!!editingChat}
        onClose={() => setEditingChat(null)}
        onSave={handleSaveChat}
        isLoading={isUpdating}
      />
      <LeaveChatDialog
        chat={leavingChat}
        isOpen={!!leavingChat}
        onClose={() => setLeavingChat(null)}
        onConfirm={handleConfirmLeave}
        isLoading={isUpdating}
      />
      <DeleteChatDialog
        chat={deletingChat}
        isOpen={!!deletingChat}
        onClose={() => setDeletingChat(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isUpdating}
      />

      {/* New Chat Modal - lists Friends */}
      {!showArchived && (
        <CreateConversationModal
          isOpen={openNewChat}
          onClose={() => setOpenNewChat(false)}
          workspaceId={(workspaceId as Id<"workspaces">) || ("000000000000000000000000" as unknown as Id<"workspaces">)}
          friends={(() => {
            const list = (friends as any[]) || []
            const meId = String((me as any)?._id || "")
            return list.map((row: any) => {
              const u = (row && (row.friend || row)) || {}
              // Resolve the friend's user id; avoid using friendship._id
              const candidateUserId = u?._id || ((row?.user1Id && String(row.user1Id) !== meId) ? row.user1Id : row?.user2Id)
              const id = candidateUserId
              const nameRaw = u.name || u.fullName || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName) || ""
              const email = u.email || u.emailAddress || u.primaryEmail || (u.emailAddresses?.[0]?.emailAddress) || ""
              const safeName = String(nameRaw || (email ? String(email).split('@')[0] : "")).trim() || "Unknown"
              const imageUrl = u.imageUrl || u.image || u.avatar || u.profileImageUrl || u.photoUrl || undefined
              return { _id: id, name: safeName, email, imageUrl }
            })
          })()}
          onCreateDirectChat={async (friendId: Id<"users">) => {
            try {
              let convId: Id<"conversations">
              if (globalMode) {
                convId = await createGlobalDirect({ otherUserId: friendId })
              } else if (workspaceId) {
                convId = await createConv({
                  workspaceId: workspaceId as Id<"workspaces">,
                  type: "personal",
                  participantIds: [friendId],
                })
              } else {
                throw new Error("Workspace belum dipilih")
              }
              await loadChats()
              setSelectedChat(String(convId))
              toast.success("Percakapan langsung berhasil dibuat")
            } catch (e) {
              console.error("Failed to create conversation", e)
              const msg = (e as any)?.message || "Gagal membuat percakapan langsung"
              toast.error(msg)
            }
          }}
          onCreateGroupChat={async (name: string, participantIds: Id<"users">[]) => {
            try {
              if (!workspaceId) throw new Error("Workspace belum dipilih")
              const convId = await createConv({
                workspaceId: workspaceId as Id<"workspaces">,
                type: "group",
                name,
                participantIds,
              })
              await loadChats()
              setSelectedChat(String(convId))
              toast.success("Grup berhasil dibuat")
            } catch (e) {
              console.error("Failed to create group", e)
              const msg = (e as any)?.message || "Gagal membuat grup"
              toast.error(msg)
            }
          }}
        />
      )}
    </div>
  )
}
