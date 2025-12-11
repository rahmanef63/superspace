/**
 * Overview Feature Preview
 * 
 * Uses the REAL OverviewView layout structure with mock data
 * to show an authentic dashboard experience
 */

"use client"

import * as React from 'react'
import { Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import { OverviewView } from '../OverviewView'
import { DemoOverviewView } from './DemoOverviewView'
import type { OverviewData } from '../types'

function OverviewPreview({ mockData, compact }: FeaturePreviewProps) {
  const data = mockData.data as unknown as OverviewData

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
            <p className="text-lg font-bold">{data.members?.total ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Members</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md text-center">
            <p className="text-lg font-bold">{data.tasks?.total ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Tasks</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-background">
      <div className="flex-1 overflow-auto">
        <DemoOverviewView mockData={data} />
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
        members: {
          total: 12,
          roles: { admins: 2, members: 8, guests: 2 }
        },
        tasks: { total: 48, completed: 32 },
        projects: { total: 8, active: 5 },
        documents: 156,
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
