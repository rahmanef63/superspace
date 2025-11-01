"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatListItem } from "./ChatListItem"
import { SearchBar } from "../ui/SearchBar"
import { useWhatsAppStore } from "../../shared/hooks"
import { PLACEHOLDERS } from "../../shared/constants"
import type { Chat } from "@/frontend/shared/communications/chat/types/chat"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { CreateConversationModal } from "./CreateConversationModal" // Updated import path to use local CreateConversationModal
import { Switch } from "@/components/ui/switch"
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
  const { chats, selectedChatId, setSelectedChat, globalMode, setGlobalMode, loadChats, loadMessages } = useWhatsAppStore()
  const { workspaceId } = useWorkspaceContext()
  const friends = useQuery(api.user.friends.getUserFriends) as any[] | undefined
  const me = useQuery(api.auth.auth.loggedInUser) as any
  const createConv = useMutation((api as any)["features/chat/conversations"].createConversation)
  const createGlobalDirect = useMutation((api as any)["features/chat/conversations"].createOrGetDirectGlobal)
  const filteredChats = chats.filter((chat: Chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    if (showArchived) {
      return matchesSearch && chat.isArchived
    }
    return matchesSearch && !chat.isArchived
  })
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
            {isMobile && <SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
            <h1 className="text-xl font-semibold text-foreground">{showArchived ? "Archived" : "Chats"}</h1>
          </div>
          {!showArchived && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Global</span>
                <Switch
                  checked={Boolean(globalMode)}
                  onCheckedChange={(v) => {
                    setGlobalMode(Boolean(v))
                    loadChats()
                  }}
                />
              </div>
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
                />
              ))}
          </div>
        )}
      </div>

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
