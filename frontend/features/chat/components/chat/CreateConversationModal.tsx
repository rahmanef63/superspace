"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageCircle } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

interface Friend {
  _id: Id<"users">
  name: string
  email: string
  imageUrl?: string
}

interface CreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: Id<"workspaces">
  friends?: Friend[]
  onCreateDirectChat: (friendId: Id<"users">) => Promise<void>
  onCreateGroupChat: (name: string, participantIds: Id<"users">[]) => Promise<void>
}

export function CreateConversationModal({
  isOpen,
  onClose,
  workspaceId,
  friends,
  onCreateDirectChat,
  onCreateGroupChat,
}: CreateConversationModalProps) {
  const safeFriends = (friends ?? []).filter(friend => friend && friend._id)
  const [groupName, setGroupName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState<Id<"users">[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateDirect = async (friendId: Id<"users">) => {
    setIsCreating(true)
    try {
      await onCreateDirectChat(friendId)
      onClose()
      toast.success("Percakapan langsung berhasil dibuat")
    } catch (error) {
      console.error("Failed to create direct chat:", error)
      const msg = (error as any)?.message || "Gagal membuat percakapan langsung"
      toast.error(msg)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      toast.error("Nama grup dan anggota wajib diisi")
      return
    }

    setIsCreating(true)
    try {
      await onCreateGroupChat(groupName.trim(), selectedFriends)
      setGroupName("")
      setSelectedFriends([])
      onClose()
      toast.success("Grup berhasil dibuat")
    } catch (error) {
      console.error("Failed to create group chat:", error)
      const msg = (error as any)?.message || "Gagal membuat grup"
      toast.error(msg)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleFriendSelection = (friendId: Id<"users">) => {
    setSelectedFriends((prev) => (prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Direct Chat
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <div className="text-sm text-muted-foreground">Select a friend to start a direct conversation</div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {safeFriends.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No friends available</div>
              ) : (
                safeFriends.map((friend, index) => (
                  <div
                    key={`direct-${friend._id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleCreateDirect(friend._id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.imageUrl || "/placeholder.svg"} />
                      <AvatarFallback>{((friend.name || friend.email || "").charAt(0).toUpperCase() || "?")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{friend.name || friend.email || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground">{friend.email || ""}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input placeholder="Enter group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Members ({selectedFriends.length} selected)</label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {safeFriends.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No friends available</div>
                ) : (
                  safeFriends.map((friend, index) => (
                    <div key={`group-${friend._id}-${index}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <Checkbox
                        checked={selectedFriends.includes(friend._id)}
                        onCheckedChange={() => toggleFriendSelection(friend._id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={friend.imageUrl || "/placeholder.svg"} />
                        <AvatarFallback>{((friend.name || friend.email || "").charAt(0).toUpperCase() || "?")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{friend.name || friend.email || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{friend.email || ""}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedFriends.length === 0 || isCreating}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
