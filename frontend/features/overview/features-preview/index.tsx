/**
 * Overview Feature Preview
 * 
 * Mock preview showing the overview/dashboard view
 */

"use client"

import * as React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Clock,
  Star,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { defineFeaturePreview } from '@/frontend/shared/features/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/features/preview'

// Mock data types
interface OverviewMockData {
  stats: {
    members: number
    messages: number
    documents: number
    tasks: number
  }
  recentActivity: Array<{
    id: string
    user: string
    avatar: string
    action: string
    target: string
    time: string
  }>
  quickStats: Array<{
    label: string
    value: number
    change: number
    icon: string
  }>
}

function OverviewPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as OverviewMockData

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {data.quickStats.slice(0, 4).map((stat, i) => (
          <div key={i} className="p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-lg font-bold">{stat.value}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Members</span>
            </div>
            <div className="text-2xl font-bold mt-1">{data.stats.members}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Messages</span>
            </div>
            <div className="text-2xl font-bold mt-1">{data.stats.messages}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Documents</span>
            </div>
            <div className="text-2xl font-bold mt-1">{data.stats.documents}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Tasks</span>
            </div>
            <div className="text-2xl font-bold mt-1">{data.stats.tasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>{activity.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'overview',
  name: 'Overview',
  description: 'Dashboard overview with stats and recent activity',
  component: OverviewPreview,
  category: 'productivity',
  tags: ['dashboard', 'stats', 'activity'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Default View',
      description: 'Standard overview with moderate activity',
      data: {
        stats: {
          members: 12,
          messages: 342,
          documents: 56,
          tasks: 23,
        },
        recentActivity: [
          { id: '1', user: 'Alice', avatar: '', action: 'created', target: 'Project Plan', time: '2 min ago' },
          { id: '2', user: 'Bob', avatar: '', action: 'commented on', target: 'Design Doc', time: '5 min ago' },
          { id: '3', user: 'Charlie', avatar: '', action: 'completed', target: 'Task #42', time: '10 min ago' },
        ],
        quickStats: [
          { label: 'Active', value: 8, change: 12, icon: 'users' },
          { label: 'Tasks', value: 23, change: -5, icon: 'check' },
          { label: 'Messages', value: 342, change: 28, icon: 'message' },
          { label: 'Files', value: 56, change: 8, icon: 'file' },
        ],
      },
    },
    {
      id: 'busy',
      name: 'Busy Workspace',
      description: 'High activity workspace',
      data: {
        stats: {
          members: 48,
          messages: 2341,
          documents: 234,
          tasks: 89,
        },
        recentActivity: [
          { id: '1', user: 'Team Lead', avatar: '', action: 'assigned', target: 'Sprint Tasks', time: 'Just now' },
          { id: '2', user: 'Developer', avatar: '', action: 'pushed', target: '15 commits', time: '1 min ago' },
          { id: '3', user: 'Designer', avatar: '', action: 'uploaded', target: 'New mockups', time: '3 min ago' },
          { id: '4', user: 'PM', avatar: '', action: 'updated', target: 'Roadmap', time: '5 min ago' },
        ],
        quickStats: [
          { label: 'Active', value: 32, change: 45, icon: 'users' },
          { label: 'Tasks', value: 89, change: -12, icon: 'check' },
          { label: 'Messages', value: 2341, change: 156, icon: 'message' },
          { label: 'Files', value: 234, change: 34, icon: 'file' },
        ],
      },
    },
    {
      id: 'empty',
      name: 'New Workspace',
      description: 'Fresh workspace with minimal data',
      data: {
        stats: {
          members: 1,
          messages: 0,
          documents: 2,
          tasks: 0,
        },
        recentActivity: [
          { id: '1', user: 'You', avatar: '', action: 'created', target: 'this workspace', time: 'Just now' },
        ],
        quickStats: [
          { label: 'Active', value: 1, change: 0, icon: 'users' },
          { label: 'Tasks', value: 0, change: 0, icon: 'check' },
          { label: 'Messages', value: 0, change: 0, icon: 'message' },
          { label: 'Files', value: 2, change: 0, icon: 'file' },
        ],
      },
    },
  ],
})
