"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  Activity,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react"

interface OverviewViewProps {
  workspaceId?: Id<"workspaces"> | null
}

export function OverviewView({ workspaceId }: OverviewViewProps) {
  // Query workspace data
  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    workspaceId ? { workspaceId } : "skip"
  )

  const members = useQuery(
    api.workspace.workspaces.getWorkspaceMembers,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mock data for demonstration (replace with real queries)
  const stats = {
    totalMessages: 1247,
    activeUsers: members?.length || 0,
    documentsCreated: 42,
    tasksCompleted: 18,
  }

  const recentActivity = [
    {
      id: "1",
      user: "John Doe",
      action: "created a new document",
      target: "Project Proposal",
      time: "5 minutes ago",
      icon: FileText,
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "completed task",
      target: "Review code changes",
      time: "15 minutes ago",
      icon: CheckCircle2,
    },
    {
      id: "3",
      user: "Mike Johnson",
      action: "sent a message in",
      target: "#general",
      time: "30 minutes ago",
      icon: MessageSquare,
    },
    {
      id: "4",
      user: "Sarah Wilson",
      action: "joined the workspace",
      target: "",
      time: "1 hour ago",
      icon: Users,
    },
  ]

  const upcomingEvents = [
    {
      id: "1",
      title: "Team Standup",
      time: "Today at 10:00 AM",
      attendees: 8,
    },
    {
      id: "2",
      title: "Project Review",
      time: "Tomorrow at 2:00 PM",
      attendees: 5,
    },
    {
      id: "3",
      title: "Client Meeting",
      time: "Friday at 3:30 PM",
      attendees: 12,
    },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{workspace?.name ? ` to ${workspace.name}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your workspace today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">+2 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documentsCreated}</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
              <p className="text-xs text-muted-foreground">+8 from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-2">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        {activity.target && (
                          <span className="font-medium">{activity.target}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Your schedule for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.attendees}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Start a Chat</div>
                    <div className="text-xs text-muted-foreground">
                      Message your team
                    </div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Create Document</div>
                    <div className="text-xs text-muted-foreground">
                      Write and collaborate
                    </div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Invite Members</div>
                    <div className="text-xs text-muted-foreground">
                      Grow your team
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
