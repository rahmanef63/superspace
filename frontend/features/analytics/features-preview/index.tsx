/**
 * Analytics Feature Preview
 * 
 * Uses the REAL AnalyticsPage layout with mock data
 * showing metrics, activity timeline, and member stats
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  FolderKanban,
  Activity,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface AnalyticsMockData {
  overview: {
    members: { total: number; roles: Record<string, number> }
    tasks: { total: number; completed: number; pending: number }
    projects: { total: number; active: number }
    documents: number
  }
  timeline: Array<{ date: string; count: number }>
  recentActivity: Array<{ action: string; entityType: string; timestamp: string }>
  memberActivity: Array<{ name: string; activityCount: number }>
}

function AnalyticsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as AnalyticsMockData
  const [timeRange, setTimeRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('activity')

  const completionRate = data.overview.tasks.total > 0
    ? Math.round((data.overview.tasks.completed / data.overview.tasks.total) * 100)
    : 0

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Analytics</span>
          </div>
          <Badge variant="secondary">Beta</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.overview.tasks.total}</p>
            <p className="text-[10px] text-muted-foreground">Tasks</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{completionRate}%</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              Analytics
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </h2>
            <p className="text-xs text-muted-foreground">Workspace insights and performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!interactive}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Time Range */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing data for Last 30 Days
            </div>
            <Select value={timeRange} onValueChange={(v) => interactive && setTimeRange(v)} disabled={!interactive}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.members.total}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.tasks.total}</div>
                <p className="text-xs text-muted-foreground">{data.overview.tasks.completed} completed</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                  <ArrowUp className="h-3 w-3" />
                  <span>{completionRate}% completion rate</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.projects.total}</div>
                <p className="text-xs text-muted-foreground">{data.overview.projects.active} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.documents}</div>
                <p className="text-xs text-muted-foreground">Total files</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => interactive && setActiveTab(v)}>
            <TabsList>
              <TabsTrigger value="activity" className="gap-2" disabled={!interactive}>
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2" disabled={!interactive}>
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2" disabled={!interactive}>
                <TrendingUp className="h-4 w-4" />
                Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Activity Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Activity Timeline</CardTitle>
                    <CardDescription>Workspace activity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.timeline.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-16 text-xs text-muted-foreground">{item.date}</div>
                          <div
                            className="h-6 bg-primary/80 rounded"
                            style={{ width: `${Math.min(100, (item.count / Math.max(...data.timeline.map(t => t.count))) * 100)}%` }}
                          />
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription>Latest actions in workspace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <div className="mt-1">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.entityType} • {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Members by Role</CardTitle>
                    <CardDescription>Distribution of team members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(data.overview.members.roles).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">{role}</Badge>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Active Members</CardTitle>
                    <CardDescription>Top contributors this period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.memberActivity.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                              {idx + 1}
                            </div>
                            <span className="text-sm">{member.name}</span>
                          </div>
                          <Badge variant="secondary">{member.activityCount} actions</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-bold">{completionRate}%</div>
                      <p className="text-sm text-muted-foreground">
                        {data.overview.tasks.completed} of {data.overview.tasks.total} tasks
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pending Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-bold text-yellow-500">{data.overview.tasks.pending}</div>
                      <p className="text-sm text-muted-foreground">Tasks in progress</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Completed Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-bold text-green-500">{data.overview.tasks.completed}</div>
                      <p className="text-sm text-muted-foreground">Tasks done</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'analytics',
  name: 'Analytics',
  description: 'Workspace insights and performance metrics',
  component: AnalyticsPreview,
  category: 'productivity',
  tags: ['analytics', 'metrics', 'insights', 'dashboard', 'reports'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Workspace Analytics',
      description: 'Sample analytics dashboard',
      data: {
        overview: {
          members: { total: 12, roles: { admin: 2, member: 8, guest: 2 } },
          tasks: { total: 156, completed: 98, pending: 38 },
          projects: { total: 8, active: 5 },
          documents: 234,
        },
        timeline: [
          { date: 'Dec 4', count: 12 },
          { date: 'Dec 5', count: 18 },
          { date: 'Dec 6', count: 8 },
          { date: 'Dec 7', count: 24 },
          { date: 'Dec 8', count: 15 },
          { date: 'Dec 9', count: 21 },
          { date: 'Dec 10', count: 16 },
        ],
        recentActivity: [
          { action: 'Created new project', entityType: 'Project', timestamp: '2 hours ago' },
          { action: 'Completed task', entityType: 'Task', timestamp: '4 hours ago' },
          { action: 'Updated document', entityType: 'Document', timestamp: 'Yesterday' },
          { action: 'Added team member', entityType: 'Member', timestamp: '2 days ago' },
        ],
        memberActivity: [
          { name: 'Alice Johnson', activityCount: 45 },
          { name: 'Bob Smith', activityCount: 38 },
          { name: 'Charlie Brown', activityCount: 32 },
          { name: 'Diana Ross', activityCount: 28 },
        ],
      },
    },
  ],
})
