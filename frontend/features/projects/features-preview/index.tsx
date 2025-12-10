/**
 * Projects Feature Preview
 * 
 * Shows what the upcoming Projects feature will look like
 * with project cards, milestones, and team collaboration
 */

"use client"

import * as React from 'react'
import { useState } from 'react'
import {
  FolderKanban,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Users,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'on-hold' | 'completed'
  progress: number
  dueDate: string
  teamSize: number
  tasks: { total: number; completed: number }
  starred: boolean
}

interface ProjectsMockData {
  stats: { total: number; active: number; completed: number; onHold: number }
  projects: Project[]
  view: 'grid' | 'list'
}

function ProjectsPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
  const data = mockData.data as unknown as ProjectsMockData
  const [view, setView] = useState(data.view)

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'on-hold': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-muted'
    }
  }

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'active': return { text: 'Active', variant: 'default' as const }
      case 'on-hold': return { text: 'On Hold', variant: 'secondary' as const }
      case 'completed': return { text: 'Completed', variant: 'outline' as const }
      default: return { text: status, variant: 'secondary' as const }
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Projects</span>
          </div>
          <Badge variant="secondary">{data.stats.total} projects</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-green-500/10 rounded-md text-center">
            <p className="text-lg font-bold text-green-600">{data.stats.active}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="p-2 bg-yellow-500/10 rounded-md text-center">
            <p className="text-lg font-bold text-yellow-600">{data.stats.onHold}</p>
            <p className="text-[10px] text-muted-foreground">On Hold</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-md text-center">
            <p className="text-lg font-bold text-blue-600">{data.stats.completed}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
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
          <FolderKanban className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Projects</h2>
            <p className="text-xs text-muted-foreground">Manage your workspace projects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-muted/50 p-1 rounded-lg border">
            {[
              { id: 'grid', icon: LayoutGrid },
              { id: 'list', icon: List },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === id ? "bg-background shadow-sm" : "hover:bg-muted"
                )}
                onClick={() => interactive && setView(id as any)}
                disabled={!interactive}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <Button size="sm" className="gap-2" disabled={!interactive}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/20">
        <div className="text-center">
          <p className="text-2xl font-bold">{data.stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500">{data.stats.active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-500">{data.stats.onHold}</p>
          <p className="text-xs text-muted-foreground">On Hold</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-500">{data.stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {data.projects.map((project) => {
              const statusBadge = getStatusBadge(project.status)
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(project.status))} />
                        <CardTitle className="text-base">{project.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {project.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!interactive}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          {project.tasks.completed}/{project.tasks.total}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.teamSize}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.dueDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={statusBadge.variant} className="text-xs">{statusBadge.text}</Badge>
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(3, project.teamSize) }).map((_, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-[10px]">{String.fromCharCode(65 + i)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.teamSize > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                            +{project.teamSize - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {data.projects.map((project) => {
              const statusBadge = getStatusBadge(project.status)
              return (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className={cn("w-3 h-3 rounded-full shrink-0", getStatusColor(project.status))} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{project.name}</p>
                      {project.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>
                    <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {project.dueDate}
                    </div>
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(3, project.teamSize) }).map((_, i) => (
                        <Avatar key={i} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-[10px]">{String.fromCharCode(65 + i)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" disabled={!interactive}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Register the preview
export default defineFeaturePreview({
  featureId: 'projects',
  name: 'Projects',
  description: 'Project management with milestones and team collaboration',
  component: ProjectsPreview,
  category: 'productivity',
  tags: ['projects', 'milestones', 'team', 'collaboration', 'planning'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Project Portfolio',
      description: 'Sample project list',
      data: {
        view: 'grid',
        stats: { total: 8, active: 5, completed: 2, onHold: 1 },
        projects: [
          {
            id: '1',
            name: 'Website Redesign',
            description: 'Complete redesign of the company website with modern UI/UX',
            status: 'active',
            progress: 68,
            dueDate: 'Dec 31',
            teamSize: 5,
            tasks: { total: 24, completed: 16 },
            starred: true
          },
          {
            id: '2',
            name: 'Mobile App v2.0',
            description: 'Major update with new features and performance improvements',
            status: 'active',
            progress: 45,
            dueDate: 'Jan 15',
            teamSize: 8,
            tasks: { total: 42, completed: 19 },
            starred: true
          },
          {
            id: '3',
            name: 'API Migration',
            description: 'Migrate to new API architecture with better scalability',
            status: 'active',
            progress: 82,
            dueDate: 'Dec 20',
            teamSize: 3,
            tasks: { total: 18, completed: 15 },
            starred: false
          },
          {
            id: '4',
            name: 'Documentation Update',
            description: 'Update all technical documentation and user guides',
            status: 'on-hold',
            progress: 35,
            dueDate: 'Jan 30',
            teamSize: 2,
            tasks: { total: 12, completed: 4 },
            starred: false
          },
          {
            id: '5',
            name: 'Q3 Marketing Campaign',
            description: 'Social media and content marketing for Q3',
            status: 'completed',
            progress: 100,
            dueDate: 'Dec 1',
            teamSize: 4,
            tasks: { total: 28, completed: 28 },
            starred: false
          },
        ],
      },
    },
  ],
})
