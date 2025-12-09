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

interface Contact {
  _id: Id<"users">
  name: string
  email: string
  imageUrl?: string
}

interface CreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: Id<"workspaces">
  Contacts?: Contact[]
  onCreateDirectChat: (ContactId: Id<"users">, contactInfo?: { name?: string; imageUrl?: string }) => Promise<void>
  onCreateGroupChat: (name: string, participantIds: Id<"users">[]) => Promise<void>
}

export function CreateConversationModal({
  isOpen,
  onClose,
  workspaceId,
  Contacts,
  onCreateDirectChat,
  onCreateGroupChat,
}: CreateConversationModalProps) {
  const safeContacts = (Contacts ?? []).filter(Contact => Contact && Contact._id)
  const [groupName, setGroupName] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<Id<"users">[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateDirect = async (contact: Contact) => {
    setIsCreating(true)
    try {
      await onCreateDirectChat(contact._id, { name: contact.name, imageUrl: contact.imageUrl })
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
    if (!groupName.trim() || selectedContacts.length === 0) {
      toast.error("Nama grup dan anggota wajib diisi")
      return
    }

    setIsCreating(true)
    try {
      await onCreateGroupChat(groupName.trim(), selectedContacts)
      setGroupName("")
      setSelectedContacts([])
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

  const toggleContactSelection = (ContactId: Id<"users">) => {
    setSelectedContacts((prev) => (prev.includes(ContactId) ? prev.filter((id) => id !== ContactId) : [...prev, ContactId]))
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
            <div className="text-sm text-muted-foreground">Select a Contact to start a direct conversation</div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {safeContacts.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No Contacts available</div>
              ) : (
                safeContacts.map((Contact, index) => (
                  <div
                    key={`direct-${Contact._id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleCreateDirect(Contact)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={Contact.imageUrl || "/placeholder.svg"} />
                      <AvatarFallback>{((Contact.name || Contact.email || "").charAt(0).toUpperCase() || "?")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{Contact.name || Contact.email || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground">{Contact.email || ""}</div>
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
              <label className="text-sm font-medium">Select Members ({selectedContacts.length} selected)</label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {safeContacts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No Contacts available</div>
                ) : (
                  safeContacts.map((Contact, index) => (
                    <div key={`group-${Contact._id}-${index}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <Checkbox
                        checked={selectedContacts.includes(Contact._id)}
                        onCheckedChange={() => toggleContactSelection(Contact._id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={Contact.imageUrl || "/placeholder.svg"} />
                        <AvatarFallback>{((Contact.name || Contact.email || "").charAt(0).toUpperCase() || "?")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{Contact.name || Contact.email || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{Contact.email || ""}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedContacts.length === 0 || isCreating}
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
