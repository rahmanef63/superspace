/**
 * Projects Feature Preview
 * 
 * Mock preview showing projects management interface
 */

"use client"

import * as React from 'react'
import { FolderKanban, Plus, MoreHorizontal, Calendar, Users, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Project {
  id: string
  name: string
  status: 'active' | 'on-hold' | 'completed'
  progress: number
  dueDate: string
  members: number
  color: string
}

interface ProjectsMockData {
  projects: Project[]
  stats: {
    active: number
    completed: number
    total: number
  }
}

const statusConfig = {
  active: { color: 'bg-green-500/10 text-green-500', icon: Activity },
  'on-hold': { color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
  completed: { color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle },
}

function ProjectsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as ProjectsMockData

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Projects</span>
          <Badge variant="secondary">{data.stats.active} active</Badge>
        </div>
        {data.projects.slice(0, 2).map((project) => (
          <div key={project.id} className="space-y-1 p-2 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="text-xs truncate flex-1">{project.name}</span>
            </div>
            <Progress value={project.progress} className="h-1" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          <h3 className="font-semibold">Projects</h3>
        </div>
        <Button size="sm" className="gap-1" disabled={!interactive}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-green-500/5">
          <CardContent className="p-3 text-center">
            <Activity className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.active}</div>
            <div className="text-[10px] text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5">
          <CardContent className="p-3 text-center">
            <CheckCircle className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <div className="text-lg font-bold">{data.stats.completed}</div>
            <div className="text-[10px] text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <FolderKanban className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{data.stats.total}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <ScrollArea className="h-[260px]">
          <div className="divide-y">
            {data.projects.map((project) => {
              const StatusIcon = statusConfig[project.status].icon
              return (
                <div 
                  key={project.id} 
                  className="p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs gap-1", statusConfig[project.status].color)}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {project.dueDate}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {project.members}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={project.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{project.progress}%</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'projects',
  name: 'Projects',
  description: 'Project management and tracking',
  component: ProjectsPreview,
  category: 'productivity',
  tags: ['projects', 'management', 'tracking', 'teams'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Projects',
      description: 'Active projects',
      data: {
        stats: { active: 4, completed: 8, total: 12 },
        projects: [
          { id: '1', name: 'Website Redesign', status: 'active', progress: 65, dueDate: 'Dec 15', members: 5, color: '#3B82F6' },
          { id: '2', name: 'Mobile App v2', status: 'active', progress: 40, dueDate: 'Jan 20', members: 8, color: '#8B5CF6' },
          { id: '3', name: 'API Integration', status: 'on-hold', progress: 25, dueDate: 'TBD', members: 3, color: '#F59E0B' },
          { id: '4', name: 'Q4 Marketing', status: 'completed', progress: 100, dueDate: 'Nov 30', members: 4, color: '#10B981' },
          { id: '5', name: 'Security Audit', status: 'active', progress: 80, dueDate: 'Dec 1', members: 2, color: '#EF4444' },
        ],
      },
    },
  ],
})
