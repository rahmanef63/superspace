/**
 * Communication Sidebar
 * 
 * Unified sidebar component used for both channels and DMs.
 * Follows DRY principle - same layout structure for both views.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import {
    Hash,
    Volume2,
    Video,
    Megaphone,
    MessageSquare,
    Plus,
    ChevronDown,
    ChevronRight,
    Lock,
    User,
    MessageCircle,
    Users,
    Settings,
    Bell,
    Search,
    ArrowLeft,
    Eye,
    EyeOff,
    Building2,
    Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

// UI Components
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"

// Components
import { UserStatusPanel } from "../components/UserStatusPanel"
import { VoiceChannelMini } from "../components/VoiceChannelMini"
import { NewDMDialog } from "../components/NewDMDialog"

// Workspace Provider for real workspace data
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

// Store
import {
    useCommunicationsStore,
    useCategories,
    useChannels,
    useSelectedChannelId,
    useDirectConversations,
    useSelectedDirectId,
    useViewMode,
    useCommunicationWorkspaceId,
    useIsPrivateMode,
    useIsPrivateDMs,
    type Channel,
    type ChannelCategory,
    type DirectConversation,
} from "../shared"

// Channel type icons
const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    text: Hash,
    voice: Volume2,
    video: Video,
    announcement: Megaphone,
    forum: MessageSquare,
    stage: Volume2,
    huddle: Volume2,
}

// Gradient colors for workspace icons
const WORKSPACE_COLORS = [
    "from-primary/80 to-primary",
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-cyan-500 to-cyan-600",
    "from-amber-500 to-amber-600",
]

// Mock voice users
interface VoiceUser {
    id: string
    name: string
    avatar?: string
    isMuted?: boolean
    isSpeaking?: boolean
}

interface CommunicationSidebarProps {
    mode: "channels" | "dms"
    workspaceId?: string
    workspaceName?: string
    className?: string
}

export function CommunicationSidebar({
    mode,
    workspaceId,
    workspaceName = "Workspace",
    className
}: CommunicationSidebarProps) {
    const categories = useCategories()
    const channels = useChannels()
    const selectedChannelId = useSelectedChannelId()
    const conversations = useDirectConversations()
    const selectedDirectId = useSelectedDirectId()
    const viewMode = useViewMode()
    const communicationWorkspaceId = useCommunicationWorkspaceId()
    const isPrivateMode = useIsPrivateMode()
    const isPrivateDMs = useIsPrivateDMs()

    const selectChannel = useCommunicationsStore(state => state.selectChannel)
    const selectDirectConversation = useCommunicationsStore(state => state.selectDirectConversation)
    const openModal = useCommunicationsStore(state => state.openModal)
    const setViewMode = useCommunicationsStore(state => state.setViewMode)
    const setActiveCall = useCommunicationsStore(state => state.setActiveCall)
    const setCommunicationWorkspace = useCommunicationsStore(state => state.setCommunicationWorkspace)
    const togglePrivateMode = useCommunicationsStore(state => state.togglePrivateMode)
    const togglePrivateDMs = useCommunicationsStore(state => state.togglePrivateDMs)

    // Track collapsed categories
    const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = React.useState("")
    const [showNewDMDialog, setShowNewDMDialog] = React.useState(false)

    // Mock voice users
    const [voiceUsers] = React.useState<Record<string, VoiceUser[]>>({})

    // Real workspace data from WorkspaceProvider
    const {
        workspaces: allWorkspaces,
        currentWorkspace: globalCurrentWorkspace,
        isLoading: workspacesLoading
    } = useWorkspaceContext()

    // Get workspace color by index for consistent colors
    const getWorkspaceColor = (index: number) => WORKSPACE_COLORS[index % WORKSPACE_COLORS.length]

    // Find current communication workspace from real workspaces
    const currentWorkspace = React.useMemo(() => {
        if (!allWorkspaces?.length) return null

        // Find by communicationWorkspaceId if set
        const found = allWorkspaces.find(ws => String(ws._id) === communicationWorkspaceId)
        if (found) return found

        // Fallback to global current workspace or first workspace
        return globalCurrentWorkspace || allWorkspaces[0]
    }, [allWorkspaces, communicationWorkspaceId, globalCurrentWorkspace])

    // Auto-sync communication workspace from global context when not set
    React.useEffect(() => {
        if (!communicationWorkspaceId && globalCurrentWorkspace?._id) {
            setCommunicationWorkspace(String(globalCurrentWorkspace._id))
        }
    }, [communicationWorkspaceId, globalCurrentWorkspace, setCommunicationWorkspace])

    // Get display info for current workspace
    const currentWorkspaceDisplay = React.useMemo(() => {
        if (!currentWorkspace) {
            return { name: "No Workspace", icon: "?", color: WORKSPACE_COLORS[0] }
        }
        const index = allWorkspaces?.findIndex(ws => ws._id === currentWorkspace._id) ?? 0
        return {
            name: currentWorkspace.name || "Workspace",
            icon: (currentWorkspace.name || "W").charAt(0).toUpperCase(),
            color: getWorkspaceColor(index),
        }
    }, [currentWorkspace, allWorkspaces])

    // Group channels by category
    const channelsByCategory = React.useMemo(() => {
        const grouped: Record<string, Channel[]> = { uncategorized: [] }

        for (const category of categories) {
            grouped[category.id] = []
        }

        for (const channel of channels) {
            if (channel.categoryId && grouped[channel.categoryId]) {
                grouped[channel.categoryId].push(channel)
            } else {
                grouped.uncategorized.push(channel)
            }
        }

        return grouped
    }, [categories, channels])

    // Filter by search
    const filteredChannels = React.useMemo(() => {
        if (!searchQuery.trim()) return null
        const query = searchQuery.toLowerCase()
        return channels.filter(ch => ch.name.toLowerCase().includes(query))
    }, [channels, searchQuery])

    const filteredConversations = React.useMemo(() => {
        if (!searchQuery.trim()) return null
        const query = searchQuery.toLowerCase()
        return conversations.filter(c => c.name?.toLowerCase().includes(query))
    }, [conversations, searchQuery])

    const toggleCategory = (categoryId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev)
            if (next.has(categoryId)) {
                next.delete(categoryId)
            } else {
                next.add(categoryId)
            }
            return next
        })
    }

    const handleVoiceChannelClick = (channel: Channel) => {
        if (channel.type === "voice" || channel.type === "video") {
            setActiveCall({
                id: `call-${channel.id}`,
                channelId: channel.id,
                workspaceId: workspaceId || "ws-default",
                type: channel.type === "video" ? "video" : "audio",
                status: "active",
                initiatorId: "user-current",
                title: channel.name,
                startedAt: new Date().toISOString(),
            })
            setViewMode("call")
        }
        selectChannel(channel.id)
    }

    const handleBack = () => {
        setViewMode("channel")
    }

    return (
        <div className={cn("flex flex-col h-full bg-muted/20 border-r", className)}>
            {/* Header */}
            <div className="shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 border-b">
                    {/* Back button for DMs */}
                    {mode === "dms" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Workspace Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 flex-1 min-w-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors text-left">
                                <div className={cn(
                                    "w-8 h-8 rounded-md bg-gradient-to-br flex items-center justify-center text-white font-semibold text-xs shrink-0",
                                    currentWorkspaceDisplay.color
                                )}>
                                    {currentWorkspaceDisplay.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-semibold text-sm truncate">{currentWorkspaceDisplay.name}</h2>
                                    <p className="text-[10px] text-muted-foreground">
                                        {mode === "dms" ? "Direct Messages" : "Channels"}
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                            <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={communicationWorkspaceId}
                                onValueChange={setCommunicationWorkspace}
                            >
                                {workspacesLoading ? (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        Loading workspaces...
                                    </div>
                                ) : allWorkspaces?.length ? (
                                    allWorkspaces.map((ws, index) => (
                                        <DropdownMenuRadioItem
                                            key={String(ws._id)}
                                            value={String(ws._id)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-6 h-6 rounded bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-semibold",
                                                    getWorkspaceColor(index)
                                                )}>
                                                    {(ws.name || "W").charAt(0).toUpperCase()}
                                                </div>
                                                <span>{ws.name || "Unnamed Workspace"}</span>
                                            </div>
                                        </DropdownMenuRadioItem>
                                    ))
                                ) : (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        No workspaces found
                                    </div>
                                )}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openModal("invite")}>
                                <Users className="h-4 w-4 mr-2" />
                                Invite People
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Workspace Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Quick actions + Privacy toggles */}
                <div className="px-3 py-2 space-y-2">
                    {/* View switch buttons */}
                    <div className="flex gap-1">
                        <Button
                            variant={mode === "channels" ? "secondary" : "outline"}
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setViewMode("channel")}
                        >
                            <Hash className="h-3.5 w-3.5 mr-1.5" />
                            Channels
                        </Button>
                        <Button
                            variant={mode === "dms" ? "secondary" : "outline"}
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setViewMode("dm")}
                        >
                            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                            DMs
                        </Button>
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 shrink-0"
                                        onClick={() => mode === "channels" ? openModal("create-channel") : setShowNewDMDialog(true)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{mode === "channels" ? "New Channel" : "New Message"}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Privacy toggles */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {isPrivateMode || (mode === "dms" && isPrivateDMs) ? (
                                <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                                <Eye className="h-3.5 w-3.5" />
                            )}
                            <span>Private Mode</span>
                        </div>
                        <Switch
                            checked={mode === "dms" ? isPrivateDMs : isPrivateMode}
                            onCheckedChange={mode === "dms" ? togglePrivateDMs : togglePrivateMode}
                            className="scale-75 origin-right"
                        />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={mode === "channels" ? "Find channels..." : "Find conversations..."}
                            className="h-8 pl-8 text-xs bg-muted/50 border-0"
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="py-2 px-2">
                    {mode === "channels" ? (
                        <ChannelList
                            categories={categories}
                            channelsByCategory={channelsByCategory}
                            filteredChannels={filteredChannels}
                            selectedChannelId={selectedChannelId}
                            collapsedCategories={collapsedCategories}
                            voiceUsers={voiceUsers}
                            onToggleCategory={toggleCategory}
                            onSelectChannel={selectChannel}
                            onVoiceChannelClick={handleVoiceChannelClick}
                            onAddChannel={() => openModal("create-channel")}
                        />
                    ) : (
                        <ConversationList
                            conversations={filteredConversations || conversations}
                            selectedId={selectedDirectId}
                            onSelect={selectDirectConversation}
                            onNewDM={() => setShowNewDMDialog(true)}
                        />
                    )}
                </div>
            </ScrollArea>

            {/* Voice Mini + User Panel */}
            <VoiceChannelMini />
            <UserStatusPanel />

            {/* New DM Dialog */}
            <NewDMDialog open={showNewDMDialog} onOpenChange={setShowNewDMDialog} />
        </div>
    )
}

// ============================================================================
// Channel List Component
// ============================================================================

interface ChannelListProps {
    categories: ChannelCategory[]
    channelsByCategory: Record<string, Channel[]>
    filteredChannels: Channel[] | null
    selectedChannelId: string | null
    collapsedCategories: Set<string>
    voiceUsers: Record<string, VoiceUser[]>
    onToggleCategory: (id: string) => void
    onSelectChannel: (id: string) => void
    onVoiceChannelClick: (channel: Channel) => void
    onAddChannel: () => void
}

function ChannelList({
    categories,
    channelsByCategory,
    filteredChannels,
    selectedChannelId,
    collapsedCategories,
    voiceUsers,
    onToggleCategory,
    onSelectChannel,
    onVoiceChannelClick,
    onAddChannel,
}: ChannelListProps) {
    if (filteredChannels) {
        return (
            <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground px-2 py-1">
                    {filteredChannels.length} result{filteredChannels.length !== 1 && "s"}
                </p>
                {filteredChannels.map((channel) => (
                    <ChannelItem
                        key={channel.id}
                        channel={channel}
                        isSelected={channel.id === selectedChannelId}
                        onClick={() => channel.type === "voice" || channel.type === "video"
                            ? onVoiceChannelClick(channel)
                            : onSelectChannel(channel.id)
                        }
                        voiceUsers={voiceUsers[channel.id]}
                    />
                ))}
            </div>
        )
    }

    const uncategorized = channelsByCategory.uncategorized || []
    const allEmpty = uncategorized.length === 0 && categories.every(c => !channelsByCategory[c.id]?.length)

    if (allEmpty) {
        return (
            <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Hash className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No channels yet</p>
                <p className="text-xs text-muted-foreground mb-3">Create your first channel</p>
                <Button variant="default" size="sm" onClick={onAddChannel}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Channel
                </Button>
            </div>
        )
    }

    return (
        <>
            {uncategorized.length > 0 && (
                <div className="mb-2">
                    {uncategorized.map((channel) => (
                        <ChannelItem
                            key={channel.id}
                            channel={channel}
                            isSelected={channel.id === selectedChannelId}
                            onClick={() => channel.type === "voice" || channel.type === "video"
                                ? onVoiceChannelClick(channel)
                                : onSelectChannel(channel.id)
                            }
                            voiceUsers={voiceUsers[channel.id]}
                        />
                    ))}
                </div>
            )}

            {categories.map((category) => {
                const categoryChannels = channelsByCategory[category.id] || []
                if (categoryChannels.length === 0) return null

                const isCollapsed = collapsedCategories.has(category.id)

                return (
                    <CategorySection
                        key={category.id}
                        category={category}
                        channels={categoryChannels}
                        isCollapsed={isCollapsed}
                        selectedChannelId={selectedChannelId}
                        onToggle={() => onToggleCategory(category.id)}
                        onChannelClick={(ch) => ch.type === "voice" || ch.type === "video"
                            ? onVoiceChannelClick(ch)
                            : onSelectChannel(ch.id)
                        }
                        onAddChannel={onAddChannel}
                        voiceUsers={voiceUsers}
                    />
                )
            })}
        </>
    )
}

// ============================================================================
// Conversation List Component (DMs)
// ============================================================================

interface ConversationListProps {
    conversations: DirectConversation[]
    selectedId: string | null
    onSelect: (id: string) => void
    onNewDM: () => void
}

function ConversationList({ conversations, selectedId, onSelect, onNewDM }: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No conversations yet</p>
                <p className="text-xs text-muted-foreground mb-3">Start a new conversation</p>
                <Button variant="default" size="sm" onClick={onNewDM}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-0.5">
            {conversations.map((conv) => (
                <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={conv.id === selectedId}
                    onClick={() => onSelect(conv.id)}
                />
            ))}
        </div>
    )
}

interface ConversationItemProps {
    conversation: DirectConversation
    isSelected: boolean
    onClick: () => void
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
    const participants = conversation.participants || []
    const displayName = conversation.name || participants.map(p => p.user?.name).filter(Boolean).join(", ") || "Unknown"
    const lastMessage = conversation.lastMessage
    const unreadCount = conversation.unreadCount || 0

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 w-full px-2 py-2 rounded-md transition-all text-left",
                isSelected
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
        >
            <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-sm">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm truncate", unreadCount > 0 && "font-semibold")}>
                        {displayName}
                    </span>
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] text-[10px]">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </div>
                {lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                        {lastMessage.content}
                    </p>
                )}
            </div>
        </button>
    )
}

// ============================================================================
// Category Section Component
// ============================================================================

interface CategorySectionProps {
    category: ChannelCategory
    channels: Channel[]
    isCollapsed: boolean
    selectedChannelId: string | null
    onToggle: () => void
    onChannelClick: (channel: Channel) => void
    onAddChannel: () => void
    voiceUsers: Record<string, VoiceUser[]>
}

function CategorySection({
    category,
    channels,
    isCollapsed,
    selectedChannelId,
    onToggle,
    onChannelClick,
    onAddChannel,
    voiceUsers,
}: CategorySectionProps) {
    return (
        <Collapsible open={!isCollapsed} className="mb-1">
            <div className="flex items-center px-1 py-1 group">
                <CollapsibleTrigger
                    onClick={onToggle}
                    className="flex items-center gap-1 flex-1 min-w-0 hover:text-foreground"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                        {category.name}
                    </span>
                </CollapsibleTrigger>

                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAddChannel()
                                }}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create Channel</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <CollapsibleContent>
                <div className="space-y-0.5">
                    {channels.map((channel) => (
                        <ChannelItem
                            key={channel.id}
                            channel={channel}
                            isSelected={channel.id === selectedChannelId}
                            onClick={() => onChannelClick(channel)}
                            voiceUsers={voiceUsers[channel.id]}
                        />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

// ============================================================================
// Channel Item Component
// ============================================================================

interface ChannelItemProps {
    channel: Channel
    isSelected: boolean
    onClick: () => void
    voiceUsers?: VoiceUser[]
}

function ChannelItem({ channel, isSelected, onClick, voiceUsers }: ChannelItemProps) {
    const Icon = channelIcons[channel.type] || Hash
    const isVoice = channel.type === "voice" || channel.type === "video" || channel.type === "stage"
    const hasUnread = channel.hasUnread
    const mentionCount = channel.mentionCount || 0

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div>
                    <button
                        onClick={onClick}
                        className={cn(
                            "flex items-center gap-2 w-full px-2 py-1.5 rounded-md group transition-all",
                            "text-left text-sm",
                            isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            hasUnread && !isSelected && "text-foreground font-medium"
                        )}
                    >
                        <Icon className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isSelected && "text-primary",
                            isVoice && "text-green-500"
                        )} />

                        <span className="flex-1 truncate">{channel.name}</span>

                        <div className="flex items-center gap-1 shrink-0">
                            {hasUnread && !isSelected && mentionCount === 0 && (
                                <span className="w-2 h-2 rounded-full bg-primary" />
                            )}

                            {mentionCount > 0 && (
                                <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                                    {mentionCount > 99 ? "99+" : mentionCount}
                                </span>
                            )}

                            {isVoice && voiceUsers && voiceUsers.length > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-green-500">
                                    <User className="h-3 w-3" />
                                    {voiceUsers.length}
                                </span>
                            )}

                            {channel.isPrivate && (
                                <Lock className="h-3 w-3 opacity-40" />
                            )}
                        </div>
                    </button>

                    {isVoice && voiceUsers && voiceUsers.length > 0 && (
                        <div className="ml-6 space-y-0.5 py-1">
                            {voiceUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-2 px-2 py-0.5 text-xs text-muted-foreground">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-[8px]">{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ContextMenuTrigger>

            <ContextMenuContent>
                <ContextMenuItem>Mark as Read</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Mute Channel</ContextMenuItem>
                <ContextMenuItem>Notification Settings</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>Edit Channel</ContextMenuItem>
                <ContextMenuItem>Copy Link</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive">Leave Channel</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default CommunicationSidebar
