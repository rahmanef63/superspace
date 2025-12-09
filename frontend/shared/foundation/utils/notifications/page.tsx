"use client"

import React, { useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Bell,
  CheckCheck,
  Settings,
  Trash2,
  Filter,
  MessageSquare,
  FileText,
  FolderKanban,
  AtSign,
  AlertCircle,
  Clock,
  MoreHorizontal,
  Check,
  X,
  RefreshCw,
} from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface NotificationsPageProps {
  workspaceId: Id<"workspaces"> | null
}

const NOTIFICATION_TYPES = [
  { value: "all", label: "All", icon: Bell },
  { value: "mention", label: "Mentions", icon: AtSign },
  { value: "task", label: "Tasks", icon: CheckCheck },
  { value: "document", label: "Documents", icon: FileText },
  { value: "project", label: "Projects", icon: FolderKanban },
  { value: "comment", label: "Comments", icon: MessageSquare },
  { value: "system", label: "System", icon: AlertCircle },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "mention": return AtSign
    case "task": return CheckCheck
    case "document": return FileText
    case "project": return FolderKanban
    case "comment": return MessageSquare
    case "system": return AlertCircle
    default: return Bell
  }
}

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function NotificationsPage({ workspaceId }: NotificationsPageProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Queries
  const notifications = useQuery(
    api.features.notifications.queries.getMyNotifications,
    workspaceId ? { workspaceId, type: activeTab === "all" ? undefined : activeTab as any } : "skip"
  )

  const unreadCount = useQuery(
    api.features.notifications.queries.getUnreadCount,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations
  const markAsRead = useMutation(api.features.notifications.mutations.markAsRead)
  const markAllAsRead = useMutation(api.features.notifications.mutations.markAllAsRead)
  const deleteNotification = useMutation(api.features.notifications.mutations.deleteNotification)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view notifications
          </p>
        </div>
      </div>
    )
  }

  const handleMarkAsRead = async (notificationId: Id<"systemNotifications">) => {
    try {
      await markAsRead({ notificationId })
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ workspaceId })
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleDelete = async (notificationId: Id<"systemNotifications">) => {
    try {
      await deleteNotification({ notificationId })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => deleteNotification({ notificationId: id as Id<"systemNotifications"> }))
      )
      setSelectedIds([])
      setIsSelectionMode(false)
    } catch (error) {
      console.error("Failed to delete notifications:", error)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const notificationList = notifications || []
  const unread = unreadCount || 0

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Bell}
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        primaryAction={{
          label: "Mark All Read",
          icon: CheckCheck,
          onClick: handleMarkAllAsRead,
          disabled: unread === 0,
        }}
        secondaryActions={[
          {
            id: "toggle-select",
            label: isSelectionMode ? "Cancel" : "Select",
            icon: isSelectionMode ? X : Check,
            onClick: () => {
              setIsSelectionMode(!isSelectionMode)
              setSelectedIds([])
            },
          },
          {
            id: "notifications-settings",
            label: "Settings",
            icon: Settings,
            href: "/dashboard/settings/notifications",
          },
        ]}
      />

      {/* Filter Tabs */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4">
            <TabsList className="h-12 justify-start bg-transparent gap-2 p-0">
              {NOTIFICATION_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="gap-2 data-[state=active]:bg-muted"
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Selection Actions Bar */}
      {isSelectionMode && selectedIds.length > 0 && (
        <div className="border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedIds.forEach((id) =>
                    handleMarkAsRead(id as Id<"systemNotifications">)
                  )
                  setSelectedIds([])
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark Read
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-auto">
        {notifications === undefined ? (
          <div className="flex h-full items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notificationList.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-medium">No notifications</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeTab === "all"
                ? "You're all caught up!"
                : `No ${activeTab} notifications`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notificationList.map((notification: any) => {
              const Icon = getNotificationIcon(notification.type)
              const isSelected = selectedIds.includes(notification._id)

              return (
                <div
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-4 px-4 py-4 hover:bg-muted/50 transition-colors",
                    !notification.isRead && "bg-primary/5",
                    isSelected && "bg-primary/10"
                  )}
                >
                  {isSelectionMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(notification._id)}
                      className="mt-1"
                    />
                  )}

                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      notification.isRead
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium truncate",
                            notification.isRead && "text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification._creationTime)}
                          </span>
                          {notification.actor && (
                            <span className="text-xs text-muted-foreground">
                              by {notification.actor.name || notification.actor.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.isRead && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          {notification.actionUrl && (
                            <DropdownMenuItem asChild>
                              <a href={notification.actionUrl}>
                                <FileText className="mr-2 h-4 w-4" />
                                View details
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(notification._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
