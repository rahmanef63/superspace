/**
 * New DM Dialog
 * 
 * Dialog component for starting a new direct message conversation.
 * Provides 3 tabs: Contacts, Members, and AI Chat.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import {
    Contact,
    Users,
    Bot,
    Search,
    X,
    MessageCircle,
    Sparkles,
    UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Communications store
import { useCommunicationsStore } from "../shared"
import { useDirectMessageMutations } from "../hooks/useDirectMessages"

// Contacts API (formerly Contacts)
import { useContactsApi } from "@/frontend/features/contact/api"

// Workspace context for members
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

// Helper function to get initials
const getInitials = (name?: string | null, email?: string | null): string => {
    if (name && name.trim()) {
        const words = name.trim().split(" ")
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase()
        }
        return words[0].substring(0, 2).toUpperCase()
    }
    if (email) {
        return email.substring(0, 2).toUpperCase()
    }
    return "U"
}

// AI Bot types for starting AI chat
const AI_BOTS = [
    {
        id: "assistant",
        name: "AI Assistant",
        description: "General purpose assistant",
        icon: "Bot",
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        id: "writer",
        name: "Writing Helper",
        description: "Help with writing and content",
        icon: "Sparkles",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        id: "coder",
        name: "Code Assistant",
        description: "Help with coding tasks",
        icon: "Bot",
        gradient: "from-green-500 to-emerald-500"
    },
]

interface NewDMDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NewDMDialog({ open, onOpenChange }: NewDMDialogProps) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("contacts")

    // Store actions
    const addDirectConversation = useCommunicationsStore(state => state.addDirectConversation)
    const selectDirectConversation = useCommunicationsStore(state => state.selectDirectConversation)
    const setViewMode = useCommunicationsStore(state => state.setViewMode)

    // Backend mutations
    const { createConversation } = useDirectMessageMutations()
    const [isCreating, setIsCreating] = React.useState(false)

    // Get contacts (Contacts)
    const { Contacts } = useContactsApi()

    // Get workspace members
    const { workspaceId } = useWorkspaceContext()
    const workspaceMembers = useQuery(
        api.workspace.workspaces.getWorkspaceMembers,
        workspaceId ? { workspaceId } : "skip"
    )

    // Filter contacts by search
    const filteredContacts = React.useMemo(() => {
        if (!Contacts) return []
        if (!searchQuery.trim()) return Contacts
        const query = searchQuery.toLowerCase()
        return Contacts.filter((f: any) =>
            f.Contact?.name?.toLowerCase().includes(query) ||
            f.Contact?.email?.toLowerCase().includes(query)
        )
    }, [Contacts, searchQuery])

    // Filter members by search
    const filteredMembers = React.useMemo(() => {
        if (!workspaceMembers) return []
        if (!searchQuery.trim()) return workspaceMembers
        const query = searchQuery.toLowerCase()
        return (workspaceMembers as any[]).filter(m =>
            m.name?.toLowerCase().includes(query) ||
            m.email?.toLowerCase().includes(query)
        )
    }, [workspaceMembers, searchQuery])

    // Filter AI bots by search
    const filteredBots = React.useMemo(() => {
        if (!searchQuery.trim()) return AI_BOTS
        const query = searchQuery.toLowerCase()
        return AI_BOTS.filter(b =>
            b.name.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query)
        )
    }, [searchQuery])

    const handleSelectContact = async (contact: any) => {
        if (isCreating) return
        setIsCreating(true)

        try {
            const participantId = contact.Contact?._id || contact._id

            // Call backend to create or get existing conversation
            const conversationId = await createConversation({
                participantIds: [participantId as Id<"users">],
                workspaceId: workspaceId as Id<"workspaces"> | undefined,
            })

            if (conversationId) {
                selectDirectConversation(String(conversationId))
                setViewMode("dm")
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create conversation:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleSelectMember = async (member: any) => {
        if (isCreating) return
        setIsCreating(true)

        try {
            // Call backend to create or get existing conversation
            const conversationId = await createConversation({
                participantIds: [member.userId as Id<"users">],
                workspaceId: workspaceId as Id<"workspaces"> | undefined,
            })

            if (conversationId) {
                selectDirectConversation(String(conversationId))
                setViewMode("dm")
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create conversation:", error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleSelectAI = (bot: typeof AI_BOTS[0]) => {
        const botId = `ai-${bot.id}`
        // Create AI DM conversation
        const newConversation = {
            id: `dm-ai-${bot.id}-${Date.now()}`,
            type: "direct" as const,
            isAI: true,
            aiModel: bot.id,
            participants: [
                {
                    id: botId,
                    conversationId: `dm-ai-${bot.id}-${Date.now()}`,
                    userId: botId,
                    user: {
                        id: botId,
                        name: bot.name,
                        avatar: undefined,
                        status: "online" as const,
                    },
                    joinedAt: new Date().toISOString(),
                    isBot: true,
                }
            ],
            participantIds: [botId],
            createdBy: "current-user",
            name: bot.name,
            createdAt: new Date().toISOString(),
        }

        addDirectConversation(newConversation)
        selectDirectConversation(newConversation.id)
        setViewMode("dm")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        New Message
                    </DialogTitle>
                    <DialogDescription>
                        Start a conversation with a contact, team member, or AI assistant
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="px-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
                        <TabsTrigger
                            value="contacts"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <Contact className="h-4 w-4 mr-2" />
                            Contacts
                            {Contacts?.length ? (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                                    {Contacts.length}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Members
                            {workspaceMembers?.length ? (
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                                    {(workspaceMembers as any[]).length}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="ai"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                        >
                            <Bot className="h-4 w-4 mr-2" />
                            AI Chat
                        </TabsTrigger>
                    </TabsList>

                    {/* Contacts Tab */}
                    <TabsContent value="contacts" className="m-0 p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-1">
                                {filteredContacts.length === 0 ? (
                                    <EmptyState
                                        icon={Contact}
                                        title="No contacts found"
                                        description={searchQuery ? "Try a different search" : "Add contacts to message them"}
                                    />
                                ) : (
                                    filteredContacts.map((contact: any) => (
                                        <PersonItem
                                            key={contact._id}
                                            name={contact.Contact?.name}
                                            email={contact.Contact?.email}
                                            image={contact.Contact?.image}
                                            onClick={() => handleSelectContact(contact)}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="m-0 p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-1">
                                {filteredMembers.length === 0 ? (
                                    <EmptyState
                                        icon={Users}
                                        title="No members found"
                                        description={searchQuery ? "Try a different search" : "No workspace members available"}
                                    />
                                ) : (
                                    filteredMembers.map((member: any) => (
                                        <PersonItem
                                            key={member.userId}
                                            name={member.name}
                                            email={member.email}
                                            image={member.image}
                                            badge={member.role?.name}
                                            onClick={() => handleSelectMember(member)}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* AI Chat Tab */}
                    <TabsContent value="ai" className="m-0 p-0">
                        <ScrollArea className="h-[300px]">
                            <div className="p-2 space-y-1">
                                {filteredBots.length === 0 ? (
                                    <EmptyState
                                        icon={Bot}
                                        title="No AI assistants found"
                                        description="Try a different search"
                                    />
                                ) : (
                                    filteredBots.map((bot) => (
                                        <AIBotItem
                                            key={bot.id}
                                            bot={bot}
                                            onClick={() => handleSelectAI(bot)}
                                        />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

// ============================================================================
// Sub-components
// ============================================================================

interface PersonItemProps {
    name?: string | null
    email?: string | null
    image?: string | null
    badge?: string
    onClick: () => void
}

function PersonItem({ name, email, image, badge, onClick }: PersonItemProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
        >
            <Avatar className="h-10 w-10">
                <AvatarImage src={image || undefined} />
                <AvatarFallback>{getInitials(name, email)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{name || getInitials(undefined, email)}</span>
                    {badge && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {badge}
                        </Badge>
                    )}
                </div>
                {email && (
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                )}
            </div>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </button>
    )
}

interface AIBotItemProps {
    bot: typeof AI_BOTS[0]
    onClick: () => void
}

function AIBotItem({ bot, onClick }: AIBotItemProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-muted/50 transition-colors text-left"
        >
            <div className={cn(
                "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center",
                bot.gradient
            )}>
                {bot.icon === "Sparkles" ? (
                    <Sparkles className="h-5 w-5 text-white" />
                ) : (
                    <Bot className="h-5 w-5 text-white" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium">{bot.name}</div>
                <p className="text-xs text-muted-foreground">{bot.description}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">AI</Badge>
        </button>
    )
}

interface EmptyStateProps {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    )
}

export default NewDMDialog
