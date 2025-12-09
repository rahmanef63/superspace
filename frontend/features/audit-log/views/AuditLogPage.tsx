"use client"

import React, { useState } from "react"
import { History, Filter, Download, User, FileText, Settings, Trash2, RefreshCcw } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useAuditLog } from "../hooks/useAuditLog"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AuditLogPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <FileText className="h-4 w-4 text-green-500" />,
  update: <Settings className="h-4 w-4 text-blue-500" />,
  delete: <Trash2 className="h-4 w-4 text-red-500" />,
  login: <User className="h-4 w-4 text-purple-500" />,
}

/**
 * Audit Log Page Component
 */
export default function AuditLogPage({ workspaceId }: AuditLogPageProps) {
  const [actionFilter, setActionFilter] = useState<string>("")
  const { isLoading, logs, stats } = useAuditLog(workspaceId, {
    action: actionFilter || undefined,
  })

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view audit logs
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6 gap-6">
      <FeatureHeader
        icon={History}
        title="Audit Log"
        subtitle="Activity trail and compliance logs"
        primaryAction={{
          label: "Export",
          icon: Download,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "refresh",
            label: "Refresh",
            icon: RefreshCcw,
            onClick: () => {},
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {},
          },
        ]}
      />

      {/* Filters */}
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            <SelectItem value="create">Created</SelectItem>
            <SelectItem value="update">Updated</SelectItem>
            <SelectItem value="delete">Deleted</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Search logs..." className="max-w-xs" />
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{stats.total || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{stats.today || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Unique Users</p>
              <p className="text-2xl font-bold">{stats.uniqueUsers || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logs List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <History className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="font-medium">No audit logs found</h3>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as it happens
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <Card key={log._id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar>
                    <AvatarFallback>
                      {log.userName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {ACTION_ICONS[log.action?.split(".")[1]] || <FileText className="h-4 w-4" />}
                      <span className="font-medium">{log.userName || "Unknown"}</span>
                      <span className="text-muted-foreground">{log.action}</span>
                      {log.entityType && (
                        <Badge variant="outline">{log.entityType}</Badge>
                      )}
                    </div>
                    {log.metadata && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {JSON.stringify(log.metadata).substring(0, 100)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.timestamp || log._creationTime).toLocaleString()}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
