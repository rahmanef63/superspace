"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChatListItem } from "./ChatListItem"
import { SearchBar } from "../ui/SearchBar"
import { useWhatsAppStore } from "../../shared/hooks"
import { PLACEHOLDERS } from "../../shared/constants"
import type { Chat } from "../../shared/types"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/app/dashboard/WorkspaceProvider"
import { CreateConversationModal } from "./CreateConversationModal" // Updated import path to use local CreateConversationModal
import { Switch } from "@/components/ui/switch"
interface ChatListViewProps {
  showArchived?: boolean
}
export function ChatListView({ showArchived = false }: ChatListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [openNewChat, setOpenNewChat] = useState(false)
  const isMobile = useIsMobile()
  const { chats, selectedChatId, setSelectedChat, globalMode, setGlobalMode, loadChats } = useWhatsAppStore()
  const { workspaceId } = useWorkspaceContext()
  const friends = useQuery(api.user.friends.getUserFriends) as any[] | undefined
  const createConv = useMutation(api.menu.chat.conversations.createConversation as any)
  const createGlobalDirect = useMutation(api.menu.chat.conversations.createOrGetDirectGlobal as any)
  const filteredChats = chats.filter((chat: Chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    if (showArchived) {
      return matchesSearch && chat.isArchived
    }
    return matchesSearch && !chat.isArchived
  })
  return (
    <div className="w-full h-full lg:w-[320px] border-r border-border bg-card flex flex-col">
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
                onClick={() => setSelectedChat(chat.id)}
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
          friends={(friends as any[]) || []}
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
                throw new Error("Workspace not selected")
              }
              await loadChats()
              setSelectedChat(String(convId))
            } catch (e) {
              console.error("Failed to create conversation", e)
            }
          }}
          onCreateGroupChat={async (name: string, participantIds: Id<"users">[]) => {
            try {
              if (!workspaceId) throw new Error("Workspace not selected")
              const convId = await createConv({
                workspaceId: workspaceId as Id<"workspaces">,
                type: "group",
                name,
                participantIds,
              })
              await loadChats()
              setSelectedChat(String(convId))
            } catch (e) {
              console.error("Failed to create group", e)
            }
          }}
        />
      )}
    </div>
  )
}
