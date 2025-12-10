/**
 * Overview Feature Preview
 * 
 * Uses the REAL OverviewView layout structure with mock data
 * to show an authentic dashboard experience
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  Activity,
  Users,
  CheckSquare,
  FolderKanban,
  FileText,
  TrendingUp,
  RefreshCcw,
  Settings,
  Download,
  UserPlus,
  Calendar,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface OverviewMockData {
  workspaceName: string
  stats: {
    members: { total: number; roles: Record<string, number> }
    tasks: { total: number; completed: number }
    projects: { total: number; active: number }
    documents: number
  }
  recentActivity: Array<{
    action: string
    timestamp: string
    user: string
  }>
}

function OverviewPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as OverviewMockData
  const [timeRange, setTimeRange] = useState('30d')

  const completionRate = data.stats.tasks.total > 0
    ? Math.round((data.stats.tasks.completed / data.stats.tasks.total) * 100)
    : 0

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Overview</span>
          </div>
          <Badge variant="secondary">{data.workspaceName}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.members.total}</p>
            <p className="text-[10px] text-muted-foreground">Members</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.stats.tasks.total}</p>
            <p className="text-[10px] text-muted-foreground">Tasks</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div>
          <h1 className="text-xl font-semibold">{data.workspaceName}</h1>
          <p className="text-sm text-muted-foreground">Workspace overview and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled={!interactive}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time range:</span>
            <Select
              value={timeRange}
              onValueChange={(v) => interactive && setTimeRange(v)}
              disabled={!interactive}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">
            Updated a few seconds ago
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.members.total}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
              <div className="flex gap-1 mt-2">
                {Object.entries(data.stats.members.roles).map(([role, count]) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {count} {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.tasks.total}</div>
              <p className="text-xs text-muted-foreground">{data.stats.tasks.completed} completed</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>{completionRate}% completion rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <FolderKanban className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.projects.total}</div>
              <p className="text-xs text-muted-foreground">{data.stats.projects.active} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.documents}</div>
              <p className="text-xs text-muted-foreground">Total documents</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="p-1.5 rounded-full bg-muted">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Composition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Team Composition
              </CardTitle>
              <CardDescription>Members by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.stats.members.roles).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="capitalize">{role}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="justify-start h-auto py-4" disabled={!interactive}>
                <div className="flex items-center gap-3">
                  <CheckSquare className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Create Task</div>
                    <div className="text-xs text-muted-foreground">Add a new task</div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" disabled={!interactive}>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Create Document</div>
                    <div className="text-xs text-muted-foreground">Write and collaborate</div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4" disabled={!interactive}>
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Invite Members</div>
                    <div className="text-xs text-muted-foreground">Grow your team</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'overview',
  name: 'Overview',
  description: 'Dashboard overview with analytics and insights',
  component: OverviewPreview,
  category: 'productivity',
  tags: ['dashboard', 'analytics', 'overview', 'stats'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Workspace Dashboard',
      description: 'Sample workspace analytics',
      data: {
        workspaceName: 'Acme Corp Workspace',
        stats: {
          members: {
            total: 12,
            roles: { admins: 2, members: 8, guests: 2 }
          },
          tasks: { total: 48, completed: 32 },
          projects: { total: 8, active: 5 },
          documents: 156,
        },
        recentActivity: [
          { action: 'Created new project "Q1 Planning"', user: 'Alice', timestamp: '2 hours ago' },
          { action: 'Completed task "Review designs"', user: 'Bob', timestamp: '4 hours ago' },
          { action: 'Updated document "API Reference"', user: 'Charlie', timestamp: 'Yesterday' },
          { action: 'Invited new member Diana', user: 'Alice', timestamp: '2 days ago' },
          { action: 'Created 3 new tasks', user: 'Eve', timestamp: '3 days ago' },
        ],
      },
    },
  ],
})
